import { useEffect, useRef } from 'react';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import {
  type LineSeries,
  createScalesForAxes,
  calculateGridLeftShift,
  createLineGenerator,
  prepareChartData,
} from './multi-line-chart/index';
import { resolveChartColors, resolveCSSVariable } from './utils/canvas-helpers';
import { drawGrid, drawAxes, drawLine, drawLegend } from './multi-line-chart-canvas/drawing';
import { getCanvasCache, getCachedOrCompute } from './utils/chart-cache';

interface MultiLineChartCanvasProps {
  lines: LineSeries[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  yDomain?: [number, number];
}

export const MultiLineChartCanvas = ({
  lines,
  width = 600,
  height = 250,
  variant = 'normal',
  showGrid = true,
  showLegend = true,
  strokeWidth = 1,
  yDomain,
}: MultiLineChartCanvasProps) => {
  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (lines.length === 0 || lines.some((line) => line.data.length === 0)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const actualWidth = width * dpr;
    const actualHeight = height * dpr;

    const cache = getCanvasCache(canvas);

    const needsResize = canvas.width !== actualWidth || canvas.height !== actualHeight;
    if (needsResize) {
      canvas.width = actualWidth;
      canvas.height = actualHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const resolvedChartColors = getCachedOrCompute(cache, 'resolvedColors', () =>
      resolveChartColors(chartColors, canvas),
    );

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    if (!needsResize) ctx.clearRect(0, 0, width, height);

    const timeWindowMs = 30000;
    const timeWindowStart = Date.now() - timeWindowMs;
    const MAX_DISPLAY_POINTS = 200;

    const linesHash = JSON.stringify(
      lines.map((line) => ({
        length: line.data.length,
        lastTime: line.data.at(-1)?.time,
      })),
    );

    const linesToProcess =
      cache.cachedLines && cache.cachedLinesHash === linesHash
        ? cache.cachedLines
        : (() => {
            const processed = lines.map((line) => ({
              ...line,
              data: line.data.slice(-MAX_DISPLAY_POINTS),
            }));
            cache.cachedLines = processed;
            cache.cachedLinesHash = linesHash;
            return processed;
          })();

    const dataToUse = linesToProcess.map((line) => {
      const filtered = line.data.filter((point) => point.time >= timeWindowStart);
      return { ...line, data: filtered.length > 0 ? filtered : line.data };
    });

    const prevData = cache.prevData ?? [];
    const prevMetadata = cache.prevMetadata ?? { timeExtent: null, timeStep: 0 };
    const isInitialRender = prevData.length === 0;
    const chartData = prepareChartData({
      lines: dataToUse,
      prevMetadata,
      isInitialRender,
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

    const linesWithResolvedColors = dataToUse.map((line) => {
      const resolvedColor = resolveCSSVariable(line.color, canvas);
      drawLine(ctx, line.data, lineGenerator, resolvedColor, strokeWidth, shiftOffset);
      return { ...line, color: resolvedColor };
    });

    drawAxes(ctx, xAxisScale, yScale, chartWidth, chartHeight, margin, resolvedChartColors);

    if (showLegend) {
      drawLegend(ctx, linesWithResolvedColors, chartWidth, resolvedChartColors);
    }

    ctx.restore();

    const MAX_PREV_POINTS = 100;
    const hasDataChanged =
      !prevData.length ||
      lines.length !== prevData.length ||
      lines.some((line, idx) => {
        const prevLine = prevData[idx];
        if (!prevLine) return true;
        const lastPoint = line.data.at(-1);
        const prevLastPoint = prevLine.data.at(-1);
        return line.data.length !== prevLine.data.length || lastPoint?.time !== prevLastPoint?.time;
      });

    if (hasDataChanged) {
      cache.prevData = lines.map((line) => ({
        ...line,
        data: line.data.slice(-MAX_PREV_POINTS).map((point) => ({ ...point })),
      }));
      cache.prevMetadata = {
        timeExtent: chartData.timeExtent,
        timeStep: chartData.timeStep,
      };
    }
  }, [
    lines,
    width,
    height,
    variant,
    chartColors,
    showGrid,
    showLegend,
    strokeWidth,
    margin,
    chartWidth,
    chartHeight,
    yDomain,
  ]);

  return (
    <div style={{ width, height, overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};
