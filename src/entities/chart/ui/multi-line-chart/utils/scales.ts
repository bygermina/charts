import { scaleLinear, type ScaleLinear } from 'd3-scale';

import { getClippedWidth } from '../../../lib/chart-dimensions';
import { Y_SCALE_PADDING_MULTIPLIER } from '../../../model/constants';
import { type CreateScalesConfig, type Scales } from '../types';

export const createOrUpdateXScale = (
  timeExtent: [number, number],
  chartWidth: number,
  existingScale?: ScaleLinear<number, number>,
): ScaleLinear<number, number> => {
  const scale = existingScale ?? scaleLinear();

  return scale.domain(timeExtent).range([0, chartWidth]);
};

export const createOrUpdateScalesForAxes = (
  existingScales: Scales | null,
  {
    timeExtent,
    maxValue,
    chartWidth,
    chartHeight,
    margin,
    yDomain,
    xScale: providedXScale,
  }: CreateScalesConfig & { xScale?: ScaleLinear<number, number> },
): Scales => {
  const xScale = createOrUpdateXScale(
    timeExtent,
    chartWidth,
    providedXScale ?? existingScales?.xScale,
  );

  const xAxisScale = existingScales?.xAxisScale ?? scaleLinear();
  xAxisScale.domain(timeExtent).range([0, getClippedWidth(chartWidth, margin.right)]);

  const yScale = existingScales?.yScale ?? scaleLinear();
  const yDomainValue = yDomain ?? [0, maxValue * Y_SCALE_PADDING_MULTIPLIER];
  yScale.domain(yDomainValue);
  if (!yDomain) yScale.nice();
  yScale.range([chartHeight, 0]);

  if (!existingScales) return { xScale, xAxisScale, yScale };

  existingScales.xScale = providedXScale ?? xScale;

  return existingScales;
};
