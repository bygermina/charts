import * as d3 from 'd3';

import { type ScatterDataPoint } from '../types';
import { type CreateDotsConfig } from './types';
import {
  DOT_OPACITY,
  DOT_HOVER_OPACITY,
  DOT_HOVER_MULTIPLIER,
  HOVER_ANIMATION_DURATION,
  DOT_ANIMATION_DURATION,
  DOT_ANIMATION_DELAY,
  STROKE_OPACITY,
  STROKE_WIDTH,
  STROKE_WIDTH_HOVER,
} from './constants';

export const createDots = ({
  g,
  data,
  xScale,
  yScale,
  categoryColors,
  defaultColor,
  dotRadius,
}: CreateDotsConfig): d3.Selection<SVGCircleElement, ScatterDataPoint, SVGGElement, unknown> => {
  const dots = g
    .selectAll<SVGCircleElement, ScatterDataPoint>('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', (d) => xScale(d.x))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 0)
    .attr('fill', (d) => categoryColors[d.category] || defaultColor)
    .attr('opacity', 0)
    .attr('stroke', (d) => categoryColors[d.category] || defaultColor)
    .attr('stroke-width', STROKE_WIDTH)
    .attr('stroke-opacity', STROKE_OPACITY)
    .style('cursor', 'pointer')
    .on('mouseenter', function (_event, d) {
      const currentSize = d.size || dotRadius;
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('r', currentSize * DOT_HOVER_MULTIPLIER)
        .attr('opacity', DOT_HOVER_OPACITY)
        .attr('stroke-width', STROKE_WIDTH_HOVER);
    })
    .on('mouseleave', function (_event, d) {
      const currentSize = d.size || dotRadius;
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('r', currentSize)
        .attr('opacity', DOT_OPACITY)
        .attr('stroke-width', STROKE_WIDTH);
    });

  dots
    .transition()
    .duration(DOT_ANIMATION_DURATION)
    .ease(d3.easeCubicOut)
    .delay((_d, i) => i * DOT_ANIMATION_DELAY)
    .attr('r', (d) => d.size || dotRadius)
    .attr('opacity', DOT_OPACITY);

  return dots;
};

