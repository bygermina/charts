import { extent } from 'd3-array';

import { extractTimesFromLines } from '../../../lib/utils/line-data-helpers';
import { type TimeExtentConfig, type TimeExtentResult } from '../types';
import { calculateTimeStep } from './data-calculations';

export const calculateTimeExtent = ({ lines }: TimeExtentConfig): TimeExtentResult => {
  const allTimes = extractTimesFromLines(lines);

  const rawTimeExtent = extent(allTimes);

  if (!rawTimeExtent[0] || !rawTimeExtent[1] || rawTimeExtent[0] === rawTimeExtent[1]) {
    throw new Error('Invalid time extent');
  }

  const timeStep = calculateTimeStep(lines[0]?.data || []);
  const adjustedStartTime = rawTimeExtent[0] + timeStep;
  const timeExtent: [number, number] = [adjustedStartTime, rawTimeExtent[1]];

  return { timeExtent, timeStep };
};
