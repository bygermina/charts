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
import { resolveChartColors, resolveCSSVariable, setupCanvas } from './utils/canvas-helpers';
import { drawGrid, drawAxes, drawLine, drawLegend } from './multi-line-chart-canvas/drawing';
import styles from './multi-line-chart-canvas.module.scss';

const TIME_WINDOW_MS = 30000;
const MAX_DISPLAY_POINTS = 200;

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

const processLinesData = (lines: LineSeries[], timeWindowStart: number): LineSeries[] => {
  const processed = lines.map((line) => ({
    ...line,
    data: line.data.slice(-MAX_DISPLAY_POINTS),
  }));

  return processed.map((line) => {
    const filtered = line.data.filter((point) => point.time >= timeWindowStart);
    return { ...line, data: filtered.length > 0 ? filtered : line.data };
  });
};

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

    const setupResult = setupCanvas(canvas, width, height);
    if (!setupResult) return;

    const { ctx } = setupResult;

    const resolvedChartColors = resolveChartColors(chartColors, canvas);

    const timeWindowStart = Date.now() - TIME_WINDOW_MS;
    const dataToUse = processLinesData(lines, timeWindowStart);

    const chartData = prepareChartData({
      lines: dataToUse,
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
    <div className={styles.container} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
    </div>
  );
};
