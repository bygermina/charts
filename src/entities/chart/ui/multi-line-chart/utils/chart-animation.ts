import {
  animateChartElements,
  calculateAnimationSpeed,
  getCurrentTranslate,
} from '../../../lib/chart-animation';
import type { LinearScale, SVGGroupSelection } from '../../../model/types';
import type { LineSeries } from '../types';

interface AnimateChartShiftConfig {
  lineGroups: SVGGroupSelection[];
  gridGroup: SVGGroupSelection | null;
  xAxisGroup: SVGGroupSelection | null;
  shiftOffset: number;
  speed: number;
  gridLeftShift: number;
  chartHeight: number;
}

export const animateChartShift = ({
  lineGroups,
  gridGroup,
  xAxisGroup,
  shiftOffset,
  speed,
  gridLeftShift,
  chartHeight,
}: AnimateChartShiftConfig): void => {
  const elements: Array<{
    element: SVGGroupSelection;
    targetX: number;
    targetY: number;
  }> = [];

  lineGroups.forEach((lineGroup) => {
    const { y: currentY } = getCurrentTranslate(lineGroup);
    elements.push({
      element: lineGroup,
      targetX: -gridLeftShift,
      targetY: currentY,
    });
  });

  if (gridGroup) {
    const { y: gridY } = getCurrentTranslate(gridGroup);
    elements.push({
      element: gridGroup,
      targetX: -gridLeftShift,
      targetY: gridY,
    });
  }

  if (xAxisGroup) {
    const { y: xAxisY } = getCurrentTranslate(xAxisGroup);
    elements.push({
      element: xAxisGroup,
      targetX: -gridLeftShift,
      targetY: xAxisY || chartHeight,
    });
  }

  if (elements.length > 0) {
    animateChartElements({
      elements,
      shiftOffset,
      speed,
    });
  }
};

interface CalculateChartAnimationConfig {
  lines: LineSeries[];
  xScale: LinearScale;
  chartWidth: number;
  customSpeed?: number;
}

export const calculateChartAnimationSpeed = ({
  lines,
  xScale,
  chartWidth,
  customSpeed,
}: CalculateChartAnimationConfig): number | undefined => {
  if (lines.length === 0 || lines[0].data.length === 0) return undefined;

  return calculateAnimationSpeed({
    data: lines[0].data,
    xScale,
    customSpeed,
    fallbackSpeed: chartWidth / 10,
  });
};
