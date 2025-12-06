import * as d3 from 'd3';

import { type BarDataPoint } from '../types';
import { type AnimateBarsConfig } from './types';
import { BAR_ANIMATION_DURATION, BAR_ANIMATION_DELAY, BAR_FINAL_OPACITY } from './constants';

export const animateBars = ({ bars, yScale, chartHeight }: AnimateBarsConfig): void => {
  bars
    .transition()
    .duration(BAR_ANIMATION_DURATION)
    .ease(d3.easeCubicOut)
    .delay((_d, i) => i * BAR_ANIMATION_DELAY)
    .attr('y', (d) => yScale(d.value))
    .attr('height', (d) => chartHeight - yScale(d.value))
    .attr('opacity', BAR_FINAL_OPACITY);
};

export const updateBars = ({
  barsEnter,
  barsUpdate,
  barsExit,
  yScale,
  chartHeight,
}: {
  barsEnter: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsUpdate: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsExit: d3.Selection<SVGRectElement, unknown, SVGGElement, unknown>;
  yScale: d3.ScaleLinear<number, number>;
  chartHeight: number;
}): void => {
  const barsEnterData = barsEnter.data() as BarDataPoint[];
  if (barsEnterData.length > 0) {
    const maxTime = Math.max(...barsEnterData.map((d) => d.time));
    const rightmostBar = barsEnter.filter((d) => d.time === maxTime);

    rightmostBar
      .transition()
      .duration(BAR_ANIMATION_DURATION)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d.value))
      .attr('height', (d) => chartHeight - yScale(d.value))
      .attr('opacity', BAR_FINAL_OPACITY);

    barsEnter
      .filter((d) => d.time !== maxTime)
      .attr('y', (d) => yScale(d.value))
      .attr('height', (d) => chartHeight - yScale(d.value))
      .attr('opacity', BAR_FINAL_OPACITY);
  }

  const enterNodes = new Set(barsEnter.nodes());
  barsUpdate
    .filter((_d, i, nodes) => {
      const node = nodes[i];
      return !enterNodes.has(node);
    })
    .attr('y', (d) => yScale(d.value))
    .attr('height', (d) => chartHeight - yScale(d.value));

  barsExit
    .transition()
    .duration(BAR_ANIMATION_DURATION / 2)
    .attr('opacity', 0)
    .attr('height', 0)
    .remove();
};
