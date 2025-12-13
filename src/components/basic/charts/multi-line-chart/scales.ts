import { scaleLinear } from 'd3-scale';

import { type CreateScalesConfig, type Scales } from './types';
import { Y_SCALE_PADDING_MULTIPLIER } from '../shared/constants';

export const createScalesForAxes = ({
  timeExtent,
  maxValue,
  chartWidth,
  chartHeight,
  margin,
  yDomain,
}: CreateScalesConfig): Scales => {
  const [t0, t1] = timeExtent; // числа: [timestamp0, timestamp1]

  const xScale = scaleLinear<number, number>().domain([t0, t1]).range([0, chartWidth]);

  const xAxisScale = scaleLinear<number, number>()
    .domain([t0, t1])
    .range([0, chartWidth - margin.right]);

  const yDomainBase = yDomain ?? [0, maxValue * Y_SCALE_PADDING_MULTIPLIER];

  const yScale = scaleLinear<number, number>().domain(yDomainBase).nice().range([chartHeight, 0]);

  return { xScale, xAxisScale, yScale };
};

export const updateScalesForAxes = (
  scales: Scales,
  { timeExtent, maxValue, chartWidth, chartHeight, margin, yDomain }: CreateScalesConfig,
): void => {
  const [t0, t1] = timeExtent;

  scales.xScale.domain([t0, t1]).range([0, chartWidth]);
  scales.xAxisScale.domain([t0, t1]).range([0, chartWidth - margin.right]);

  if (yDomain) {
    scales.yScale.domain(yDomain).range([chartHeight, 0]);
  } else {
    scales.yScale
      .domain([0, maxValue * Y_SCALE_PADDING_MULTIPLIER])
      .nice()
      .range([chartHeight, 0]);
  }
};
