export interface DataPoint {
  time: number;
  value: number;
}

export interface BarDataPoint {
  time: number;
  value: number;
}

export type ChartVariant = 'normal' | 'accent';

export const getChartColors = (variant: ChartVariant = 'normal') => {
  const prefix = variant === 'accent' ? 'accent' : 'normal';

  return {
    primary: `var(--chart-${prefix}-primary)`,
    secondary: `var(--chart-${prefix}-secondary)`,
    tertiary: `var(--chart-${prefix}-tertiary)`,
    quaternary: `var(--chart-${prefix}-quaternary)`,
    primaryOpacity: `var(--chart-${prefix}-primary-opacity)`,
    grid: `var(--chart-${prefix}-grid)`,
    text: `var(--chart-${prefix}-text)`,
    textSecondary: `var(--chart-${prefix}-text-secondary)`,
  };
};
