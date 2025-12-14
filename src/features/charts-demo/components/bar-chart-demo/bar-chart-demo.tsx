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

const valueGenerator = () => Math.random() * 100 + 20;

interface BarChartDemoProps {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  width?: number;
  height?: number;
}

export const BarChartDemo = ({
  delay = 1000,
  count = 50,
  variant = 'normal',
  width,
  height = 300,
}: BarChartDemoProps) => {
  const [barData, setBarData] = useState<BarDataPoint[]>(() =>
    generateTimeSeriesData({
      count,
      valueGenerator,
    }),
  );

  useVisibilityAwareTimer({
    delay,
    onTick: () => {
      setBarData((prev) => {
        const trimmed = prev.slice(1);

        trimmed.push({
          time: Date.now(),
          value: valueGenerator(),
        });

        return trimmed;
      });
    },
    onVisible: () => {
      setBarData(
        generateTimeSeriesData({
          count,
          endTime: Date.now(),
          valueGenerator,
        }),
      );
    },
  });

  return (
    <ResponsiveChartWrapper width={width} height={height} fixedWidth={!width}>
      {({ width: chartWidth, height: chartHeight }: { width: number; height: number }) => (
        <BarChart
          data={barData}
          width={chartWidth}
          height={chartHeight}
          variant={variant}
          showGrid={true}
          margin={{ left: 30 }}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
