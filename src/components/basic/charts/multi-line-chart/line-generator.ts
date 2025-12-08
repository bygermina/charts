import * as d3 from 'd3';

import { type DataPoint } from '../types';
import {
  type CreateLineGeneratorConfig,
  type UpdateLinePathConfig,
  type UpdateLineWithShiftConfig,
  type UpdateLineConfig,
} from './types';
import { applyShiftAnimation } from '../chart-animation';

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

export const updateLineGenerator = (
  line: d3.Line<DataPoint>,
  { xScale, yScale }: CreateLineGeneratorConfig,
): void => {
  line.x((d) => xScale(d.time)).y((d) => yScale(d.value));
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

    setTimeout(() => {
      const node = path.node();
      if (node && node.ownerDocument) {
        path
          .transition()
          .duration(1000)
          .ease(d3.easeCubicOut)
          .attr('opacity', 1)
          .attrTween('d', function () {
            return d3.interpolateString(emptyPathD, finalPathD);
          });
      }
    }, 10);
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
