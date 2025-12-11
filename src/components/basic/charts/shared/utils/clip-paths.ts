import * as d3 from 'd3';

export interface CreateClipPathsConfig {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
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

  const clippedWidth = chartWidth - margin.right;

  let clipPath = defs.select<SVGClipPathElement>('#chart-clip');
  if (clipPath.empty()) {
    clipPath = defs.append('clipPath').attr('id', 'chart-clip');
  }

  let rect = clipPath.select<SVGRectElement>('rect');
  if (rect.empty()) {
    rect = clipPath.append('rect');
  }
  rect.attr('x', 0).attr('y', 0).attr('width', clippedWidth).attr('height', chartHeight);
};

