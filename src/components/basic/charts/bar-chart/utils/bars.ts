import * as d3 from 'd3';

import { type BarDataPoint } from './types';
import { type ChartColors } from '../../shared/chart-utils';
import { type CreateBarsConfig, type BarsSelection } from './types';
import {
  BAR_OPACITY,
  BAR_BORDER_RADIUS,
  HOVER_ANIMATION_DURATION,
  BAR_HOVER_OPACITY,
  BAR_FINAL_OPACITY,
  HOVER_TRANSLATE_Y,
} from '../../shared/constants';

const createTooltip = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  d: BarDataPoint,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartColors: ChartColors,
): void => {
  g.selectAll('.bar-tooltip').remove();

  const x = xScale(new Date(d.time));
  const y = yScale(d.value) - 10;

  const tooltipGroup = g
    .append('g')
    .attr('class', 'bar-tooltip')
    .attr('transform', `translate(${x}, ${y})`);

  tooltipGroup
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', chartColors.text)
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('pointer-events', 'none')
    .text(d.value.toFixed(1));
};

const attachHoverHandlers = (
  selection: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartColors: ChartColors,
): void => {
  selection
    .on('mouseenter', function (_event, d) {
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('opacity', BAR_HOVER_OPACITY)
        .attr('transform', `translate(0, ${HOVER_TRANSLATE_Y})`);

      createTooltip(g, d, xScale, yScale, chartColors);
    })
    .on('mouseleave', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_ANIMATION_DURATION)
        .attr('opacity', BAR_FINAL_OPACITY)
        .attr('transform', 'translate(0, 0)');

      g.selectAll('.bar-tooltip').remove();
    });
};

export const createBars = ({
  g,
  data,
  xScale,
  yScale,
  chartHeight,
  gradientId,
  barWidth,
  chartColors,
}: CreateBarsConfig): BarsSelection => {
  const bars = g
    .selectAll<SVGRectElement, BarDataPoint>('.bar')
    .data(data, (d) => d.time.toString());

  const barsExit = bars.exit();
  g.selectAll('.bar-tooltip').remove();

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
    .style('cursor', 'pointer');

  attachHoverHandlers(barsEnter, g, xScale, yScale, chartColors);

  const barsUpdate = barsEnter.merge(bars);

  barsUpdate.attr('x', (d) => xScale(new Date(d.time)) - barWidth / 2).attr('width', barWidth);

  attachHoverHandlers(barsUpdate, g, xScale, yScale, chartColors);

  return {
    barsEnter,
    barsUpdate,
    barsExit,
  };
};
