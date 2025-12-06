import * as d3 from 'd3';

import { type BarDataPoint } from '../types';
import { type CreateBarsConfig, type BarsSelection } from './types';
import {
  BAR_OPACITY,
  BAR_BORDER_RADIUS,
  HOVER_ANIMATION_DURATION,
  BAR_HOVER_OPACITY,
  BAR_FINAL_OPACITY,
  HOVER_TRANSLATE_Y,
} from './constants';

export const createBars = ({
  g,
  data,
  xScale,
  chartHeight,
  gradientId,
  barWidth,
}: CreateBarsConfig): BarsSelection => {
  const bars = g
    .selectAll<SVGRectElement, BarDataPoint>('.bar')
    .data(data, (d) => d.time.toString());

  const barsExit = bars.exit();

  const barsEnter = bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(new Date(d.time)) - barWidth / 2)
    .attr('width', barWidth)
    .attr('y', chartHeight)
    .attr('height', 0)
    .attr('fill', `url(#${gradientId})`)
    .attr('opacity', BAR_OPACITY)
    .attr('rx', BAR_BORDER_RADIUS)
    .attr('ry', BAR_BORDER_RADIUS)
    .style('cursor', 'pointer')
    .on('mouseenter', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('opacity', BAR_HOVER_OPACITY)
        .attr('transform', `translate(0, ${HOVER_TRANSLATE_Y})`);
    })
    .on('mouseleave', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('opacity', BAR_FINAL_OPACITY)
        .attr('transform', 'translate(0, 0)');
    });

  const barsUpdate = barsEnter.merge(bars);

  barsUpdate.attr('x', (d) => xScale(new Date(d.time)) - barWidth / 2).attr('width', barWidth);

  return {
    barsEnter,
    barsUpdate,
    barsExit,
  };
};
