import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { type PieDataPoint, type ChartVariant, getChartColors } from './types';
import { createRectLegend } from './chart-utils';
import {
  createPie,
  createArc,
  createGradients,
  createShadowFilter,
  createArcs,
  createLabels,
  RADIUS_MARGIN,
  INNER_RADIUS_RATIO,
} from './pie-chart/index';

interface PieChartProps {
  data: PieDataPoint[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showLabels?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
}

export const PieChart = ({
  data,
  width = 600,
  height = 250,
  variant = 'normal',
  showLabels = true,
  showLegend = true,
  innerRadius,
}: PieChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartColors = getChartColors(variant);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - RADIUS_MARGIN;
    const defaultInnerRadius = radius * INNER_RADIUS_RATIO;
    const finalInnerRadius = innerRadius ?? defaultInnerRadius;
    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = createPie();
    const pieData = pie(data);
    const arc = createArc({ innerRadius: finalInnerRadius, outerRadius: radius });

    const pieColors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.tertiary,
      chartColors.quaternary,
      chartColors.primaryOpacity,
    ];

    const defs = svg.append('defs');
    createGradients({ defs, colors: pieColors });
    createShadowFilter({ defs });

    const arcs = createArcs({ g, pieData, arc, colors: pieColors });

    if (showLabels) {
      createLabels({
        arcs,
        arc,
        innerRadius: finalInnerRadius,
        outerRadius: radius,
        textColor: chartColors.text,
      });
    }

    if (showLegend) {
      const legendItems = data.map((item, i) => ({
        label: item.label,
        color: pieColors[i % pieColors.length],
        type: 'rect' as const,
      }));

      createRectLegend(svg, legendItems, width, chartColors);
    }
  }, [data, width, height, variant, chartColors, showLabels, showLegend, innerRadius]);

  return <svg ref={svgRef} width={width} height={height} />;
};
