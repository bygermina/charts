import { type CreateShadowFilterConfig } from './types';
import { SHADOW_BLUR, SHADOW_OFFSET_X, SHADOW_OFFSET_Y } from './constants';

export const createShadowFilter = ({ defs }: CreateShadowFilterConfig): void => {
  let shadowFilter = defs.select<SVGFilterElement>('#pie-shadow');

  if (shadowFilter.empty()) {
    shadowFilter = defs.append('filter').attr('id', 'pie-shadow');
  }

  shadowFilter.attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');

  shadowFilter.selectAll('*').remove();

  shadowFilter
    .append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', SHADOW_BLUR)
    .attr('result', 'blur');

  shadowFilter
    .append('feOffset')
    .attr('in', 'blur')
    .attr('dx', SHADOW_OFFSET_X)
    .attr('dy', SHADOW_OFFSET_Y)
    .attr('result', 'offsetBlur');

  const feMergeShadow = shadowFilter.append('feMerge');
  feMergeShadow.append('feMergeNode').attr('in', 'offsetBlur');
  feMergeShadow.append('feMergeNode').attr('in', 'SourceGraphic');
};
