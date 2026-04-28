import { type RealTimeSingleLineDataRef } from '@/entities/chart';

interface CalculateStatisticsParams {
  data: RealTimeSingleLineDataRef | null;
  timeWindowMs: number;
  highlightThreshold: number;
}

export interface Statistics {
  min: number;
  max: number;
  avg: number;
  exceedCount: number;
  exceedPercent: number;
}

const EMPTY_STATISTICS: Statistics = {
  min: 0,
  max: 0,
  avg: 0,
  exceedCount: 0,
  exceedPercent: 0,
};

export const calculateStatistics = ({
  data,
  timeWindowMs,
  highlightThreshold,
}: CalculateStatisticsParams): Statistics => {
  if (!data || data.size === 0) return EMPTY_STATISTICS;

  const { values, times, head, size, maxPoints } = data;
  const t0 = Date.now() - timeWindowMs;

  let count = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  let exceedCount = 0;

  for (let i = 0; i < size; i++) {
    const idx = (head - size + i + maxPoints) % maxPoints;
    if (times[idx] < t0) continue;

    const value = values[idx];
    sum += value;
    if (value < min) min = value;
    if (value > max) max = value;
    if (value > highlightThreshold) exceedCount++;
    count++;
  }

  if (count === 0) return EMPTY_STATISTICS;

  return {
    min,
    max,
    avg: sum / count,
    exceedCount,
    exceedPercent: (exceedCount / count) * 100,
  };
};
