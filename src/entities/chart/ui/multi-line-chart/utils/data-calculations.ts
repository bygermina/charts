import { type ScaleLinear } from 'd3-scale';

import { calculateShiftAnimation } from '../../../lib/chart-animation';
import type { DataPoint } from '../../../model/types';

import { calculateMaxValue } from './max-value';
import { calculateTimeExtent } from './time-extent';
import { createOrUpdateXScale } from './scales';
import { type LineSeries } from '../types';

export const calculateTimeStep = (data: DataPoint[]): number => {
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

interface PrepareChartDataConfig {
  lines: LineSeries[];
  prevMetadata: {
    timeExtent: [number, number] | null;
    timeStep: number;
  };
  chartWidth: number;
}

interface ChartData {
  timeExtent: [number, number];
  timeStep: number;
  maxValue: number;
  shouldAnimateShift: boolean;
  shiftOffset: number;
  currentXScale: ScaleLinear<number, number>;
}

export const prepareChartData = ({
  lines,
  prevMetadata,
  chartWidth,
}: PrepareChartDataConfig): ChartData => {
  const { timeExtent, timeStep } = calculateTimeExtent({ lines });
  const maxValue = calculateMaxValue({ lines });

  const currentXScale = createOrUpdateXScale(timeExtent, chartWidth);

  const { shouldAnimate, shiftOffset } =
    prevMetadata.timeExtent !== null
      ? calculateShiftAnimation({
          prevTimeExtent: prevMetadata.timeExtent,
          currentTimeExtent: timeExtent,
          currentXScale,
          chartWidth,
        })
      : { shouldAnimate: false, shiftOffset: 0 };

  return {
    timeExtent,
    timeStep,
    maxValue,
    shouldAnimateShift: shouldAnimate,
    shiftOffset,
    currentXScale,
  };
};
