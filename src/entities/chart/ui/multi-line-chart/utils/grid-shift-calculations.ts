import { type CalculateGridLeftShiftConfig } from '../types';

export const calculateGridLeftShift = ({
  timeStep,
  timeExtent: [minTime, maxTime],
  chartWidth,
}: CalculateGridLeftShiftConfig): number => {
  if (timeStep > 0 && maxTime > minTime) {
    return (chartWidth * timeStep) / (maxTime - minTime);
  }

  return 0;
};
