import { getClippedWidth } from '../../../lib/chart-dimensions';
import { createGrid } from '../../../lib/chart-utils';
import type { SVGGroupSelection } from '../../../model/types';
import { type ManageGridConfig } from '../types';

export const manageGrid = ({
  mainGroup,
  xScale,
  yScale,
  chartWidth,
  chartHeight,
  margin,
  gridLeftShift,
  chartColors,
  svgElement,
  shouldAnimate = false,
}: ManageGridConfig & { shouldAnimate?: boolean }): SVGGroupSelection | null => {
  const existingGridGroup = mainGroup.select<SVGGElement>('g.grid-group');
  const savedTransform = existingGridGroup.empty() ? '' : existingGridGroup.attr('transform') || '';

  const gridGroup = createGrid(
    mainGroup,
    xScale,
    yScale,
    getClippedWidth(chartWidth, margin.right),
    chartHeight,
    chartColors,
    svgElement,
  );

  if (!shouldAnimate) {
    const transform = savedTransform || `translate(${-gridLeftShift}, 0)`;
    gridGroup.attr('transform', transform);
  }

  return gridGroup;
};
