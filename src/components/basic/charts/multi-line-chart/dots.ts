import { select } from 'd3-selection';

import { type DataPoint } from '../shared/types';
import { type UpdateDotsConfig, type CreateDotsConfig } from './types';

export const createAndAnimateDots = ({
  lineGroup,
  lineIndex,
  data,
  color,
  isInitialRender,
  xScale,
  yScale,
}: CreateDotsConfig & {
  xScale: UpdateDotsConfig['xScale'];
  yScale: UpdateDotsConfig['yScale'];
}): void => {
  lineGroup.selectAll('*').interrupt();

  const dots = lineGroup
    .selectAll<SVGCircleElement, DataPoint>(`.dot-${lineIndex}`)
    .data(data, (d) => d.time);

  const dotsUpdate = dots
    .join(
      (enter) =>
        enter
          .append('circle')
          .attr('class', `dot-${lineIndex}`)
          .attr('r', 0)
          .attr('fill', color)
          .attr('opacity', 0.7)
          .attr('stroke', color)
          .attr('stroke-width', 1),
      (update) => update,
      (exit) => exit.remove(),
    )
    .attr('cx', (d) => xScale(d.time))
    .attr('cy', (d) => yScale(d.value));

  if (isInitialRender && !document.hidden) {
    dotsUpdate
      .attr('r', 0)
      .attr('opacity', 0)
      .attr('r', 2.5)
      .attr('opacity', 0.9)
      .on('end', function () {
        if (document.hidden) {
          select(this).interrupt();
        }
      });
  } else {
    dotsUpdate.attr('r', 2.5).attr('opacity', 0.9);
  }
};
