import { type LineSeries } from '../multi-line-chart/types';
import {
  createScalesForAxes,
  calculateGridLeftShift,
  createLineGenerator,
  prepareChartData,
} from '../multi-line-chart/index';
import { resolveChartColors, resolveCSSVariable } from '../utils/canvas-helpers';
import { drawGrid, drawAxes, drawLine, drawLegend } from './drawing';

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
}: RenderChartConfig): void => {
  if (lines.length === 0 || lines.some((line) => line.data.length === 0)) return;

  const resolvedChartColors = resolveChartColors(chartColors, canvas);

  const chartData = prepareChartData({
    lines,
    prevMetadata: { timeExtent: null, timeStep: 0 },
    isInitialRender: true,
    chartWidth,
  });

  const { timeExtent, timeStep, maxValue, shiftOffset } = chartData;

  const { xScale, xAxisScale, yScale } = createScalesForAxes({
    timeExtent,
    maxValue,
    chartWidth,
    chartHeight,
    margin,
    yDomain,
  });

  const gridLeftShift = calculateGridLeftShift({
    timeStep,
    timeExtent,
    chartWidth,
  });

  ctx.save();
  ctx.translate(margin.left, margin.top);

  const lineGenerator = createLineGenerator({ xScale, yScale });

  if (showGrid) {
    drawGrid(
      ctx,
      xAxisScale,
      yScale,
      chartWidth,
      chartHeight,
      margin,
      gridLeftShift,
      resolvedChartColors,
    );
  }

  const linesWithResolvedColors = lines.map((line) => {
    const resolvedColor = resolveCSSVariable(line.color, canvas);
    drawLine(ctx, line.data, lineGenerator, resolvedColor, strokeWidth, shiftOffset);
    return { ...line, color: resolvedColor };
  });

  drawAxes(ctx, xAxisScale, yScale, chartWidth, chartHeight, margin, resolvedChartColors);

  if (showLegend && linesWithResolvedColors.length > 0) {
    drawLegend(ctx, linesWithResolvedColors, chartWidth, resolvedChartColors);
  }

  ctx.restore();
};
