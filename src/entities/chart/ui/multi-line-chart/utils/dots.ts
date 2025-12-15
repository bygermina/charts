import type { Selection } from 'd3-selection';

import { type DataPoint, type LinearScale } from '../../../model/types';

interface RenderDotsConfig {
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  lineIndex: number;
  data: DataPoint[];
  color: string;
  xScale: LinearScale;
  yScale: LinearScale;
}

export const renderDots = ({
  lineGroup,
  lineIndex,
  data,
  color,
  xScale,
  yScale,
}: RenderDotsConfig): void => {
  const dots = lineGroup
    .selectAll<SVGCircleElement, DataPoint>(`.dot-${lineIndex}`)
    .data(data, (d) => d.time);

  dots
    .join(
      (enter) =>
        enter
          .append('circle')
          .attr('class', `dot-${lineIndex}`)
          .attr('fill', color)
          .attr('stroke', color)
          .attr('stroke-width', 1),
      (update) => update,
      (exit) => exit.remove(),
    )
    .attr('cx', (d) => xScale(d.time))
    .attr('cy', (d) => yScale(d.value))
    .attr('r', 2.5)
    .attr('opacity', 0.9);
};
