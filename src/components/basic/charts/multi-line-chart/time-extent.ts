import * as d3 from 'd3';

import { type TimeExtentConfig, type TimeExtentResult } from './types';
import { calculateTimeStep } from './data-calculations';

interface TimeExtentCache {
  allTimes: number[];
  timeIntervals: number[];
}

export const calculateTimeExtent = (
  { lines }: TimeExtentConfig,
  cache?: TimeExtentCache,
): TimeExtentResult => {
  const allTimes = cache?.allTimes || [];
  allTimes.length = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line?.data) continue;
    for (let j = 0; j < line.data.length; j++) {
      allTimes.push(line.data[j].time);
    }
  }

  const rawTimeExtent = d3.extent(allTimes);

  if (!rawTimeExtent[0] || !rawTimeExtent[1] || rawTimeExtent[0] === rawTimeExtent[1]) {
    throw new Error('Invalid time extent');
  }

  const timeIntervalsCache = cache?.timeIntervals;
  const timeStep = calculateTimeStep(lines[0]?.data || [], timeIntervalsCache);

  const adjustedStartTime = rawTimeExtent[0] + timeStep;
  const timeExtent: [number, number] = [adjustedStartTime, rawTimeExtent[1]];

  return { timeExtent, timeStep };
};
