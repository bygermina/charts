import * as d3 from 'd3';

import { type GetOrCreateLineGroupConfig, type GetOrCreateLinePathConfig } from './types';
import { createChartGroups as createChartGroupsUtil } from '../shared/chart-utils';

export const createChartGroups = (config: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  margin: { left: number; top: number };
}) => createChartGroupsUtil({ ...config, useClipPath: true });

export const getOrCreateLineGroup = ({
  mainGroup,
  lineIndex,
}: GetOrCreateLineGroupConfig): d3.Selection<SVGGElement, unknown, null, undefined> => {
  let lineGroup = mainGroup.select<SVGGElement>(`g.line-group-${lineIndex}`);
  if (lineGroup.empty()) {
    lineGroup = mainGroup.append('g').attr('class', `line-group-${lineIndex}`);
  }
  return lineGroup;
};

export const getOrCreateLinePath = ({
  lineGroup,
  color,
  strokeWidth,
  isInitialRender,
}: GetOrCreateLinePathConfig): d3.Selection<SVGPathElement, unknown, null, undefined> => {
  let path = lineGroup.select<SVGPathElement>('path.line-path');
  if (path.empty()) {
    path = lineGroup
      .append('path')
      .attr('class', 'line-path')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-opacity', 0.8);

    if (!isInitialRender) {
      path.attr('opacity', 1);
    }
  } else {
    if (!isInitialRender) {
      path.interrupt();
    }
    path.attr('stroke', color).attr('stroke-width', strokeWidth);
  }

  return path;
};
