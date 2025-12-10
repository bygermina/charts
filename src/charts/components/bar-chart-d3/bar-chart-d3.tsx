import { useState, useEffect } from 'react';

import { BarChart, type DataPoint, type ChartVariant } from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';
import { generateTimeSeriesData } from '@/utils/data-generators';

type BarDataPoint = DataPoint;

const generateBarData = (count: number, startTime?: number, endTime?: number): BarDataPoint[] =>
  generateTimeSeriesData({
    count,
    startTime,
    endTime,
    valueGenerator: () => Math.random() * 100 + 20,
  });

const chartVariant = 'normal';

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
  const [barData, setBarData] = useState<BarDataPoint[]>(() => generateBarData(count));

  useEffect(() => {
    let timeoutId: number;
    let wasHidden = document.hidden;

    const tick = () => {
      if (document.hidden) return;

      const now = Date.now();

      setBarData((prev) => {
        const trimmed = prev.length >= count ? prev.slice(prev.length - count + 1) : prev.slice(1);
        trimmed.push({
          time: now,
          value: Math.random() * 100 + 20,
        });
        return trimmed;
      });

      timeoutId = setTimeout(tick, delay);
    };

    const startTick = () => {
      if (!document.hidden) {
        timeoutId = setTimeout(tick, delay);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHidden = true;
        clearTimeout(timeoutId);
      } else if (wasHidden) {
        wasHidden = false;
        const now = Date.now();
        setBarData(generateBarData(count, undefined, now));
        startTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTick();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, count]);

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
