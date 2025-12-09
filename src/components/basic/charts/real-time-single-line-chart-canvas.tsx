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
  times: Float64Array; // Массив временных меток для каждой точки
  head: number; // Индекс текущей позиции в циклическом буфере
  size: number; // Текущий размер заполненной части буфера
  maxPoints: number; // Максимальное количество точек в буфере
}

interface RealTimeSingleLineChartCanvasProps {
  dataRef: React.RefObject<RealTimeSingleLineDataRef>; // Референс на данные графика
  width?: number; // Ширина canvas
  height?: number; // Высота canvas
  variant?: ChartVariant; // Вариант цветовой схемы
  yDomain: [number, number]; // Диапазон значений по оси Y [мин, макс]
  timeWindowMs: number; // Временное окно отображения данных в миллисекундах
  strokeColor?: string; // Цвет линии графика
  highlightStrokeColor?: string; // Цвет части линии выше порога
  highlightThreshold?: number; // Порог, выше которого применяется highlightStrokeColor
  strokeWidth?: number; // Толщина линии
  xTicks?: number; // Количество делений на оси X
  yTicks?: number; // Количество делений на оси Y
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
