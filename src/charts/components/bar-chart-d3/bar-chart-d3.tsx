import { useState } from 'react';

import { BarChart, type DataPoint, type ChartVariant } from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';
import { useVisibilityAwareTimer } from '@/components/basic/charts/use-visibility-aware-timer';
import { generateTimeSeriesData } from '@/utils/data-generators';

type BarDataPoint = DataPoint;

const chartVariant = 'normal';
const VALUE_GENERATOR = () => Math.random() * 100 + 20;

export const BarChartD3 = ({
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
      valueGenerator: VALUE_GENERATOR,
    }),
  );

  useVisibilityAwareTimer({
    delay,
    onTick: () => {
      const now = Date.now();
      setBarData((prev) => {
        const trimmed = prev.length >= count ? prev.slice(prev.length - count + 1) : prev.slice(1);
        trimmed.push({
          time: now,
          value: VALUE_GENERATOR(),
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
          valueGenerator: VALUE_GENERATOR,
        }),
      );
    },
  });

  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }) => (
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
