import { useEffect, useMemo } from 'react';

import { type ScatterDataPoint, type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import {
  createGrid,
  createAxes,
  initChart,
  createXAxisLabel,
  createYAxisLabel,
  createCircleLegend,
} from './chart-utils';
import {
  createScales,
  createDots,
  DEFAULT_X_AXIS_TICKS,
  DEFAULT_Y_AXIS_TICKS,
} from './scatter-chart/index';

interface ScatterChartProps {
  data: ScatterDataPoint[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  categoryColors?: Record<string, string>;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  dotRadius?: number;
}

export const ScatterChart = ({
  data,
  width = 600,
  height = 250,
  variant = 'normal',
  categoryColors,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  xDomain,
  yDomain,
  dotRadius = 2.5,
}: ScatterChartProps) => {
  const { svgRef, chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const defaultCategoryColors = useMemo(
    () => ({
      A: chartColors.primary,
      B: chartColors.secondary,
      C: chartColors.tertiary,
    }),
    [chartColors],
  );

  const finalCategoryColors = categoryColors || defaultCategoryColors;

  useEffect(() => {
    if (data.length === 0) return;

    const g = initChart(svgRef, margin);
    if (!g) return;

    const { xScale, yScale } = createScales({
      data,
      chartWidth,
      chartHeight,
      xDomain,
      yDomain,
    });

    if (showGrid) {
      createGrid(g, xScale, yScale, chartWidth, chartHeight, chartColors);
    }

    createAxes(
      g,
      xScale,
      yScale,
      chartHeight,
      chartColors,
      DEFAULT_X_AXIS_TICKS,
      DEFAULT_Y_AXIS_TICKS,
    );

    if (xAxisLabel) {
      createXAxisLabel(g, xAxisLabel, chartWidth, chartHeight, chartColors);
    }

    if (yAxisLabel) {
      createYAxisLabel(g, yAxisLabel, chartHeight, chartColors);
    }

    createDots({
      g,
      data,
      xScale,
      yScale,
      categoryColors: finalCategoryColors,
      defaultColor: chartColors.primary,
      dotRadius,
    });

    if (showLegend) {
      const categories = Object.keys(finalCategoryColors) as Array<
        keyof typeof finalCategoryColors
      >;
      const legendItems = categories.map((cat) => ({
        label: `Category ${cat}`,
        color: finalCategoryColors[cat],
        type: 'circle' as const,
      }));

      createCircleLegend(g, legendItems, chartWidth, chartColors);
    }
  }, [
    data,
    width,
    height,
    variant,
    chartColors,
    finalCategoryColors,
    showGrid,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    xDomain,
    yDomain,
    dotRadius,
    margin,
    chartWidth,
    chartHeight,
    svgRef,
  ]);

  return <svg ref={svgRef} width={width} height={height} />;
};
