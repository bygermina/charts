import { useRef } from 'react';

import {
  RealTimeSingleLineChartCanvas,
  type RealTimeSingleLineDataRef,
  type ChartVariant,
  getChartColors,
  useVisibilityAwareTimer,
} from '@/entities/chart';
import { createTrendGenerator } from '@/shared/lib/utils';

import { ChartStatistics } from './chart-statistics';
import { TogglePanel } from './toggle-panel';

import styles from './real-time-canvas-chart.module.scss';

const MAX_POINTS = 2000;
const TIME_WINDOW_MS = 8000;
const DATA_UPDATE_INTERVAL_MS = 16;
const Y_DOMAIN: [number, number] = [0, 200];
const HIGHLIGHT_THRESHOLD = 130;
const DEFAULT_CHART_HEIGHT = 300;

interface RealTimeCanvasChartProps {
  variant?: ChartVariant;
}

export const RealTimeCanvasChart = ({ variant = 'normal' }: RealTimeCanvasChartProps) => {
  const chartColors = getChartColors(variant);
  const valueGeneratorRef = useRef(createTrendGenerator(75, [30, 170]));

  const dataRef = useRef<RealTimeSingleLineDataRef>({
    values: new Float32Array(MAX_POINTS),
    times: new Float64Array(MAX_POINTS),
    head: 0,
    size: 0,
    maxPoints: MAX_POINTS,
  });

  const updateData = () => {
    const t = Date.now();
    const v = valueGeneratorRef.current();
    const data = dataRef.current;

    data.values[data.head] = v;
    data.times[data.head] = t;

    data.head = (data.head + 1) % MAX_POINTS;
    data.size = Math.min(data.size + 1, MAX_POINTS);
  };

  useVisibilityAwareTimer({
    delay: DATA_UPDATE_INTERVAL_MS,
    onTick: updateData,
    onVisible: () => {
      dataRef.current = {
        values: new Float32Array(MAX_POINTS),
        times: new Float64Array(MAX_POINTS),
        head: 0,
        size: 0,
        maxPoints: MAX_POINTS,
      };
    },
  });

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
        highlightStrokeColor="var(--color-red-600)"
        highlightThreshold={HIGHLIGHT_THRESHOLD}
        strokeWidth={1}
        height={DEFAULT_CHART_HEIGHT}
        margin={{ left: 30 }}
      />
    </div>
  );
};
