import { useRef, useCallback } from 'react';

import { type ChartVariant } from './shared/types';
import { useChartBase } from './shared/use-chart-base';
import { useCanvasRenderLoop } from './shared/use-canvas-render-loop';
import { resolveChartColors, resolveCSSVariable } from './utils/canvas-helpers';
import { renderSingleLineChart } from './single-line-chart-canvas/render-chart';
import { type Scales } from './multi-line-chart/index';

import styles from './multi-line-chart-canvas.module.scss';

export interface RealTimeSingleLineDataRef {
  values: Float32Array;
  times: Float64Array;
  head: number;
  size: number;
  maxPoints: number;
}

interface RealTimeSingleLineChartCanvasProps {
  dataRef: React.RefObject<RealTimeSingleLineDataRef>;
  width?: number;
  height?: number;
  variant?: ChartVariant;
  yDomain: [number, number];
  timeWindowMs: number;
  strokeColor?: string;
  highlightStrokeColor?: string;
  highlightThreshold?: number;
  strokeWidth?: number;
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
}: RealTimeSingleLineChartCanvasProps) => {
  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scalesRef = useRef<Scales | null>(null);

  const renderChart = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const resolvedColors = resolveChartColors(chartColors, canvas);
      const resolvedStrokeColor = resolveCSSVariable(strokeColor || resolvedColors.primary, canvas);
      const resolvedHighlightStrokeColor = highlightStrokeColor
        ? resolveCSSVariable(highlightStrokeColor, canvas)
        : undefined;

      const result = renderSingleLineChart({
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
        cachedScales: scalesRef.current,
        resolvedColors: resolvedColors,
      });

      scalesRef.current = result.scales;
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
