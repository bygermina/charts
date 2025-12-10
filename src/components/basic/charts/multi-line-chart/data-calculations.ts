import { type DataPoint } from '../types';
import { type LineSeries } from './types';
import { calculateTimeExtent } from './time-extent';
import { calculateMaxValue } from './values';
import { calculateShiftAnimation } from '../chart-animation';

const calculateTimeStep = (data: DataPoint[]): number => {
  if (data.length < 2) return 0;

  const timeIntervals: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const interval = data[i].time - data[i - 1].time;
    if (interval > 0) {
      timeIntervals.push(interval);
    }
  }

  if (timeIntervals.length === 0) return 0;
  return timeIntervals.reduce((sum, t) => sum + t, 0) / timeIntervals.length;
};

export { calculateTimeStep };

export interface PrepareChartDataConfig {
  lines: LineSeries[];
  prevMetadata: {
    timeExtent: [number, number] | null;
    timeStep: number;
  };
  isInitialRender: boolean;
  chartWidth: number;
}

export interface ChartData {
  timeExtent: [number, number];
  timeStep: number;
  maxValue: number;
  shouldAnimateShift: boolean;
  shiftOffset: number;
}

export const prepareChartData = ({
  lines,
  prevMetadata,
  isInitialRender,
  chartWidth,
}: PrepareChartDataConfig): ChartData => {
  const { timeExtent, timeStep } = calculateTimeExtent({ lines });
  const maxValue = calculateMaxValue({ lines });

  let shouldAnimateShift = false;
  let shiftOffset = 0;

  if (!isInitialRender && prevMetadata.timeExtent !== null) {
    const animationResult = calculateShiftAnimation({
      prevTimeExtent: prevMetadata.timeExtent,
      currentTimeExtent: timeExtent,
      chartWidth,
    });
    shouldAnimateShift = animationResult.shouldAnimate;
    shiftOffset = animationResult.shiftOffset;
  }

  return {
    timeExtent,
    timeStep,
    maxValue,
    shouldAnimateShift,
    shiftOffset,
  };
};
