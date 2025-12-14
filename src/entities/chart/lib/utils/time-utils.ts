import { timeFormat } from 'd3-time-format';

export const getTimeFormatter = (min: number, max: number): ((date: Date) => string) => {
  const timeRange = max - min;
  const oneDay = 24 * 60 * 60 * 1000;

  return timeRange > oneDay ? timeFormat('%d.%m %H:%M') : timeFormat('%H:%M:%S');
};

export const isTimestamp = (min: number | Date, max: number | Date): boolean => {
  if (min instanceof Date || max instanceof Date) return false;

  return typeof min === 'number' && typeof max === 'number' && min > 1000000000;
};
