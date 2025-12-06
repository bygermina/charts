import { type ShiftAnimationCheckConfig } from './types';
import { calculateShiftAnimation, type ShiftAnimationResult } from '../chart-animation';

export const checkShiftAnimation = ({
  prevTimeExtent,
  currentTimeExtent,
  chartWidth,
}: ShiftAnimationCheckConfig): ShiftAnimationResult => {
  return calculateShiftAnimation({
    prevTimeExtent,
    currentTimeExtent,
    chartWidth,
  });
};
