import { useRef } from 'react';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { type LineSeries } from './multi-line-chart/index';
import { processLinesData } from './multi-line-chart-canvas/process-data';
import { renderMultiLineChart } from './multi-line-chart-canvas/render-chart';
import { TIME_WINDOW_MS, MAX_DISPLAY_POINTS } from './multi-line-chart-canvas/constants';
import { useCanvasRenderLoop } from './use-canvas-render-loop';
import styles from './multi-line-chart-canvas.module.scss';

interface RealTimeMultiLineChartCanvasProps {
  lines: LineSeries[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  yDomain?: [number, number];
  timeWindowMs?: number;
  maxDisplayPoints?: number;
}

export const RealTimeMultiLineChartCanvas = ({
  lines,
  width = 600,
  height = 250,
  variant = 'normal',
  showGrid = true,
  showLegend = true,
  strokeWidth = 1,
  yDomain,
  timeWindowMs = TIME_WINDOW_MS,
  maxDisplayPoints = MAX_DISPLAY_POINTS,
}: RealTimeMultiLineChartCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const renderChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const timeWindowStart = Date.now() - timeWindowMs;
    const dataToUse = processLinesData(lines, timeWindowStart, maxDisplayPoints);

    renderMultiLineChart({
      ctx,
      canvas,
      lines: dataToUse,
      chartColors,
      margin,
      chartWidth,
      chartHeight,
      showGrid,
      showLegend,
      strokeWidth,
      yDomain,
    });
  };

  useCanvasRenderLoop({
    canvasRef,
    width,
    height,
    render: renderChart,
    dependencies: [
      lines,
      chartColors,
      showGrid,
      showLegend,
      strokeWidth,
      chartWidth,
      chartHeight,
      margin,
      yDomain,
      timeWindowMs,
      maxDisplayPoints,
    ],
  });

  return (
    <div className={styles.container} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
    </div>
  );
};
