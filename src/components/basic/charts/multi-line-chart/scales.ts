import * as d3 from 'd3';

import { type CreateScalesConfig, type Scales } from './types';

const Y_SCALE_PADDING_MULTIPLIER = 1.1; // Adds 10% padding to top of Y axis

export const createScalesForAxes = ({
  timeExtent,
  maxValue,
  chartWidth,
  chartHeight,
  margin,
  yDomain,
}: CreateScalesConfig): Scales => {
  const xScale = d3.scaleTime().domain(timeExtent).range([0, chartWidth]);

  const xAxisScale = d3
    .scaleTime()
    .domain(timeExtent)
    .range([0, chartWidth - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain(yDomain ?? [0, maxValue * Y_SCALE_PADDING_MULTIPLIER])
    .nice()
    .range([chartHeight, 0]);

  return { xScale, xAxisScale, yScale };
};

export const updateScalesForAxes = (
  scales: Scales,
  {
    timeExtent,
    maxValue,
    chartWidth,
    chartHeight,
    margin,
    yDomain,
  }: CreateScalesConfig,
): void => {
  scales.xScale.domain(timeExtent).range([0, chartWidth]);
  scales.xAxisScale.domain(timeExtent).range([0, chartWidth - margin.right]);
  scales.yScale
    .domain(yDomain ?? [0, maxValue * Y_SCALE_PADDING_MULTIPLIER])
    .nice()
    .range([chartHeight, 0]);
};