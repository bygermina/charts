export interface DataPoint {
  time: number;
  value: number;
}

export type BarDataPoint = DataPoint;

export type ChartVariant = 'normal' | 'accent';

export const getChartColors = (variant: ChartVariant = 'normal') => {
  return {
    primary: `var(--chart-${variant}-primary)`,
    secondary: `var(--chart-${variant}-secondary)`,
    tertiary: `var(--chart-${variant}-tertiary)`,
    quaternary: `var(--chart-${variant}-quaternary)`,
    primaryOpacity: `var(--chart-${variant}-primary-opacity)`,
    grid: `var(--chart-${variant}-grid)`,
    text: `var(--chart-${variant}-text)`,
    textSecondary: `var(--chart-${variant}-text-secondary)`,
  };
};

export type ChartColors = ReturnType<typeof getChartColors>;
