import { useEffect, useRef } from 'react';

import {
  RealTimeSingleLineChartCanvas,
  type RealTimeSingleLineDataRef,
  type ChartVariant,
  getChartColors,
} from '@/components/basic/charts';

import { createTrendGenerator } from './data-generators';

// Максимальное количество точек данных в циклическом буфере
const MAX_POINTS = 2000;
// Временное окно отображения данных в миллисекундах (8 секунд)
const TIME_WINDOW_MS = 8000;
// Интервал обновления данных в миллисекундах (1 мс для плавной анимации)
const DATA_UPDATE_INTERVAL_MS = 1;
// Диапазон значений по оси Y [минимум, максимум]
const Y_DOMAIN: [number, number] = [0, 200];

export default function RealTimeChart({ variant = 'normal' }: { variant?: ChartVariant }) {
  // Получаем цвета для выбранного варианта графика
  const chartColors = getChartColors(variant);

  // Индекс текущей позиции в циклическом буфере (голова очереди)
  // Показывает, куда будет записана следующая точка
  // После заполнения буфера продолжает циклически двигаться (0, 1, 2, ..., MAX_POINTS-1, 0, ...)
  const headRef = useRef(0);
  // Текущий размер заполненной части буфера
  // Пока буфер не заполнен: headRef === sizeRef
  // После заполнения: sizeRef остается на MAX_POINTS, а headRef продолжает двигаться
  const sizeRef = useRef(0);

  // Генератор значений с трендом: начальное значение 75, диапазон [30, 170]
  const valueGeneratorRef = useRef(createTrendGenerator(75, [30, 170]));

  // Референс для передачи данных в компонент графика
  // Содержит типизированные массивы для эффективного хранения данных
  const dataRef = useRef<RealTimeSingleLineDataRef>({
    values: new Float32Array(MAX_POINTS), // Float32Array для экономии памяти
    times: new Float64Array(MAX_POINTS), // Float64Array для высокой точности временных меток
    head: 0,
    size: 0,
    maxPoints: MAX_POINTS,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Функция обновления данных в циклическом буфере
    const updateData = () => {
      // Получаем текущее время и генерируем новое значение
      const t = Date.now();
      const v = valueGeneratorRef.current();

      const head = headRef.current;
      const size = sizeRef.current;

      // Записываем новое значение и временную метку в текущую позицию буфера
      dataRef.current.values[head] = v;
      dataRef.current.times[head] = t;

      // Перемещаем указатель головы по кругу (циклический буфер)
      // Когда достигаем конца массива, возвращаемся к началу
      headRef.current = (head + 1) % MAX_POINTS;
      // Увеличиваем размер, но не больше максимального количества точек
      // После заполнения буфера size остается на MAX_POINTS, а head продолжает двигаться
      sizeRef.current = Math.min(size + 1, MAX_POINTS);

      // Обновляем данные в референсе для компонента графика
      // Компонент графика читает эти значения для отрисовки
      dataRef.current.head = headRef.current;
      dataRef.current.size = sizeRef.current;

      // Планируем следующее обновление данных
      timeoutId = setTimeout(updateData, DATA_UPDATE_INTERVAL_MS);
    };

    // Запускаем цикл обновления данных
    timeoutId = setTimeout(updateData, DATA_UPDATE_INTERVAL_MS);

    // Очищаем таймер при размонтировании компонента, чтобы избежать утечек памяти
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <RealTimeSingleLineChartCanvas
      dataRef={dataRef}
      variant={variant}
      yDomain={Y_DOMAIN}
      timeWindowMs={TIME_WINDOW_MS}
      strokeColor={chartColors.tertiary}
      strokeWidth={1}
      xTicks={3}
      yTicks={5}
    />
  );
}
