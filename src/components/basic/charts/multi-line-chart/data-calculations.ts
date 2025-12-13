import { type LineSeries } from './types';
import { calculateTimeExtent } from './time-extent';
import { calculateMaxValue } from './values';
import type { DataPoint } from '../shared/types';
import { calculateShiftAnimation } from '../shared/chart-animation';

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

interface PrepareChartDataConfig {
  lines: LineSeries[];
  prevMetadata: {
    timeExtent: [number, number] | null;
    timeStep: number;
  };
  isInitialRender: boolean;
  chartWidth: number;
}

interface ChartData {
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

  const { shouldAnimate, shiftOffset } =
    !isInitialRender && prevMetadata.timeExtent !== null
      ? calculateShiftAnimation({
          prevTimeExtent: prevMetadata.timeExtent,
          currentTimeExtent: timeExtent,
          chartWidth,
        })
      : { shouldAnimate: false, shiftOffset: 0 };

  return {
    timeExtent,
    timeStep,
    maxValue,
    shouldAnimateShift: shouldAnimate,
    shiftOffset,
  };
};
