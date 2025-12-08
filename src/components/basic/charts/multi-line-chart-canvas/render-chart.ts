import { type LineSeries } from '../multi-line-chart/types';
import {
  createScalesForAxes,
  updateScalesForAxes,
  calculateGridLeftShift,
  prepareChartData,
  type Scales,
} from '../multi-line-chart/index';
import { calculateTimeStep } from '../multi-line-chart/data-calculations';
import { calculateMaxValue } from '../multi-line-chart/values';
import {
  resolveChartColors,
  resolveCSSVariable,
  type CSSVariableCache,
} from '../utils/canvas-helpers';
import { drawGrid, drawAxes, drawLine, drawLegend } from './drawing';

const DEFAULT_X_AXIS_TICKS = 5;
const DEFAULT_Y_AXIS_TICKS = 5;

interface RenderChartConfig {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  lines: LineSeries[];
  chartColors: Record<string, string>;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  showGrid: boolean;
  showLegend: boolean;
  strokeWidth: number;
  yDomain?: [number, number];
  cachedScales?: Scales | null;
  cachedResolvedColors?: Record<string, string> | null;
  cachedLinesForLegend?: LineSeries[];
  cssVariableCache?: CSSVariableCache;
  timeExtentCache?: { allTimes: number[]; timeIntervals: number[] };
  animatedTranslate?: number;
  precomputedTimeExtent?: [number, number] | null;
}

export const renderMultiLineChart = ({
  ctx,
  canvas,
  lines,
  chartColors,
  margin,
  chartWidth,
  chartHeight,
  showGrid,
  showLegend,
  strokeWidth,
  yDomain,
  cachedScales,
  cachedResolvedColors,
  cachedLinesForLegend,
  cssVariableCache,
  timeExtentCache,
  animatedTranslate,
  precomputedTimeExtent,
}: RenderChartConfig): {
  scales: Scales;
  resolvedColors: Record<string, string>;
} => {
  if (!lines.length || lines.some((line) => !line.data?.length)) {
    const defaultScales =
      cachedScales ||
      createScalesForAxes({
        timeExtent: [Date.now(), Date.now()],
        maxValue: 0,
        chartWidth,
        chartHeight,
        margin,
        yDomain,
      });
    return {
      scales: defaultScales,
      resolvedColors: cachedResolvedColors || {},
    };
  }

  const resolvedChartColors = resolveChartColors(
    chartColors,
    canvas,
    cssVariableCache,
    cachedResolvedColors || undefined,
  );

  // Используем предвычисленный timeExtent если передан, иначе вычисляем через prepareChartData
  let timeExtent: [number, number];
  let timeStep: number;
  let maxValue: number;
  let shiftOffset = 0;

  if (precomputedTimeExtent) {
    // Используем предвычисленный timeExtent
    timeExtent = precomputedTimeExtent;
    timeStep = calculateTimeStep(lines[0]?.data || [], timeExtentCache?.timeIntervals);
    maxValue = calculateMaxValue({ lines });
  } else {
    // Вычисляем через prepareChartData (для обратной совместимости)
    const chartData = prepareChartData({
      lines,
      prevMetadata: { timeExtent: null, timeStep: 0 },
      isInitialRender: true,
      chartWidth,
      timeExtentCache,
    });
    timeExtent = chartData.timeExtent;
    timeStep = chartData.timeStep;
    maxValue = chartData.maxValue;
    shiftOffset = chartData.shiftOffset;
  }

  const finalShiftOffset = animatedTranslate !== undefined ? animatedTranslate : shiftOffset;

  const scales =
    cachedScales ||
    createScalesForAxes({
      timeExtent,
      maxValue,
      chartWidth,
      chartHeight,
      margin,
      yDomain,
    });
  if (cachedScales)
    updateScalesForAxes(scales, { timeExtent, maxValue, chartWidth, chartHeight, margin, yDomain });

  const gridLeftShift = calculateGridLeftShift({
    timeStep,
    timeExtent,
    chartWidth,
  });

  // Apply margin transform once for all drawing operations
  ctx.save();
  ctx.translate(margin.left, margin.top);

  if (showGrid) {
    drawGrid(
      ctx,
      scales.xAxisScale,
      scales.yScale,
      chartWidth,
      chartHeight,
      margin,
      gridLeftShift - finalShiftOffset,
      resolvedChartColors,
    );
  }

  const linesForLegend = cachedLinesForLegend || [];
  linesForLegend.length = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line?.data?.length) continue;

    const resolvedColor = resolveCSSVariable(line.color, canvas, cssVariableCache);
    drawLine(ctx, line.data, scales.xScale, scales.yScale, resolvedColor, strokeWidth, finalShiftOffset);

    if (showLegend && line.label) {
      if (!linesForLegend[i]) linesForLegend[i] = { data: [], color: '', label: '' };
      linesForLegend[i].data = line.data;
      linesForLegend[i].color = resolvedColor;
      linesForLegend[i].label = line.label;
    }
  }

  drawAxes(
    ctx,
    scales.xAxisScale,
    scales.yScale,
    chartWidth,
    chartHeight,
    margin,
    resolvedChartColors,
    DEFAULT_X_AXIS_TICKS,
    DEFAULT_Y_AXIS_TICKS,
  );

  if (showLegend && linesForLegend.length) {
    drawLegend(ctx, linesForLegend, chartWidth, resolvedChartColors);
  }

  ctx.restore();

  return {
    scales,
    resolvedColors: resolvedChartColors,
  };
};
