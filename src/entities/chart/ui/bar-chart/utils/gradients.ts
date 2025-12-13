import { GRADIENT_START_OPACITY, GRADIENT_END_OPACITY } from '../../../model/constants';
import { type CreateGradientConfig } from './types';

export const createGradient = ({
  defs,
  color,
  chartHeight,
  gradientId,
}: CreateGradientConfig): void => {
  let gradient = defs.select<SVGLinearGradientElement>(`#${gradientId}`);

  if (gradient.empty()) {
    gradient = defs.append('linearGradient').attr('id', gradientId);
  }

  gradient
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', chartHeight);

  gradient.selectAll('stop').remove();

  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', GRADIENT_START_OPACITY);

  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', color)
    .attr('stop-opacity', GRADIENT_END_OPACITY);
};
