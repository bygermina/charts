import { useRef, useCallback } from 'react';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { useCanvasRenderLoop } from './use-canvas-render-loop';
import { createCSSVariableCache } from './utils/canvas-helpers';
import { renderSingleLineChart } from './single-line-chart-canvas/render-chart';
import { type Scales } from './multi-line-chart/index';

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
  strokeWidth?: number;
  xTicks?: number;
  yTicks?: number;
}

export const RealTimeSingleLineChartCanvas = ({
  dataRef,
  width = 800,
  height = 300,
  variant = 'normal',
  yDomain,
  timeWindowMs,
  strokeColor,
  strokeWidth = 2,
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
  const cachedResolvedColorsRef = useRef<Record<string, string> | null>(null);

  const renderChart = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const result = renderSingleLineChart({
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
        cachedScales: cachedScalesRef.current,
        cachedResolvedColors: cachedResolvedColorsRef.current,
        cssVariableCache: cssVariableCacheRef.current,
      });

      cachedScalesRef.current = result.scales;
      cachedResolvedColorsRef.current = result.resolvedColors;
    },
    [
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
    ],
  );

  useCanvasRenderLoop({
    canvasRef,
    width,
    height,
    render: renderChart,
    dependencies: [timeWindowMs],
  });

  return <canvas ref={canvasRef} width={width} height={height} />;
};
