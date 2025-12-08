import { type RealTimeSingleLineDataRef } from '../real-time-single-line-chart-canvas';
import { createScalesForAxes, updateScalesForAxes, type Scales } from '../multi-line-chart/index';
import {
  resolveChartColors,
  resolveCSSVariable,
  drawAxes,
  type CSSVariableCache,
} from '../utils/canvas-helpers';

interface RenderSingleLineChartConfig {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  dataRef: React.RefObject<RealTimeSingleLineDataRef>;
  chartColors: Record<string, string>;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  yDomain: [number, number];
  timeWindowMs: number;
  strokeColor?: string;
  strokeWidth: number;
  xTicks: number;
  yTicks: number;
  cachedScales?: Scales | null;
  cachedResolvedColors?: Record<string, string> | null;
  cssVariableCache?: CSSVariableCache;
}

export const renderSingleLineChart = ({
  ctx,
  canvas,
  dataRef,
  chartColors,
  margin,
  chartWidth,
  chartHeight,
  yDomain,
  timeWindowMs,
  strokeColor,
  strokeWidth,
  xTicks,
  yTicks,
  cachedScales,
  cachedResolvedColors,
  cssVariableCache,
}: RenderSingleLineChartConfig): {
  scales: Scales;
  resolvedColors: Record<string, string>;
} => {
  const data = dataRef.current;
  if (!data || data.size < 2) {
    const defaultTime = Date.now();
    const defaultTimeExtent: [number, number] = [defaultTime, defaultTime];
    const defaultScales =
      cachedScales ||
      createScalesForAxes({
        timeExtent: defaultTimeExtent,
        maxValue: 0,
        chartWidth,
        chartHeight,
        margin: { right: margin.right },
        yDomain,
      });
    return {
      scales: defaultScales,
      resolvedColors: cachedResolvedColors || {},
    };
  }

  const { values, times, head, size, maxPoints } = data;

  const currentTime = Date.now();
  const t0 = currentTime - timeWindowMs;
  const t1 = currentTime;
  const timeExtent: [number, number] = [t0, t1];

  const resolvedChartColors = resolveChartColors(
    chartColors,
    canvas,
    cssVariableCache,
    cachedResolvedColors || undefined,
  );

  const scales =
    cachedScales ||
    createScalesForAxes({
      timeExtent,
      maxValue: 0,
      chartWidth,
      chartHeight,
      margin: { right: margin.right },
      yDomain,
    });

  if (cachedScales) {
    updateScalesForAxes(scales, {
      timeExtent,
      maxValue: 0,
      chartWidth,
      chartHeight,
      margin: { right: margin.right },
      yDomain,
    });
  }

  const resolvedStrokeColor = strokeColor
    ? resolveCSSVariable(strokeColor, canvas, cssVariableCache)
    : resolveCSSVariable(resolvedChartColors.primary, canvas, cssVariableCache);

  ctx.save();
  ctx.translate(margin.left, margin.top);

  ctx.strokeStyle = resolvedStrokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();

  let isFirstPoint = true;
  for (let i = 0; i < size; i++) {
    const idx = (head - size + i + maxPoints) % maxPoints;
    const pointTime = times[idx];

    if (pointTime >= t0 && pointTime <= t1) {
      const x = scales.xAxisScale(new Date(pointTime));
      const y = scales.yScale(values[idx]);

      if (isFirstPoint) {
        ctx.moveTo(x, y);
        isFirstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
  }

  ctx.stroke();

  drawAxes({
    ctx,
    xAxisScale: scales.xAxisScale,
    yScale: scales.yScale,
    chartWidth,
    chartHeight,
    margin,
    resolvedChartColors,
    xTicks,
    yTicks,
  });

  ctx.restore();

  return {
    scales,
    resolvedColors: resolvedChartColors,
  };
};

