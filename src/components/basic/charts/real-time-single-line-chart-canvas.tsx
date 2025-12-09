import { useRef, useCallback } from 'react';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { useCanvasRenderLoop } from './use-canvas-render-loop';
import { createCSSVariableCache } from './utils/canvas-helpers';
import { renderSingleLineChart } from './single-line-chart-canvas/render-chart';
import { type Scales } from './multi-line-chart/index';

import styles from './multi-line-chart-canvas.module.scss';

// Интерфейс для данных графика в реальном времени
// Используется для передачи данных между компонентами через ref
export interface RealTimeSingleLineDataRef {
  values: Float32Array; // Массив значений для отрисовки
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
  strokeWidth = 2,
  xTicks = 3,
  yTicks = 5,
}: RealTimeSingleLineChartCanvasProps) => {
  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  // Референс на canvas элемент для отрисовки
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Кэш для CSS переменных (для оптимизации производительности)
  const cssVariableCacheRef = useRef(createCSSVariableCache());
  // Кэш для масштабов осей (чтобы не пересчитывать при каждом рендере)
  const cachedScalesRef = useRef<Scales | null>(null);
  // Кэш для разрешенных цветов (преобразованных из CSS переменных)
  // Инициализируем пустым объектом, resolveChartColors будет модифицировать его напрямую
  const cachedResolvedColorsRef = useRef<Record<string, string>>({});

  // Функция отрисовки графика
  const renderChart = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // Вызываем функцию отрисовки графика с передачей всех необходимых параметров
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

      // Сохраняем кэшированные значения для следующего рендера
      cachedScalesRef.current = result.scales;
      // cachedResolvedColorsRef.current модифицируется напрямую в resolveChartColors,
      // поэтому не нужно его переприсваивать
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

  // Хук для запуска цикла отрисовки на canvas
  // Автоматически вызывает renderChart при изменении зависимостей
  useCanvasRenderLoop({
    canvasRef,
    width,
    height,
    render: renderChart,
    dependencies: [timeWindowMs], // Перерисовка при изменении временного окна
  });

  return (
    <div className={styles.container} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
    </div>
  );
};
