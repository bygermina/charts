import { useEffect, useState, type RefObject } from 'react';

import { type RealTimeSingleLineDataRef } from '@/entities/chart';

import { calculateStatistics, type Statistics } from '../utils/statistics-utils';

import styles from './chart-statistics.module.scss';

interface ChartStatisticsProps {
  dataRef: RefObject<RealTimeSingleLineDataRef>;
  timeWindowMs: number;
  highlightThreshold: number;
  updateInterval?: number;
}

interface StatItem {
  label: string;
  key: keyof Statistics;
  format: (value: number) => string;
  highlight?: boolean;
}

const HIGHLIGHT_COLOR = 'var(--color-red-600)';

const STAT_ITEMS: StatItem[] = [
  {
    label: 'Min:',
    key: 'min',
    format: (v) => v.toFixed(1),
  },
  {
    label: 'Max:',
    key: 'max',
    format: (v) => v.toFixed(1),
  },
  {
    label: 'Average:',
    key: 'avg',
    format: (v) => v.toFixed(1),
  },
  {
    label: 'Exceeded:',
    key: 'exceedCount',
    format: (v) => v.toString(),
    highlight: true,
  },
  {
    label: 'Exceed %:',
    key: 'exceedPercent',
    format: (v) => `${v.toFixed(1)}%`,
    highlight: true,
  },
];

export const ChartStatistics = ({
  dataRef,
  timeWindowMs,
  highlightThreshold,
  updateInterval = 1000,
}: ChartStatisticsProps) => {
  const [statistics, setStatistics] = useState<Statistics>({
    min: 0,
    max: 0,
    avg: 0,
    exceedCount: 0,
    exceedPercent: 0,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateStatistics = () => {
      setStatistics(
        calculateStatistics({ data: dataRef.current, timeWindowMs, highlightThreshold }),
      );
      timeoutId = setTimeout(updateStatistics, updateInterval);
    };

    timeoutId = setTimeout(updateStatistics, updateInterval);

    return () => clearTimeout(timeoutId);
  }, [dataRef, timeWindowMs, highlightThreshold, updateInterval]);

  return (
    <div className={styles.statistics}>
      <div className={styles.statisticsHeader}>Statistics</div>
      <div className={styles.statisticsContent}>
        {STAT_ITEMS.map((item) => {
          const value = statistics[item.key];
          const isHighlighted = item.highlight ?? false;

          return (
            <div key={item.key} className={styles.statRow}>
              <span className={styles.statLabel}>{item.label}</span>
              <span
                className={styles.statValue}
                data-highlight={isHighlighted}
                style={
                  isHighlighted
                    ? ({ '--stat-highlight-color': HIGHLIGHT_COLOR } as React.CSSProperties)
                    : undefined
                }
              >
                {item.format(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
