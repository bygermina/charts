import { useRef } from 'react';

import { type ChartVariant, getChartColors } from './types';
import { DEFAULT_MARGIN, getChartDimensions, type ChartBaseConfig } from './chart-utils';

export interface UseChartBaseResult {
  svgRef: React.RefObject<SVGSVGElement | null>;
  chartColors: ReturnType<typeof getChartColors>;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
}

export const useChartBase = (
  config: ChartBaseConfig & {
    variant?: ChartVariant;
  },
): UseChartBaseResult => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartColors = getChartColors(config.variant || 'normal');
  const { margin, chartWidth, chartHeight } = getChartDimensions(config);

  return {
    svgRef,
    chartColors,
    margin: margin || DEFAULT_MARGIN,
    chartWidth,
    chartHeight,
  };
};
