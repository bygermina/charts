import type { DataPoint } from '@/entities/chart';
import { generateTimeSeriesData } from '@/shared/lib/utils';

interface LineConfig {
  color?: string;
  label: string;
  showDots?: boolean;
  generateValue: () => number;
}

interface UpdateLinesDataConfig {
  prevLinesData: DataPoint[][];
  linesWithColors: LineConfig[];
  count: number;
  now: number;
}

export const updateLinesData = ({
  prevLinesData,
  linesWithColors,
  count,
  now,
}: UpdateLinesDataConfig): DataPoint[][] => {
  if (prevLinesData.length !== linesWithColors.length) {
    return linesWithColors.map((config, index) => {
      if (index < prevLinesData.length) {
        const lineData = prevLinesData[index];
        const trimmed = lineData.slice(1);

        trimmed.push({
          time: now,
          value: config.generateValue(),
        });
        return trimmed;
      }
      return generateTimeSeriesData({
        count,
        endTime: now,
        valueGenerator: config.generateValue,
      });
    });
  }

  return prevLinesData.map((lineData, index) => {
    if (index >= linesWithColors.length) return lineData;

    const trimmed = lineData.slice(1);

    trimmed.push({
      time: now,
      value: linesWithColors[index].generateValue(),
    });
    return trimmed;
  });
};
