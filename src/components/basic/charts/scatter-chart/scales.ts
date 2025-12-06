import * as d3 from 'd3';

import { type CreateScalesConfig, type Scales } from './types';

export const createScales = ({
  data,
  chartWidth,
  chartHeight,
  xDomain,
  yDomain,
}: CreateScalesConfig): Scales => {
  const xExtent = xDomain || (d3.extent(data, (d) => d.x) as [number, number]);
  const yExtent = yDomain || (d3.extent(data, (d) => d.y) as [number, number]);

  const xScale = d3.scaleLinear().domain(xExtent).nice().range([0, chartWidth]);
  const yScale = d3.scaleLinear().domain(yExtent).nice().range([chartHeight, 0]);

  return { xScale, yScale };
};

