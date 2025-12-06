import * as d3 from 'd3';

import { type CreateClipPathsConfig } from './types';

const updateClipPathRect = (
  clipPath: d3.Selection<SVGClipPathElement, unknown, null, undefined>,
  width: number,
  height: number,
): void => {
  let rect = clipPath.select<SVGRectElement>('rect');
  if (rect.empty()) {
    rect = clipPath.append('rect');
  }
  rect.attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
};

export const createClipPaths = ({
  svg,
  chartWidth,
  chartHeight,
  margin,
}: CreateClipPathsConfig): void => {
  let defs = svg.select<SVGDefsElement>('defs');
  if (defs.empty()) {
    defs = svg.append('defs');
  }

  const clippedWidth = chartWidth - margin.right;

  let clipPath = defs.select<SVGClipPathElement>('#chart-clip');
  if (clipPath.empty()) {
    clipPath = defs.append('clipPath').attr('id', 'chart-clip');
  }
  updateClipPathRect(clipPath, clippedWidth, chartHeight);
};
