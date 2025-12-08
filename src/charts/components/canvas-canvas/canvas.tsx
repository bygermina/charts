import { useEffect, useRef } from 'react';

import {
  RealTimeSingleLineChartCanvas,
  type RealTimeSingleLineDataRef,
  type ChartVariant,
  getChartColors,
} from '@/components/basic/charts';

import { createTrendGenerator } from './data-generators';

const MAX_POINTS = 2000;
const TIME_WINDOW_MS = 8000;
const DATA_UPDATE_INTERVAL_MS = 1; // Интервал обновления данных в миллисекундах
const Y_DOMAIN: [number, number] = [0, 200]; // Диапазон отображения графика

export default function RealTimeChart({ variant = 'normal' }: { variant?: ChartVariant }) {
  const chartColors = getChartColors(variant);
  const valuesRef = useRef(new Float32Array(MAX_POINTS));
  const timesRef = useRef(new Float64Array(MAX_POINTS));
  const headRef = useRef(0);
  const sizeRef = useRef(0);

  const valueGeneratorRef = useRef(createTrendGenerator(75, [30, 170]));

  const dataRef = useRef<RealTimeSingleLineDataRef>({
    values: new Float32Array(MAX_POINTS),
    times: new Float64Array(MAX_POINTS),
    head: 0,
    size: 0,
    maxPoints: MAX_POINTS,
  });

  useEffect(() => {
    dataRef.current.values = valuesRef.current;
    dataRef.current.times = timesRef.current;

    let timeoutId: ReturnType<typeof setTimeout>;

    const updateData = () => {
      const t = Date.now();
      const v = valueGeneratorRef.current();

      const values = valuesRef.current;
      const times = timesRef.current;

      const head = headRef.current;
      const size = sizeRef.current;

      values[head] = v;
      times[head] = t;

      headRef.current = (head + 1) % MAX_POINTS;
      sizeRef.current = Math.min(size + 1, MAX_POINTS);

      dataRef.current.head = headRef.current;
      dataRef.current.size = sizeRef.current;

      timeoutId = setTimeout(updateData, DATA_UPDATE_INTERVAL_MS);
    };

    timeoutId = setTimeout(updateData, DATA_UPDATE_INTERVAL_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <RealTimeSingleLineChartCanvas
      dataRef={dataRef}
      width={800}
      height={300}
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
