import { type CalculateGridLeftShiftConfig } from './types';

export const calculateGridLeftShift = ({
  timeStep,
  timeExtent,
  chartWidth,
}: CalculateGridLeftShiftConfig): number => {
  if (timeStep > 0 && timeExtent[1] > timeExtent[0]) {
    return (chartWidth * timeStep) / (timeExtent[1] - timeExtent[0]);
  }

  return 0;
};
