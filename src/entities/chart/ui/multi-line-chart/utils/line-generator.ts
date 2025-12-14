import { line, curveCatmullRom, type Line } from 'd3-shape';
import type { Selection } from 'd3-selection';

import { applyShiftAnimation } from '../../../lib/chart-animation';
import type { DataPoint, LinearScale } from '../../../model/types';

interface CreateLineGeneratorConfig {
  xScale: LinearScale;
  yScale: LinearScale;
}

interface UpdateLinePathConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  data: DataPoint[];
}

interface UpdateLineWithShiftConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  data: DataPoint[];
  shiftOffset: number;
  speed: number;
}

interface UpdateLineConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  data: DataPoint[];
  shouldShift: boolean;
  shiftOffset: number;
  speed?: number;
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

const updateLinePath = ({ path, line, data }: UpdateLinePathConfig): void => {
  path.datum(data);
  path.attr('opacity', 1).attr('d', line(data));
};

const updateLineWithShift = ({
  path,
  line,
  lineGroup,
  data,
  shiftOffset,
  speed,
}: UpdateLineWithShiftConfig): void => {
  const newPathD = line(data) || '';
  path.datum(data).attr('d', newPathD);

  applyShiftAnimation({
    element: lineGroup,
    shiftOffset,
    speed,
  });
};

export const updateLine = ({
  path,
  line,
  lineGroup,
  data,
  shouldShift,
  shiftOffset,
  speed,
}: UpdateLineConfig): void => {
  if (shouldShift && speed !== undefined) {
    updateLineWithShift({
      path,
      line,
      lineGroup,
      data,
      shiftOffset,
      speed,
    });
  } else {
    updateLinePath({
      path,
      line,
      data,
    });
  }
};
