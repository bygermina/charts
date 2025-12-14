import { useState, useMemo, useCallback } from 'react';

import {
  MultiLineChart,
  type LineSeries,
  getChartColors,
  type ChartVariant,
  type ChartColors,
  useVisibilityAwareTimer,
  ResponsiveChartWrapper,
  type ChartSize,
} from '@/entities/chart';
import { generateTimeSeriesData } from '@/shared/lib/utils';

import { updateLinesData } from './update-lines-data';

const chartVariant = 'normal';
const DEFAULT_CHART_HEIGHT = 300;

interface LineConfig {
  color: keyof ChartColors;
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
    color: 'primary',
    label: 'Line 1',
    showDots: true,
    generateValue: () => Math.random() * 100 + 50,
  },
  {
    color: 'tertiary',
    label: 'Line 2',
    showDots: true,
    generateValue: () => Math.random() * 80 + 30,
  },
];

const createLinesWithColors = (linesConfig: LineConfig[], variant: ChartVariant) => {
  const chartColors = getChartColors(variant);

  return linesConfig.map((config) => ({
    ...config,
    color: chartColors[config.color],
  }));
};

const createInitialLines = (
  count: number,
  linesWithColors: ReturnType<typeof createLinesWithColors>,
): LineSeries[] =>
  linesWithColors.map((config) => {
    const { generateValue: valueGenerator, ...lineProps } = config;

    return {
      ...lineProps,
      data: generateTimeSeriesData({
        count,
        valueGenerator,
      }),
    };
  });

export const MultiLineChartDemo = ({
  delay = 1000,
  count = 30,
  variant = chartVariant,
  showLegend = true,
  width,
  height = DEFAULT_CHART_HEIGHT,
  linesConfig = DEFAULT_LINES_CONFIG,
}: MultiLineChartDemoProps) => {
  const configsWithColors = useMemo(
    () => createLinesWithColors(linesConfig, variant),
    [linesConfig, variant],
  );

  const [lines, setLines] = useState<LineSeries[]>(() =>
    createInitialLines(count, configsWithColors),
  );

  const onUpdate = useCallback(() => {
    setLines((prev) =>
      updateLinesData({
        prevLines: prev,
        configsWithColors,
        count,
        now: Date.now(),
      }),
    );
  }, [configsWithColors, count]);

  const onVisible = useCallback(() => {
    setLines(createInitialLines(count, configsWithColors));
  }, [configsWithColors, count]);

  useVisibilityAwareTimer({
    delay,
    onTick: onUpdate,
    onVisible: onVisible,
    onHidden: () => setLines([]),
  });

  return (
    <ResponsiveChartWrapper width={width} height={height} fixedWidth={!width}>
      {({ width: chartWidth, height: chartHeight }: ChartSize) => (
        <MultiLineChart
          lines={lines}
          width={chartWidth}
          height={chartHeight}
          variant={variant}
          showGrid={true}
          showLegend={showLegend}
          yDomain={[0, 200]}
          margin={{ left: 30 }}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
