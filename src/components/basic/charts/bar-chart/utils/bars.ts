import { select, type Selection } from 'd3-selection';
import type { ScaleTime, ScaleLinear } from 'd3-scale';

import { type ChartColors } from '../../shared/types';
import { type CreateBarsConfig, type BarsSelection } from './types';
import { BAR_OPACITY, BAR_BORDER_RADIUS } from '../../shared/constants';
import type { BarDataPoint } from '../../shared/types';

const createTooltip = (
  g: Selection<SVGGElement, unknown, null, undefined>,
  d: BarDataPoint,
  xScale: ScaleTime<number, number>,
  yScale: ScaleLinear<number, number>,
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
  selection: Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>,
  g: Selection<SVGGElement, unknown, null, undefined>,
  xScale: ScaleTime<number, number>,
  yScale: ScaleLinear<number, number>,
  chartColors: ChartColors,
): void => {
  selection
    .on('mouseenter', null)
    .on('mouseleave', null)
    .on('mouseenter', function (_event, d) {
      select(this);

      createTooltip(g, d, xScale, yScale, chartColors);
    })
    .on('mouseleave', function () {
      select(this);

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

  barsExit.interrupt().on('mouseenter', null).on('mouseleave', null);

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

  const barsUpdate = barsEnter.merge(bars);

  barsUpdate.attr('x', (d) => xScale(new Date(d.time)) - barWidth / 2).attr('width', barWidth);

  attachHoverHandlers(barsUpdate, g, xScale, yScale, chartColors);

  return {
    barsEnter,
    barsUpdate,
    barsExit,
  };
};
