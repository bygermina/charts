import { useState } from 'react';

import {
  BarChart,
  type DataPoint,
  type ChartVariant,
  useVisibilityAwareTimer,
  ResponsiveChartWrapper,
} from '@/entities/chart';
import { generateTimeSeriesData } from '@/shared/lib/utils';

type BarDataPoint = DataPoint;

const chartVariant = 'normal';
const valueGenerator = () => Math.random() * 100 + 20;

export const BarChartDemo = ({
  delay = 1000,
  count = 50,
  variant = chartVariant,
  width,
  height = 300,
}: {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  width?: number;
  height?: number;
}) => {
  const [barData, setBarData] = useState<BarDataPoint[]>(() =>
    generateTimeSeriesData({
      count,
      valueGenerator,
    }),
  );

  useVisibilityAwareTimer({
    delay,
    onTick: () => {
      const now = Date.now();

      setBarData((prev) => {
        const trimmed = prev.slice(1);

        trimmed.push({
          time: now,
          value: valueGenerator(),
        });

        return trimmed;
      });
    },
    onVisible: () => {
      const now = Date.now();

      setBarData(
        generateTimeSeriesData({
          count,
          endTime: now,
          valueGenerator,
        }),
      );
    },
  });

  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }: { width: number; height: number }) => (
        <BarChart
          data={barData}
          width={chartWidth}
          height={chartHeight}
          variant={variant}
          showGrid={true}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
