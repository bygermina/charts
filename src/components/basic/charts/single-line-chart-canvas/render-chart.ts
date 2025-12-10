import { type RealTimeSingleLineDataRef } from '../real-time-single-line-chart-canvas';
import { createScalesForAxes, updateScalesForAxes, type Scales } from '../multi-line-chart/index';
import { drawAxes, drawGrid } from '../utils/canvas-helpers';

interface RenderSingleLineChartConfig {
  ctx: CanvasRenderingContext2D;
  dataRef: React.RefObject<RealTimeSingleLineDataRef>;
  resolvedStrokeColor: string;
  resolvedHighlightStrokeColor?: string;
  highlightThreshold?: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  yDomain: [number, number];
  timeWindowMs: number;
  strokeWidth: number;
  cachedScales?: Scales | null;
  resolvedColors?: Record<string, string>;
}

export const renderSingleLineChart = ({
  ctx,
  dataRef,
  resolvedStrokeColor,
  resolvedHighlightStrokeColor,
  highlightThreshold,
  margin,
  chartWidth,
  chartHeight,
  yDomain,
  timeWindowMs,
  strokeWidth,
  cachedScales,
  resolvedColors,
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
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const hasHighlight =
    highlightThreshold !== undefined && resolvedHighlightStrokeColor !== undefined;

  const highlightThresholdValue = highlightThreshold ?? 0;

  const getColor = (isHighlight: boolean) =>
    isHighlight && hasHighlight ? resolvedHighlightStrokeColor! : resolvedStrokeColor;

  const maxPointsToDraw = Math.max(1, Math.floor(chartWidth * 2)); // до ~2 точек на пиксель
  const step = size > maxPointsToDraw ? Math.floor(size / maxPointsToDraw) : 1;

  let firstPoint = true;
  let currentIsHighlight = false;
  let prevX = 0;
  let prevY = 0;

  for (let i = 0; i < size; i += step) {
    const idx = (head - size + i + maxPoints) % maxPoints;
    const pointTime = times[idx];

    if (pointTime < t0 || pointTime > t1) continue;

    const value = values[idx];
    // xAxisScale теперь линейный по числам → без new Date
    const x = scales.xAxisScale(pointTime);
    const y = scales.yScale(value);
    const isHighlight = hasHighlight && value > highlightThresholdValue;

    if (firstPoint) {
      ctx.strokeStyle = getColor(isHighlight);
      ctx.beginPath();
      ctx.moveTo(x, y);
      currentIsHighlight = isHighlight;
      firstPoint = false;
      prevX = x;
      prevY = y;
      continue;
    }

    if (isHighlight !== currentIsHighlight) {
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = getColor(isHighlight);
      ctx.moveTo(prevX, prevY);
      currentIsHighlight = isHighlight;
    }

    ctx.lineTo(x, y);
    prevX = x;
    prevY = y;
  }

  if (!firstPoint) {
    ctx.stroke();
  }

  if (resolvedColors) {
    drawGrid({
      ctx,
      xAxisScale: scales.xAxisScale,
      yScale: scales.yScale,
      chartWidth,
      chartHeight,
      margin,
      resolvedColors,
      xTicks: 5,
      yTicks: 5,
    });

    drawAxes({
      ctx,
      xAxisScale: scales.xAxisScale,
      yScale: scales.yScale,
      chartWidth,
      chartHeight,
      margin,
      resolvedColors,
      xTicks: 5,
      yTicks: 5,
    });
  }

  ctx.restore();

  return {
    scales,
  };
};
