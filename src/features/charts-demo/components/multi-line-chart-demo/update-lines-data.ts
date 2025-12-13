import type { LineSeries } from '@/entities/chart';
import { generateTimeSeriesData } from '@/shared/lib/utils';

interface LineConfig {
  color?: string;
  label: string;
  showDots?: boolean;
  generateValue: () => number;
}

interface UpdateLinesDataConfig {
  prevLines: LineSeries[];
  linesWithColors: LineConfig[];
  count: number;
  now: number;
}

export const updateLinesData = ({
  prevLines,
  linesWithColors,
  count,
  now,
}: UpdateLinesDataConfig): LineSeries[] => {
  if (prevLines.length !== linesWithColors.length) {
    return linesWithColors.map((config, index) => {
      if (index < prevLines.length) {
        const prevLine = prevLines[index];
        const trimmed = prevLine.data.slice(1);

        trimmed.push({
          time: now,
          value: config.generateValue(),
        });
        return {
          ...prevLine,
          data: trimmed,
        };
      }
      return {
        data: generateTimeSeriesData({
          count,
          endTime: now,
          valueGenerator: config.generateValue,
        }),
        color: config.color || '',
        label: config.label,
        showDots: config.showDots,
      };
    });
  }

  return prevLines.map((prevLine, index) => {
    if (index >= linesWithColors.length) return prevLine;

    const trimmed = prevLine.data.slice(1);

    trimmed.push({
      time: now,
      value: linesWithColors[index].generateValue(),
    });
    return {
      ...prevLine,
      data: trimmed,
    };
  });
};
