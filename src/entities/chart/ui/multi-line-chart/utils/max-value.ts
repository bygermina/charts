import { max } from 'd3-array';

import { extractValuesFromLines } from '../../../lib/utils/line-data-helpers';
import { type CalculateMaxValueConfig } from '../types';

export const calculateMaxValue = ({ lines }: CalculateMaxValueConfig): number => {
  const allValues = extractValuesFromLines(lines);

  return max(allValues) ?? 0;
};
