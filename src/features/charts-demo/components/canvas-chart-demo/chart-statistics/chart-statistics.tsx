import { useEffect, useState, type RefObject } from 'react';

import { type RealTimeSingleLineDataRef } from '@/entities/chart';

import {
  calculateAvg,
  calculateCurrent,
  calculateExceedCount,
  calculateExceedPercent,
  calculateMax,
  calculateMin,
} from '../utils/statistics-utils';

import styles from './chart-statistics.module.scss';

export interface Statistics {
  current: number;
  min: number;
  max: number;
  avg: number;
  exceedCount: number;
  exceedPercent: number;
}

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
  getColor?: (value: number, threshold: number) => string | undefined;
}

const STAT_ITEMS: StatItem[] = [
  {
    label: 'Current:',
    key: 'current',
    format: (v) => v.toFixed(1),
    getColor: (v, threshold) => (v > threshold ? '#ff4d4f' : undefined),
  },
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
    getColor: () => '#ff4d4f',
  },
  {
    label: 'Exceed %:',
    key: 'exceedPercent',
    format: (v) => `${v.toFixed(1)}%`,
    getColor: () => '#ff4d4f',
  },
];

export const ChartStatistics = ({
  dataRef,
  timeWindowMs,
  highlightThreshold,
  updateInterval = 1000,
}: ChartStatisticsProps) => {
  const [statistics, setStatistics] = useState<Statistics>({
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    exceedCount: 0,
    exceedPercent: 0,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateStatistics = () => {
      const data = dataRef.current;
      if (!data) {
        timeoutId = setTimeout(updateStatistics, updateInterval);
        return;
      }

      const stats = {
        current: calculateCurrent({ data }),
        min: calculateMin({ data, timeWindowMs }),
        max: calculateMax({ data, timeWindowMs }),
        avg: calculateAvg({ data, timeWindowMs }),
        exceedCount: calculateExceedCount({ data, timeWindowMs, highlightThreshold }),
        exceedPercent: calculateExceedPercent({ data, timeWindowMs, highlightThreshold }),
      };

      setStatistics(stats);
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
          const color = item.getColor?.(value, highlightThreshold);

          return (
            <div key={item.key} className={styles.statRow}>
              <span className={styles.statLabel}>{item.label}</span>
              <span className={styles.statValue} style={{ color }}>
                {item.format(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
