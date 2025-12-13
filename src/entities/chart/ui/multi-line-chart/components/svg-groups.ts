import type { Selection } from 'd3-selection';

import { createChartGroups as createChartGroupsUtil } from '../../../lib/chart-utils';
import { type GetOrCreateLineGroupConfig, type GetOrCreateLinePathConfig } from '../types';

export const createChartGroups = (config: {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  margin: { left: number; top: number };
}) => createChartGroupsUtil({ ...config, useClipPath: true });

export const getOrCreateLineGroup = ({
  mainGroup,
  lineIndex,
}: GetOrCreateLineGroupConfig): Selection<SVGGElement, unknown, null, undefined> => {
  mainGroup
    .selectAll<SVGGElement, number>(`g.line-group-${lineIndex}`)
    .data([lineIndex], (d) => d)
    .join(
      (enter) => enter.append('g').attr('class', `line-group-${lineIndex}`),
      (update) => update,
      (exit) => exit.remove(),
    );

  return mainGroup.select<SVGGElement>(`g.line-group-${lineIndex}`) as Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;
};

export const getOrCreateLinePath = ({
  lineGroup,
  color,
  strokeWidth,
  isInitialRender,
}: GetOrCreateLinePathConfig): Selection<SVGPathElement, unknown, null, undefined> => {
  lineGroup
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
        if (!isInitialRender) {
          update.interrupt();
        }
        return update.attr('stroke', color).attr('stroke-width', strokeWidth);
      },
      (exit) => exit.remove(),
    );

  return lineGroup.select<SVGPathElement>('path.line-path') as Selection<
    SVGPathElement,
    unknown,
    null,
    undefined
  >;
};
