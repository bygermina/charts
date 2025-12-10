import * as d3 from 'd3';

import { type TimeExtentConfig, type TimeExtentResult } from './types';
import { calculateTimeStep } from './data-calculations';

export const calculateTimeExtent = ({ lines }: TimeExtentConfig): TimeExtentResult => {
  const allTimes: number[] = [];

  for (const line of lines) {
    if (!line?.data) continue;
    for (const point of line.data) {
      allTimes.push(point.time);
    }
  }

  const rawTimeExtent = d3.extent(allTimes);

  if (!rawTimeExtent[0] || !rawTimeExtent[1] || rawTimeExtent[0] === rawTimeExtent[1]) {
    throw new Error('Invalid time extent');
  }

  const timeStep = calculateTimeStep(lines[0]?.data || []);
  const adjustedStartTime = rawTimeExtent[0] + timeStep;
  const timeExtent: [number, number] = [adjustedStartTime, rawTimeExtent[1]];

  return { timeExtent, timeStep };
};
