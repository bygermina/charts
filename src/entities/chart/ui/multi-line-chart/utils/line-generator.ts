import { line, curveCatmullRom, type Line } from 'd3-shape';
import type { Selection } from 'd3-selection';

import type { DataPoint, LinearScale } from '../../../model/types';

interface CreateLineGeneratorConfig {
  xScale: LinearScale;
  yScale: LinearScale;
}

interface UpdateLineConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  data: DataPoint[];
}

export const createLineGenerator = ({
  xScale,
  yScale,
}: CreateLineGeneratorConfig): Line<DataPoint> => {
  return line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value))
    .curve(curveCatmullRom.alpha(0.8))
    .defined((d) => d != null && !isNaN(d.time) && !isNaN(d.value));
};

export const updateLine = ({ path, line, data }: UpdateLineConfig): void => {
  path.datum(data);
  path.attr('opacity', 1).attr('d', line(data));
};
