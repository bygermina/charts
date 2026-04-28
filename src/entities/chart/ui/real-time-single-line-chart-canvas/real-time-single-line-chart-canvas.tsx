import { useRef, useCallback, useEffect, type RefObject } from 'react';

import { type ChartScales, type ChartVariant } from '../../model/types';
import { useChartBase } from '../../lib/use-chart-base';
import { useCanvasRenderLoop } from '../../lib/use-canvas-render-loop';
import { resolveChartColors, resolveCSSVariable } from '../../lib/utils/canvas-helpers';
import { renderSingleLineChart } from './utils/render-chart';

import styles from './real-time-single-line-chart-canvas.module.scss';

interface ResolvedColorRefs {
  colors: Record<string, string>;
  strokeColor: string;
  highlightStrokeColor: string | undefined;
}

export interface RealTimeSingleLineDataRef {
  values: Float32Array;
  times: Float64Array;
  head: number;
  size: number;
  maxPoints: number;
}

interface RealTimeSingleLineChartCanvasProps {
  dataRef: RefObject<RealTimeSingleLineDataRef>;
  width?: number;
  height?: number;
  variant?: ChartVariant;
  yDomain: [number, number];
  timeWindowMs: number;
  strokeColor?: string;
  highlightStrokeColor?: string;
  highlightThreshold?: number;
  strokeWidth?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
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
  margin: customMargin,
}: RealTimeSingleLineChartCanvasProps) => {
  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
    margin: customMargin,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scalesRef = useRef<ChartScales | null>(null);
  const resolvedRef = useRef<ResolvedColorRefs | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = resolveChartColors(chartColors, canvas);
    resolvedRef.current = {
      colors,
      strokeColor: resolveCSSVariable(strokeColor || colors.primary, canvas),
      highlightStrokeColor: highlightStrokeColor
        ? resolveCSSVariable(highlightStrokeColor, canvas)
        : undefined,
    };
  }, [chartColors, strokeColor, highlightStrokeColor]);

  const renderChart = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      let resolved = resolvedRef.current;
      if (!resolved) {
        const colors = resolveChartColors(chartColors, canvas);
        resolved = {
          colors,
          strokeColor: resolveCSSVariable(strokeColor || colors.primary, canvas),
          highlightStrokeColor: highlightStrokeColor
            ? resolveCSSVariable(highlightStrokeColor, canvas)
            : undefined,
        };
        resolvedRef.current = resolved;
      }

      const result = renderSingleLineChart({
        ctx,
        dataRef,
        resolvedStrokeColor: resolved.strokeColor,
        resolvedHighlightStrokeColor: resolved.highlightStrokeColor,
        highlightThreshold,
        margin,
        chartWidth,
        chartHeight,
        yDomain,
        timeWindowMs,
        strokeWidth,
        cachedScales: scalesRef.current,
        resolvedColors: resolved.colors,
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
  });

  return (
    <div className={styles.container} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
        role="img"
        aria-label="Real-time line chart showing live data stream"
      />
    </div>
  );
};
