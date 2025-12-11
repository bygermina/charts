import * as d3 from 'd3';

import {
  type CreateLineGeneratorConfig,
  type UpdateLinePathConfig,
  type UpdateLineWithShiftConfig,
  type UpdateLineConfig,
} from './types';
import type { DataPoint } from '../shared/types';
import { applyShiftAnimation } from '../shared/chart-animation';

export const createLineGenerator = ({
  xScale,
  yScale,
}: CreateLineGeneratorConfig): d3.Line<DataPoint> => {
  return d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value))
    .curve(d3.curveCatmullRom.alpha(0.8))
    .defined((d) => d != null && !isNaN(d.time) && !isNaN(d.value));
};

export const updateLinePath = ({
  path,
  line,
  data,
  isInitialRender,
}: UpdateLinePathConfig): void => {
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
        path.attr('opacity', 1);
      }
    });
  } else {
    path.attr('opacity', 1).attr('d', line(data));
  }
};

export const updateLineWithShift = ({
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
