import { line, curveCatmullRom, type Line } from 'd3-shape';

import { applyShiftAnimation } from '../../../lib/chart-animation';
import type { DataPoint } from '../../../model/types';

import {
  type CreateLineGeneratorConfig,
  type UpdateLinePathConfig,
  type UpdateLineWithShiftConfig,
  type UpdateLineConfig,
} from '../types';

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

const updateLinePath = ({ path, line, data, isInitialRender }: UpdateLinePathConfig): void => {
  path.datum(data);

  if (isInitialRender && !document.hidden) {
    const finalPathD = line(data) || '';
    const emptyPathD = '';

    path.attr('d', emptyPathD).attr('opacity', 0);

    requestAnimationFrame(() => {
      if (document.hidden) {
        path.attr('opacity', 1).attr('d', finalPathD);
        return;
      }

      const node = path.node();
      if (node && node.ownerDocument) {
        path.attr('opacity', 1).attr('d', finalPathD);
      }
    });
  } else {
    path.attr('opacity', 1).attr('d', line(data));
  }
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
  isInitialRender,
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
      isInitialRender,
    });
  }
};
