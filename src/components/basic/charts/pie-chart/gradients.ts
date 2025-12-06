import { type CreateGradientsConfig } from './types';
import {
  GRADIENT_STOP_1_OFFSET,
  GRADIENT_STOP_1_OPACITY,
  GRADIENT_STOP_2_OFFSET,
  GRADIENT_STOP_2_OPACITY,
  GRADIENT_STOP_3_OFFSET,
  GRADIENT_STOP_3_OPACITY,
} from './constants';

export const createGradients = ({ defs, colors }: CreateGradientsConfig): void => {
  colors.forEach((color, i) => {
    let gradient = defs.select<SVGRadialGradientElement>(`#pie-gradient-${i}`);

    if (gradient.empty()) {
      gradient = defs.append('radialGradient').attr('id', `pie-gradient-${i}`);
    }

    gradient
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');

    gradient.selectAll('stop').remove();

    gradient
      .append('stop')
      .attr('offset', GRADIENT_STOP_1_OFFSET)
      .attr('stop-color', color)
      .attr('stop-opacity', GRADIENT_STOP_1_OPACITY);

    gradient
      .append('stop')
      .attr('offset', GRADIENT_STOP_2_OFFSET)
      .attr('stop-color', color)
      .attr('stop-opacity', GRADIENT_STOP_2_OPACITY);

    gradient
      .append('stop')
      .attr('offset', GRADIENT_STOP_3_OFFSET)
      .attr('stop-color', color)
      .attr('stop-opacity', GRADIENT_STOP_3_OPACITY);
  });
};
