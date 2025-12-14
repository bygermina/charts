import type { LineSeries } from '../../ui/multi-line-chart/types';

export const extractTimesFromLines = (lines: LineSeries[]): number[] => {
  return lines.flatMap((line) => (line?.data || []).map((point) => point.time));
};

export const extractValuesFromLines = (lines: LineSeries[]): number[] => {
  return lines.flatMap((line) => line.data.map((d) => d.value));
};
