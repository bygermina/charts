import type { Selection } from 'd3-selection';

import { getClippedWidth } from '../chart-dimensions';

interface CreateClipPathsConfig {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  chartWidth: number;
  chartHeight: number;
  margin: { left: number; right: number };
}

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

  const clippedWidth = getClippedWidth(chartWidth, margin.right);
  const clipHeight = chartHeight * 1.1;

  let clipPath = defs.select<SVGClipPathElement>('#chart-clip');
  if (clipPath.empty()) {
    clipPath = defs.append('clipPath').attr('id', 'chart-clip');
  }

  let rect = clipPath.select<SVGRectElement>('rect');
  if (rect.empty()) {
    rect = clipPath.append('rect');
  }
  rect.attr('x', 0).attr('y', 0).attr('width', clippedWidth).attr('height', clipHeight);

  let xAxisClipPath = defs.select<SVGClipPathElement>('#x-axis-clip');
  if (xAxisClipPath.empty()) {
    xAxisClipPath = defs.append('clipPath').attr('id', 'x-axis-clip');
  }

  let xAxisRect = xAxisClipPath.select<SVGRectElement>('rect');
  if (xAxisRect.empty()) {
    xAxisRect = xAxisClipPath.append('rect');
  }
  xAxisRect.attr('x', 0).attr('y', 0).attr('width', clippedWidth).attr('height', clipHeight);
};
