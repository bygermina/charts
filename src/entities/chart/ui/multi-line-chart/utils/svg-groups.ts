import type { Selection } from 'd3-selection';

import { createChartGroups as createChartGroupsUtil } from '../../../lib/chart-utils';
import { type GetOrCreateLinePathConfig } from '../types';

export const createChartGroups = (config: {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  margin: { left: number; top: number };
}) => createChartGroupsUtil({ ...config, useClipPath: true });

export const getOrCreateLinePath = ({
  lineGroup,
  color,
  strokeWidth,
}: GetOrCreateLinePathConfig) => {
  const selection = lineGroup
    .selectAll<SVGPathElement, string>('path.line-path')
    .data(['line-path'], (d) => d)
    .join(
      (enter) =>
        enter
          .append('path')
          .attr('class', 'line-path')
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', strokeWidth)
          .attr('stroke-opacity', 0.8),
      (update) => {
        update.interrupt();
        return update.attr('stroke', color).attr('stroke-width', strokeWidth);
      },
      (exit) => exit.remove(),
    );

  return selection;
};
