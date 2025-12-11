import * as d3 from 'd3';

import { type DataPoint } from './types';
import { type UpdateDotsConfig, type CreateDotsConfig } from './types';

// Updates coordinates of dots on line
export const updateDotsCoordinates = ({
  lineGroup,
  lineIndex,
  data,
  xScale,
  yScale,
}: UpdateDotsConfig): void => {
  const dots = lineGroup.selectAll<SVGCircleElement, DataPoint>(`.dot-${lineIndex}`).data(data);

  dots.attr('cx', (d) => xScale(d.time)).attr('cy', (d) => yScale(d.value));
};

export const createAndAnimateDots = ({
  lineGroup,
  lineIndex,
  data,
  color,
  isInitialRender,
}: CreateDotsConfig): void => {
  lineGroup.selectAll<SVGCircleElement, DataPoint>(`.dot-${lineIndex}`).interrupt();

  const dots = lineGroup.selectAll<SVGCircleElement, DataPoint>(`.dot-${lineIndex}`).data(data);

  dots.exit().remove();

  const dotsEnter = dots
    .enter()
    .append('circle')
    .attr('class', `dot-${lineIndex}`)
    .attr('r', 0)
    .attr('fill', color)
    .attr('opacity', 0.7)
    .attr('stroke', color)
    .attr('stroke-width', 1);

  const dotsUpdate = dotsEnter.merge(dots);

  if (isInitialRender && !document.hidden) {
    dotsUpdate
      .attr('r', 0)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .delay((_, i) => (i / data.length) * 1000)
      .attr('r', 2.5)
      .attr('opacity', 0.9)
      .on('end', function () {
        if (document.hidden) {
          d3.select(this).interrupt();
        }
      });
  } else {
    dotsUpdate.attr('r', 2.5).attr('opacity', 0.9);
  }
};
