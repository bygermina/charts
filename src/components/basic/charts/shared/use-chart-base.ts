import { useRef, useMemo } from 'react';

import { type ChartVariant, getChartColors } from './types';
import { getChartDimensions, type ChartBaseConfig } from './chart-utils';

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

  const chartColors = useMemo(() => getChartColors(config.variant || 'normal'), [config.variant]);

  const { margin, chartWidth, chartHeight } = useMemo(() => getChartDimensions(config), [config]);

  return {
    svgRef,
    chartColors,
    margin,
    chartWidth,
    chartHeight,
  };
};
