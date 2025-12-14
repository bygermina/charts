import { DEFAULT_MARGIN } from '../model/constants';

export interface ChartBaseConfig {
  width: number;
  height: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

export const getChartDimensions = (config: ChartBaseConfig) => {
  const margin = config.margin
    ? {
        top: config.margin.top ?? DEFAULT_MARGIN.top,
        right: config.margin.right ?? DEFAULT_MARGIN.right,
        bottom: config.margin.bottom ?? DEFAULT_MARGIN.bottom,
        left: config.margin.left ?? DEFAULT_MARGIN.left,
      }
    : DEFAULT_MARGIN;
  const chartWidth = config.width - margin.left - margin.right;
  const chartHeight = config.height - margin.top - margin.bottom;

  return { margin, chartWidth, chartHeight };
};

export const getClippedWidth = (chartWidth: number, marginRight: number): number => {
  return chartWidth - marginRight;
};
