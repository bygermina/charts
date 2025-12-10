import { useRef, useCallback } from 'react';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { useCanvasRenderLoop } from './use-canvas-render-loop';
import {
  createCSSVariableCache,
  resolveChartColors,
  resolveCSSVariable,
} from './utils/canvas-helpers';
import { renderSingleLineChart } from './single-line-chart-canvas/render-chart';
import { type Scales } from './multi-line-chart/index';

import styles from './multi-line-chart-canvas.module.scss';

export interface RealTimeSingleLineDataRef {
  values: Float32Array;
  times: Float64Array; // Array of timestamps for each point
  head: number; // Index of current position in circular buffer
  size: number; // Current size of filled part of buffer
  maxPoints: number; // Maximum number of points in buffer
}

interface RealTimeSingleLineChartCanvasProps {
  dataRef: React.RefObject<RealTimeSingleLineDataRef>; // Reference to chart data
  width?: number; // Canvas width
  height?: number; // Canvas height
  variant?: ChartVariant; // Color scheme variant
  yDomain: [number, number]; // Y-axis value range [min, max]
  timeWindowMs: number; // Time window for displaying data in milliseconds
  strokeColor?: string; // Chart line color
  highlightStrokeColor?: string; // Color of line part above threshold
  highlightThreshold?: number; // Threshold above which highlightStrokeColor is applied
  strokeWidth?: number; // Line width
  xTicks?: number; // Number of divisions on X-axis
  yTicks?: number; // Number of divisions on Y-axis
}

export const RealTimeSingleLineChartCanvas = ({
  dataRef,
  width = 600,
  height = 300,
  variant = 'normal',
  yDomain,
  timeWindowMs,
  strokeColor,
  highlightStrokeColor,
  highlightThreshold,
  strokeWidth = 1,
  xTicks = 3,
  yTicks = 5,
}: RealTimeSingleLineChartCanvasProps) => {
  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cssVariableCacheRef = useRef(createCSSVariableCache());
  const cachedScalesRef = useRef<Scales | null>(null);
  const cachedResolvedColorsRef = useRef<Record<string, string>>({});

  const renderChart = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const resolvedColors = resolveChartColors(
        chartColors,
        canvas,
        cssVariableCacheRef.current,
        cachedResolvedColorsRef.current,
      );

      const resolvedStrokeColor = resolveCSSVariable(
        strokeColor || resolvedColors.primary,
        canvas,
        cssVariableCacheRef.current,
      );

      const resolvedHighlightStrokeColor = highlightStrokeColor
        ? resolveCSSVariable(highlightStrokeColor, canvas, cssVariableCacheRef.current)
        : undefined;

      const result = renderSingleLineChart({
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
        cachedScales: cachedScalesRef.current,
      });

      cachedScalesRef.current = result.scales;
    },
    [
      dataRef,
      chartColors,
      strokeColor,
      highlightStrokeColor,
      highlightThreshold,
      margin,
      chartWidth,
      chartHeight,
      yDomain,
      timeWindowMs,
      strokeWidth,
      xTicks,
      yTicks,
    ],
  );

  useCanvasRenderLoop({
    canvasRef,
    width,
    height,
    render: renderChart,
    dependencies: [timeWindowMs],
  });

  return (
    <div className={styles.container} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
    </div>
  );
};
