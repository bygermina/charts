import { type RealTimeSingleLineDataRef } from '@/entities/chart';

import { type Statistics } from '../chart-statistics';

interface GetTimeWindowDataParams {
  data: RealTimeSingleLineDataRef;
  timeWindowMs: number;
}

const getTimeWindowData = ({ data, timeWindowMs }: GetTimeWindowDataParams) => {
  if (!data || data.size === 0) return [];

  const { values, times, head, size, maxPoints } = data;
  const currentTime = Date.now();
  const t0 = currentTime - timeWindowMs;
  const dataPoints: number[] = [];

  for (let i = 0; i < size; i++) {
    const idx = (head - size + i + maxPoints) % maxPoints;
    const pointTime = times[idx];

    if (pointTime < t0) continue;

    dataPoints.push(values[idx]);
  }

  return dataPoints;
};

interface GetCurrentParams {
  data: RealTimeSingleLineDataRef;
}

export const calculateCurrent = ({ data }: GetCurrentParams): number => {
  if (!data || data.size === 0) return 0;

  const { values, head, maxPoints } = data;
  const lastIndex = (head - 1 + maxPoints) % maxPoints;
  return values[lastIndex] || 0;
};

export const calculateMin = ({ data, timeWindowMs }: GetTimeWindowDataParams): number => {
  const dataPoints = getTimeWindowData({ data, timeWindowMs });
  if (dataPoints.length === 0) return 0;

  return Math.min(...dataPoints);
};

export const calculateMax = ({ data, timeWindowMs }: GetTimeWindowDataParams): number => {
  const dataPoints = getTimeWindowData({ data, timeWindowMs });
  if (dataPoints.length === 0) return 0;

  return Math.max(...dataPoints);
};

export const calculateAvg = ({ data, timeWindowMs }: GetTimeWindowDataParams): number => {
  const dataPoints = getTimeWindowData({ data, timeWindowMs });
  if (dataPoints.length === 0) return 0;

  const sum = dataPoints.reduce((acc, val) => acc + val, 0);
  return sum / dataPoints.length;
};

export const calculateExceedCount = ({
  data,
  timeWindowMs,
  highlightThreshold,
}: GetTimeWindowDataParams & { highlightThreshold: number }): number => {
  const dataPoints = getTimeWindowData({ data, timeWindowMs });
  if (dataPoints.length === 0) return 0;

  return dataPoints.filter((value) => value > highlightThreshold).length;
};

export const calculateExceedPercent = ({
  data,
  timeWindowMs,
  highlightThreshold,
}: GetTimeWindowDataParams & { highlightThreshold: number }): number => {
  const dataPoints = getTimeWindowData({ data, timeWindowMs });
  if (dataPoints.length === 0) return 0;

  const exceedCount = dataPoints.filter((value) => value > highlightThreshold).length;
  return (exceedCount / dataPoints.length) * 100;
};

interface CalculateStatisticsParams {
  data: RealTimeSingleLineDataRef;
  timeWindowMs: number;
  highlightThreshold: number;
}

export const calculateStatistics = ({
  data,
  timeWindowMs,
  highlightThreshold,
}: CalculateStatisticsParams): Statistics => {
  return {
    current: calculateCurrent({ data }),
    min: calculateMin({ data, timeWindowMs }),
    max: calculateMax({ data, timeWindowMs }),
    avg: calculateAvg({ data, timeWindowMs }),
    exceedCount: calculateExceedCount({ data, timeWindowMs, highlightThreshold }),
    exceedPercent: calculateExceedPercent({ data, timeWindowMs, highlightThreshold }),
  };
};

