import type { LineSeries } from '@/entities/chart';
import { generateTimeSeriesData } from '@/shared/lib/utils';

interface LineConfig {
  color: string;
  label: string;
  showDots?: boolean;
  generateValue: () => number;
}

interface UpdateLinesDataConfig {
  prevLines: LineSeries[];
  configsWithColors: LineConfig[];
  count: number;
  now: number;
}

export const updateLinesData = ({
  prevLines,
  configsWithColors,
  count,
  now,
}: UpdateLinesDataConfig): LineSeries[] => {
  if (prevLines.length !== configsWithColors.length) {
    return configsWithColors.map((config, index) => {
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
      const { generateValue, ...lineProps } = config;

      return {
        ...lineProps,
        data: generateTimeSeriesData({
          count,
          endTime: now,
          valueGenerator: generateValue,
        }),
      };
    });
  }

  return prevLines.map((prevLine, index) => {
    if (index >= configsWithColors.length) return prevLine;

    const trimmed = prevLine.data.slice(1);
    trimmed.push({
      time: now,
      value: configsWithColors[index].generateValue(),
    });

    return {
      ...prevLine,
      data: trimmed,
    };
  });
};
