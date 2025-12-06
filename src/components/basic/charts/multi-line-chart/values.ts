import * as d3 from 'd3';

import { type CalculateMaxValueConfig } from './types';

export const calculateMaxValue = ({ lines }: CalculateMaxValueConfig): number => {
  const allValues = lines.flatMap((line) => line.data.map((d) => d.value));

  return d3.max(allValues)!;
};
