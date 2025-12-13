import { extent, max } from 'd3-array';
import { scaleTime, scaleLinear } from 'd3-scale';

import { type CreateScalesConfig, type Scales } from './types';
import { Y_SCALE_PADDING_MULTIPLIER } from '../../shared/constants';

export const createScales = ({
  data,
  chartWidth,
  chartHeight,
  margin,
}: CreateScalesConfig): Scales => {
  const timeExtent = extent(data, (d) => new Date(d.time)) as [Date, Date];
  const xScale = scaleTime<number, number>().domain(timeExtent).range([0, chartWidth]);

  const xAxisScale = scaleTime<number, number>()
    .domain(timeExtent)
    .range([0, chartWidth - margin.right]);

  const yScale = scaleLinear<number, number>()
    .domain([0, max(data, (d) => d.value)! * Y_SCALE_PADDING_MULTIPLIER])
    .nice()
    .range([chartHeight, 0]);

  return { xScale, xAxisScale, yScale };
};
