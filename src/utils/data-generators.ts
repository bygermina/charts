import { type DataPoint } from '@/components/basic/charts';

interface GenerateDataConfig {
  count: number;
  startTime?: number;
  endTime?: number;
  valueGenerator?: () => number;
}

export const generateTimeSeriesData = ({
  count,
  startTime,
  endTime,
  valueGenerator = () => Math.random() * 100 + 50,
}: GenerateDataConfig): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = endTime ?? Date.now();
  const start = startTime ?? now - (count - 1) * 1000;
  const timeRange = now - start;
  const interval = timeRange / (count - 1);

  for (let i = 0; i < count; i++) {
    data.push({
      time: start + i * interval,
      value: valueGenerator(),
    });
  }

  return data;
};
