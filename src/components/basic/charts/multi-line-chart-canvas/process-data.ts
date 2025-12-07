import { type LineSeries } from '../multi-line-chart/types';

export const processLinesData = (
  lines: LineSeries[],
  timeWindowStart: number,
  maxDisplayPoints: number = 200,
): LineSeries[] => {
  return lines.map((line) => {
    const limited = line.data.slice(-maxDisplayPoints);
    const filtered = limited.filter((point) => point.time >= timeWindowStart);

    return { ...line, data: filtered.length > 0 ? filtered : limited };
  });
};
