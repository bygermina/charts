import { useState, useEffect, useMemo } from 'react';

import {
  MultiLineChart,
  type DataPoint,
  getChartColors,
  type ChartVariant,
} from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';
import { generateTimeSeriesData } from '@/utils/data-generators';

const generateLineData = (count: number, startTime?: number, endTime?: number): DataPoint[] =>
  generateTimeSeriesData({
    count,
    startTime,
    endTime,
    valueGenerator: () => Math.random() * 100 + 50,
  });

const chartVariant = 'normal';
const DEFAULT_CHART_HEIGHT = 300;

interface LineConfig {
  color?: string;
  label: string;
  showDots?: boolean;
  generateValue: () => number;
}

interface MultiLineChartD3Props {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  showLegend?: boolean;
  width?: number;
  height?: number;
  linesConfig?: LineConfig[];
}

const DEFAULT_LINES_CONFIG: LineConfig[] = [
  {
    color: '',
    label: 'Line 1',
    showDots: true,
    generateValue: () => Math.random() * 100 + 50,
  },
  {
    color: '',
    label: 'Line 2',
    showDots: true,
    generateValue: () => Math.random() * 80 + 30,
  },
];

export const MultiLineChartD3 = ({
  delay = 1000,
  count = 30,
  variant = chartVariant,
  showLegend = true,
  width,
  height = DEFAULT_CHART_HEIGHT,
  linesConfig = DEFAULT_LINES_CONFIG,
}: MultiLineChartD3Props) => {
  const chartColors = getChartColors(chartVariant);

  const linesWithColors = useMemo(
    () =>
      linesConfig.map((config, index) => ({
        ...config,
        color: config.color || (index === 0 ? chartColors.primary : chartColors.tertiary),
      })),
    [linesConfig, chartColors.primary, chartColors.tertiary],
  );

  const [linesData, setLinesData] = useState<DataPoint[][]>(() =>
    linesConfig.map(() => generateLineData(count)),
  );

  useEffect(() => {
    let timeoutId: number;
    let wasHidden = document.hidden;

    const tick = () => {
      if (document.hidden) return;

      const now = Date.now();

      setLinesData((prev) => {
        if (prev.length !== linesWithColors.length) {
          return linesWithColors.map((_, index) => {
            if (index < prev.length) {
              const lineData = prev[index];
              const trimmed = lineData.slice(1);

              trimmed.push({
                time: now,
                value: linesWithColors[index].generateValue(),
              });
              return trimmed;
            }
            return generateLineData(count, undefined, now);
          });
        }

        return prev.map((lineData, index) => {
          if (index >= linesWithColors.length) return lineData;

          const trimmed = lineData.slice(1);

          trimmed.push({
            time: now,
            value: linesWithColors[index].generateValue(),
          });
          return trimmed;
        });
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
        setLinesData(linesWithColors.map(() => generateLineData(count, undefined, now)));
        startTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTick();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, count, linesWithColors]);

  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }) => (
        <MultiLineChart
          lines={linesData.map((data, index) => ({
            data,
            color: linesWithColors[index].color,
            label: linesWithColors[index].label,
            showDots: linesWithColors[index].showDots,
          }))}
          width={chartWidth}
          height={chartHeight}
          variant={variant}
          showGrid={true}
          showLegend={showLegend}
          yDomain={[0, 200]}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
