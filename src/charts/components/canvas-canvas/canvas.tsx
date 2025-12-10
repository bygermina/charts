import { useEffect, useRef } from 'react';

import {
  RealTimeSingleLineChartCanvas,
  type RealTimeSingleLineDataRef,
  type ChartVariant,
  getChartColors,
} from '@/components/basic/charts';

import { createTrendGenerator } from './data-generators';
import { ChartStatistics } from './chart-statistics';
import { TogglePanel } from './toggle-panel';
import styles from './canvas.module.scss';

const MAX_POINTS = 2000;
const TIME_WINDOW_MS = 8000;
const DATA_UPDATE_INTERVAL_MS = 16; // ~60 FPS instead of 1000 FPS
const Y_DOMAIN: [number, number] = [0, 200];
const HIGHLIGHT_THRESHOLD = 130;

export default function RealTimeChart({ variant = 'normal' }: { variant?: ChartVariant }) {
  const chartColors = getChartColors(variant);

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
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateData = () => {
      const t = Date.now();
      const v = valueGeneratorRef.current();

      const head = headRef.current;
      const size = sizeRef.current;

      dataRef.current.values[head] = v;
      dataRef.current.times[head] = t;

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
    <div className={styles.container}>
      <TogglePanel buttonLabel="Statistics" position="top-right">
        <ChartStatistics
          dataRef={dataRef}
          timeWindowMs={TIME_WINDOW_MS}
          highlightThreshold={HIGHLIGHT_THRESHOLD}
        />
      </TogglePanel>
      <RealTimeSingleLineChartCanvas
        dataRef={dataRef}
        variant={variant}
        yDomain={Y_DOMAIN}
        timeWindowMs={TIME_WINDOW_MS}
        strokeColor={chartColors.tertiary}
        highlightStrokeColor="#ff4d4f"
        highlightThreshold={HIGHLIGHT_THRESHOLD}
        strokeWidth={1}
        xTicks={3}
        yTicks={5}
      />
    </div>
  );
}
