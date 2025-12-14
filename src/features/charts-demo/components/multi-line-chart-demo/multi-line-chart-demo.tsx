import { useState, useMemo, useCallback } from 'react';

import {
  MultiLineChart,
  type LineSeries,
  getChartColors,
  type ChartVariant,
  type ChartColors,
  useVisibilityAwareTimer,
  ResponsiveChartWrapper,
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
  linesWithColors.map((config) => ({
    data: generateTimeSeriesData({
      count,
      valueGenerator: config.generateValue,
    }),
    color: config.color,
    label: config.label,
    showDots: config.showDots,
  }));

export const MultiLineChartDemo = ({
  delay = 1000,
  count = 30,
  variant = chartVariant,
  showLegend = true,
  width,
  height = DEFAULT_CHART_HEIGHT,
  linesConfig = DEFAULT_LINES_CONFIG,
}: MultiLineChartDemoProps) => {
  const linesWithColors = useMemo(
    () => createLinesWithColors(linesConfig, variant),
    [linesConfig, variant],
  );

  const [lines, setLines] = useState<LineSeries[]>(() =>
    createInitialLines(count, linesWithColors),
  );

  const onUpdate = useCallback(() => {
    setLines((prev) =>
      updateLinesData({
        prevLines: prev,
        linesWithColors,
        count,
        now: Date.now(),
      }),
    );
  }, [linesWithColors, count]);

  useVisibilityAwareTimer({
    delay,
    onTick: onUpdate,
    onVisible: onUpdate,
  });

  return (
    <ResponsiveChartWrapper width={width} height={height} fixedWidth={!width}>
      {({ width: chartWidth, height: chartHeight }) => (
        <MultiLineChart
          lines={lines}
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
