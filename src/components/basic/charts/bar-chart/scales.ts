import * as d3 from 'd3';

import { type CreateScalesConfig, type Scales } from './types';
import { Y_SCALE_PADDING_MULTIPLIER } from '../constants';

export const createScales = ({
  data,
  chartWidth,
  chartHeight,
  margin,
}: CreateScalesConfig): Scales => {
  const timeExtent = d3.extent(data, (d) => new Date(d.time)) as [Date, Date];
  const xScale = d3.scaleTime().domain(timeExtent).range([0, chartWidth]);

  const xAxisScale = d3
    .scaleTime()
    .domain(timeExtent)
    .range([0, chartWidth - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)! * Y_SCALE_PADDING_MULTIPLIER])
    .nice()
    .range([chartHeight, 0]);

  return { xScale, xAxisScale, yScale };
};
