import * as d3 from 'd3';

import { type PieDataPoint } from '../types';
import { type CreateArcsConfig } from './types';
import {
  ARC_ANIMATION_DURATION,
  ARC_ANIMATION_DELAY,
  HOVER_ANIMATION_DURATION,
  HOVER_SCALE,
  ARC_OPACITY,
  SHADOW_OPACITY,
  STROKE_WIDTH,
  STROKE_OPACITY,
} from './constants';

export const createArcs = ({
  g,
  pieData,
  arc,
  colors,
}: CreateArcsConfig): d3.Selection<
  SVGGElement,
  d3.PieArcDatum<PieDataPoint>,
  SVGGElement,
  unknown
> => {
  const shadowGroup = g
    .append('g')
    .attr('opacity', SHADOW_OPACITY)
    .attr('filter', 'url(#pie-shadow)');

  shadowGroup
    .selectAll<SVGPathElement, d3.PieArcDatum<PieDataPoint>>('.shadow-arc')
    .data(pieData)
    .enter()
    .append('path')
    .attr('class', 'shadow-arc')
    .attr('d', arc)
    .attr('fill', 'var(--color-slate-900)')
    .attr('opacity', 0);

  const arcs = g
    .selectAll<SVGGElement, d3.PieArcDatum<PieDataPoint>>('.arc')
    .data(pieData)
    .enter()
    .append('g')
    .attr('class', 'arc');

  arcs
    .append('path')
    .attr('d', arc)
    .attr('fill', (_d, i) => `url(#pie-gradient-${i % colors.length})`)
    .attr('stroke', 'var(--color-slate-800)')
    .attr('stroke-width', STROKE_WIDTH)
    .attr('stroke-opacity', STROKE_OPACITY)
    .attr('opacity', 0)
    .style('cursor', 'pointer')
    .on('mouseenter', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('transform', `scale(${HOVER_SCALE})`)
        .attr('opacity', 1);
    })
    .on('mouseleave', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('transform', 'scale(1)')
        .attr('opacity', ARC_OPACITY);
    })
    .transition()
    .duration(ARC_ANIMATION_DURATION)
    .ease(d3.easeElasticOut)
    .delay((_d, i) => i * ARC_ANIMATION_DELAY)
    .attr('opacity', ARC_OPACITY)
    .attrTween('d', function (datum) {
      const innerRadius = arc.innerRadius()(datum);
      const interpolate = d3.interpolate(
        { startAngle: 0, endAngle: 0, innerRadius, outerRadius: innerRadius },
        datum,
      );
      return (t) => {
        const current = interpolate(t);
        return arc(current)!;
      };
    });

  return arcs;
};
