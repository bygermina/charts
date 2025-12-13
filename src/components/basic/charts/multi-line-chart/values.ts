import { max } from 'd3-array';

import { type CalculateMaxValueConfig } from './types';

export const calculateMaxValue = ({ lines }: CalculateMaxValueConfig): number => {
  const allValues = lines.flatMap((line) => line.data.map((d) => d.value));
  return max(allValues) ?? 0;
};
