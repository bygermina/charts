import { extent } from 'd3-array';

import { extractTimesFromLines } from '../../../lib/utils/line-data-helpers';
import { type TimeExtentConfig, type TimeExtentResult } from '../types';
import { calculateTimeStep } from './data-calculations';

export const calculateTimeExtent = ({ lines }: TimeExtentConfig): TimeExtentResult => {
  const allTimes = extractTimesFromLines(lines);

  const [minTime, maxTime] = extent(allTimes);

  if (!minTime || !maxTime || minTime === maxTime) {
    throw new Error('Invalid time extent');
  }

  const timeStep = calculateTimeStep(lines[0]?.data || []);

  const timeExtent: [number, number] = [minTime, maxTime];

  return { timeExtent, timeStep };
};
