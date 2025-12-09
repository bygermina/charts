import { type RealTimeSingleLineDataRef } from '../real-time-single-line-chart-canvas';
import { createScalesForAxes, updateScalesForAxes, type Scales } from '../multi-line-chart/index';
import {
  resolveChartColors,
  resolveCSSVariable,
  drawAxes,
  type CSSVariableCache,
} from '../utils/canvas-helpers';

interface RenderSingleLineChartConfig {
  ctx: CanvasRenderingContext2D; // Контекст для отрисовки на canvas
  canvas: HTMLCanvasElement; // Canvas элемент
  dataRef: React.RefObject<RealTimeSingleLineDataRef>; // Референс на данные графика
  chartColors: Record<string, string>; // Цвета графика (CSS переменные)
  margin: { top: number; right: number; bottom: number; left: number }; // Отступы графика
  chartWidth: number; // Ширина области отрисовки
  chartHeight: number; // Высота области отрисовки
  yDomain: [number, number]; // Диапазон значений по оси Y [мин, макс]
  timeWindowMs: number; // Временное окно отображения данных в миллисекундах
  strokeColor?: string; // Цвет линии графика (опционально)
  strokeWidth: number; // Толщина линии
  xTicks: number; // Количество делений на оси X
  yTicks: number; // Количество делений на оси Y
  cachedScales?: Scales | null; // Кэшированные масштабы осей
  cachedResolvedColors?: Record<string, string>; // Кэш разрешенных цветов (модифицируется напрямую)
  cssVariableCache?: CSSVariableCache; // Кэш для CSS переменных
}

// Функция отрисовки однолинейного графика в реальном времени на canvas
export const renderSingleLineChart = ({
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
  cachedScales,
  cachedResolvedColors,
  cssVariableCache,
}: RenderSingleLineChartConfig): {
  scales: Scales;
  resolvedColors: Record<string, string>;
} => {
  const data = dataRef.current;
  // Если данных недостаточно (меньше 2 точек), возвращаем дефолтные значения
  if (!data || data.size < 2) {
    const defaultTime = Date.now();
    const defaultTimeExtent: [number, number] = [defaultTime, defaultTime];
    // Используем кэшированные масштабы или создаем новые
    const defaultScales =
      cachedScales ||
      createScalesForAxes({
        timeExtent: defaultTimeExtent,
        maxValue: 0,
        chartWidth,
        chartHeight,
        margin: { right: margin.right },
        yDomain,
      });

    console.log(cachedScales);

    return {
      scales: defaultScales,
      resolvedColors: cachedResolvedColors || {},
    };
  }

  // Извлекаем данные из циклического буфера
  const { values, times, head, size, maxPoints } = data;

  // Вычисляем временное окно для отображения данных
  const currentTime = Date.now();
  const t0 = currentTime - timeWindowMs; // Начало временного окна
  const t1 = currentTime; // Конец временного окна (текущее время)
  const timeExtent: [number, number] = [t0, t1];

  // Разрешаем CSS переменные в реальные цвета
  // Функция модифицирует cachedResolvedColors напрямую для оптимизации
  const resolvedColors = resolveChartColors(
    chartColors,
    canvas,
    cssVariableCache,
    cachedResolvedColors,
  );

  // Создаем или обновляем масштабы осей
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

  // Если масштабы были кэшированы, обновляем их с новыми параметрами
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

  // Определяем цвет линии: используем переданный strokeColor или primary цвет из палитры
  const resolvedStrokeColor = strokeColor
    ? resolveCSSVariable(strokeColor, canvas, cssVariableCache)
    : resolveCSSVariable(resolvedColors.primary, canvas, cssVariableCache);

  // Сохраняем текущее состояние контекста и сдвигаем начало координат
  ctx.save();
  ctx.translate(margin.left, margin.top);

  // Настраиваем стиль линии
  ctx.strokeStyle = resolvedStrokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();

  // Отрисовываем линию графика, проходя по точкам в циклическом буфере
  let isFirstPoint = true;
  for (let i = 0; i < size; i++) {
    // Вычисляем индекс точки в циклическом буфере
    // Формула: (head - size + i + maxPoints) % maxPoints
    // Это позволяет правильно читать данные из циклического буфера
    const idx = (head - size + i + maxPoints) % maxPoints;
    const pointTime = times[idx];

    // Отображаем только точки, попадающие в текущее временное окно
    if (pointTime >= t0 && pointTime <= t1) {
      // Преобразуем время и значение в координаты на canvas
      const x = scales.xAxisScale(new Date(pointTime));
      const y = scales.yScale(values[idx]);

      // Для первой точки используем moveTo, для остальных - lineTo
      if (isFirstPoint) {
        ctx.moveTo(x, y);
        isFirstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
  }

  // Отрисовываем линию
  ctx.stroke();

  // Отрисовываем оси графика (X и Y) с делениями
  drawAxes({
    ctx,
    xAxisScale: scales.xAxisScale,
    yScale: scales.yScale,
    chartWidth,
    chartHeight,
    margin,
    resolvedColors,
    xTicks,
    yTicks,
  });

  // Восстанавливаем состояние контекста
  ctx.restore();

  // Возвращаем масштабы и разрешенные цвета для кэширования
  return {
    scales,
    resolvedColors,
  };
};
