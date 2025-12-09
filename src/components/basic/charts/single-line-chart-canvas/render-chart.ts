import { type RealTimeSingleLineDataRef } from '../real-time-single-line-chart-canvas';
import { createScalesForAxes, updateScalesForAxes, type Scales } from '../multi-line-chart/index';
import { drawAxes } from '../utils/canvas-helpers';

interface RenderSingleLineChartConfig {
  ctx: CanvasRenderingContext2D;
  dataRef: React.RefObject<RealTimeSingleLineDataRef>;
  resolvedColors: Record<string, string>;
  resolvedStrokeColor: string;
  resolvedHighlightStrokeColor?: string;
  highlightThreshold?: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  yDomain: [number, number];
  timeWindowMs: number;
  strokeWidth: number;
  xTicks: number;
  yTicks: number;
  cachedScales?: Scales | null;
}

export const renderSingleLineChart = ({
  ctx,
  dataRef,
  resolvedColors,
  resolvedStrokeColor,
  resolvedHighlightStrokeColor,
  highlightThreshold,
  margin,
  chartWidth,
  chartHeight,
  yDomain,
  timeWindowMs,
  strokeWidth,
  xTicks,
  yTicks,
  cachedScales,
}: RenderSingleLineChartConfig): {
  scales: Scales;
} => {
  const data = dataRef.current;
  if (!data) {
    throw new Error('Data ref is not initialized');
  }

  const { values, times, head, size, maxPoints } = data;

  const currentTime = Date.now();
  const t0 = currentTime - timeWindowMs;
  const t1 = currentTime;
  const timeExtent: [number, number] = [t0, t1];

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

  ctx.save();
  ctx.translate(margin.left, margin.top);

  ctx.lineWidth = strokeWidth;
  ctx.beginPath();

  let isFirstPoint = true;
  let isHighlight = false;
  let prevX = 0;
  let prevY = 0;

  for (let i = 0; i < size; i++) {
    const idx = (head - size + i + maxPoints) % maxPoints;
    const pointTime = times[idx];

    if (pointTime < t0 || pointTime > t1) continue;

    const value = values[idx];
    const x = scales.xAxisScale(new Date(pointTime));
    const y = scales.yScale(value);
    const nextHighlight = highlightThreshold !== undefined && value > highlightThreshold;

    if (isFirstPoint) {
      ctx.strokeStyle = nextHighlight && resolvedHighlightStrokeColor ? resolvedHighlightStrokeColor : resolvedStrokeColor;
      ctx.moveTo(x, y);
      prevX = x;
      prevY = y;
      isFirstPoint = false;
      isHighlight = nextHighlight;
      continue;
    }

    if (nextHighlight !== isHighlight) {
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = nextHighlight && resolvedHighlightStrokeColor ? resolvedHighlightStrokeColor : resolvedStrokeColor;
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      isHighlight = nextHighlight;
    } else {
      ctx.lineTo(x, y);
    }

    prevX = x;
    prevY = y;
  }

  ctx.stroke();

  drawAxes({
    ctx,
    xAxisScale: scales.xAxisScale,
    yScale: scales.yScale,
    chartWidth,
    chartHeight,
    margin,
    resolvedColors,
    xTicks,
    yTicks,
  });

  ctx.restore();

  return {
    scales,
  };
};
