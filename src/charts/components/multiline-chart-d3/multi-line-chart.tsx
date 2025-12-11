import { useState, useMemo, memo } from 'react';

import {
  MultiLineChart,
  type DataPoint,
  getChartColors,
  type ChartVariant,
  ResponsiveChartWrapper,
  useVisibilityAwareTimer,
} from '@/components/basic/charts';
import { generateTimeSeriesData } from '@/utils/data-generators';

import { updateLinesData } from './update-lines-data';

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
  const chartColors = useMemo(() => getChartColors(variant), [variant]);

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

  useVisibilityAwareTimer({
    delay,
    onTick: () => {
      const now = Date.now();
      setLinesData((prev) =>
        updateLinesData({
          prevLinesData: prev,
          linesWithColors,
          count,
          now,
        }),
      );
    },
    onVisible: () => {
      const now = Date.now();
      setLinesData(linesWithColors.map(() => generateLineData(count, undefined, now)));
    },
  });

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
