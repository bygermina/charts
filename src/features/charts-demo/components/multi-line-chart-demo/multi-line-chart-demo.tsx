import { useState, useMemo, useCallback } from 'react';

import {
  MultiLineChart,
  type DataPoint,
  getChartColors,
  type ChartVariant,
  useVisibilityAwareTimer,
  ResponsiveChartWrapper,
} from '@/entities/chart';
import { generateTimeSeriesData } from '@/shared/lib/utils';

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

interface MultiLineChartDemoProps {
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

export const MultiLineChartDemo = ({
  delay = 1000,
  count = 30,
  variant = chartVariant,
  showLegend = true,
  width,
  height = DEFAULT_CHART_HEIGHT,
  linesConfig = DEFAULT_LINES_CONFIG,
}: MultiLineChartDemoProps) => {
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

  const onTick = useCallback(() => {
    const now = Date.now();
    setLinesData((prev) =>
      updateLinesData({
        prevLinesData: prev,
        linesWithColors,
        count,
        now,
      }),
    );
  }, [linesWithColors, count]);

  const onVisible = useCallback(() => {
    const now = Date.now();
    setLinesData(linesWithColors.map(() => generateLineData(count, undefined, now)));
  }, [linesWithColors, count]);

  useVisibilityAwareTimer({
    delay,
    onTick,
    onVisible,
  });

  const mappedLines = useMemo(
    () =>
      linesData.map((data, index) => ({
        data,
        color: linesWithColors[index].color,
        label: linesWithColors[index].label,
        showDots: linesWithColors[index].showDots,
      })),
    [linesData, linesWithColors],
  );

  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }) => (
        <MultiLineChart
          lines={mappedLines}
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
