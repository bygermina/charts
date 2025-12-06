import { type CreateLabelsConfig } from './types';
import {
  MIN_PERCENT_FOR_LABEL,
  LABEL_OFFSET_RATIO,
  LABEL_ANIMATION_DURATION,
  LABEL_ANIMATION_DELAY,
} from './constants';

export const createLabels = ({
  arcs,
  arc,
  innerRadius,
  outerRadius,
  textColor,
}: CreateLabelsConfig): void => {
  arcs
    .append('text')
    .attr('transform', (d) => {
      const [x, y] = arc.centroid(d);
      const angle = (d.startAngle + d.endAngle) / 2;
      const radiusOffset = (outerRadius - innerRadius) * LABEL_OFFSET_RATIO;
      const xOffset = Math.cos(angle) * radiusOffset;
      const yOffset = Math.sin(angle) * radiusOffset;
      return `translate(${x + xOffset}, ${y + yOffset})`;
    })
    .attr('text-anchor', 'middle')
    .attr('fill', textColor)
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .attr('opacity', 0)
    .attr('pointer-events', 'none')
    .text((d) => {
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
      return percent > MIN_PERCENT_FOR_LABEL ? `${Math.round(percent)}%` : '';
    })
    .transition()
    .duration(LABEL_ANIMATION_DURATION)
    .delay((_d, i) => i * LABEL_ANIMATION_DELAY + 400)
    .attr('opacity', 0.9);
};
