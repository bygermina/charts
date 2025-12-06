import { useState, useEffect } from 'react';

import {
  MultiLineChart,
  type DataPoint,
  getChartColors,
  type ChartVariant,
} from '@/components/basic/charts';

const generateLineData = (count: number, startTime?: number, endTime?: number): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = endTime ?? Date.now();
  const start = startTime ?? now - (count - 1) * 1000;
  const timeRange = now - start;
  const interval = timeRange / (count - 1);

  for (let i = 0; i < count; i++) {
    data.push({
      time: start + i * interval,
      value: Math.random() * 100 + 50,
    });
  }

  return data;
};

const chartVariant = 'normal';

export const MultiLineChartD3 = ({
  delay = 1000,
  count = 30,
  variant = chartVariant,
  showLegend = true,
  width = 600,
  height = 250,
}: {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  showLegend?: boolean;
  width?: number;
  height?: number;
}) => {
  const [lineData, setLineData] = useState<DataPoint[]>(() => generateLineData(count));
  const [areaData, setAreaData] = useState<DataPoint[]>(() => generateLineData(count));

  const chartColors = getChartColors(chartVariant);

  useEffect(() => {
    let timeoutId: number;
    let wasHidden = document.hidden;

    const tick = () => {
      if (document.hidden) return;

      const now = Date.now();

      setLineData((prev) => {
        const trimmed = prev.length >= count ? prev.slice(prev.length - count + 1) : prev.slice(1);

        trimmed.push({
          time: now,
          value: Math.random() * 100 + 50,
        });
        return trimmed;
      });

      setAreaData((prev) => {
        const trimmed = prev.length >= count ? prev.slice(prev.length - count + 1) : prev.slice(1);

        trimmed.push({
          time: now,
          value: Math.random() * 80 + 30,
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
        setLineData(generateLineData(count, undefined, now));
        setAreaData(generateLineData(count, undefined, now));
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
    <MultiLineChart
      lines={[
        {
          data: lineData,
          color: chartColors.primary,
          label: 'Line 1',
          showDots: true,
        },
        {
          data: areaData,
          color: chartColors.tertiary,
          label: 'Line 2',
          showDots: true,
        },
      ]}
      width={width}
      height={height}
      variant={variant}
      showLegend={showLegend}
      yDomain={[0, 200]}
    />
  );
};
