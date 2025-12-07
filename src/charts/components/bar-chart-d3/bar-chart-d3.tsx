import { useState, useEffect } from 'react';

import { BarChart, type BarDataPoint, type ChartVariant } from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';

const generateBarData = (count: number, startTime?: number, endTime?: number): BarDataPoint[] => {
  const data: BarDataPoint[] = [];
  const now = endTime ?? Date.now();
  const start = startTime ?? now - (count - 1) * 1000;
  const timeRange = now - start;
  const interval = timeRange / (count - 1);

  for (let i = 0; i < count; i++) {
    data.push({
      time: start + i * interval,
      value: Math.random() * 100 + 20,
    });
  }

  return data;
};

const chartVariant = 'normal';

export const BarChartD3 = ({
  delay = 1000,
  count = 50,
  variant = chartVariant,
  width,
  height,
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
        <BarChart data={barData} width={chartWidth} height={chartHeight} variant={variant} />
      )}
    </ResponsiveChartWrapper>
  );
};
