import type { Selection } from 'd3-selection';

import { getClippedWidth } from '../../../lib/chart-dimensions';
import { createGrid, createLineLegend } from '../../../lib/chart-utils';
import { applyShiftAnimation, getCurrentTranslate } from '../../../lib/chart-animation';

import {
  type ManageLegendConfig,
  type ManageGridConfig,
  type AnimateGridAndAxisConfig,
} from '../types';

export const manageLegend = ({
  mainGroup,
  lines,
  chartWidth,
  showLegend,
  chartColors,
}: ManageLegendConfig): void => {
  mainGroup.selectAll('g.chart-legend').remove();

  if (showLegend) {
    const legendItems = lines.map((lineSeries) => ({
      label: lineSeries.label,
      color: lineSeries.color,
      type: 'line' as const,
    }));

    createLineLegend(mainGroup, legendItems, chartWidth, chartColors);
  }
};

export const manageGrid = ({
  mainGroup,
  xScale,
  yScale,
  chartWidth,
  chartHeight,
  margin,
  gridLeftShift,
  chartColors,
  svgElement,
}: ManageGridConfig): Selection<SVGGElement, unknown, null, undefined> | null => {
  const existingGridGroup = mainGroup.select<SVGGElement>('g.grid-group');
  const savedTransform = existingGridGroup.empty() ? '' : existingGridGroup.attr('transform') || '';

  const gridGroup = createGrid(
    mainGroup,
    xScale,
    yScale,
    getClippedWidth(chartWidth, margin.right),
    chartHeight,
    chartColors,
    svgElement,
  );

  const transform = savedTransform || `translate(${-gridLeftShift}, 0)`;
  gridGroup.attr('transform', transform);

  return gridGroup;
};

export const animateGridAndAxis = ({
  gridGroup,
  xAxisGroup,
  shiftOffset,
  speed,
  gridLeftShift,
  chartHeight,
}: AnimateGridAndAxisConfig): void => {
  if (gridGroup) {
    const { y: gridY } = getCurrentTranslate(gridGroup);
    applyShiftAnimation({
      element: gridGroup,
      shiftOffset,
      speed,
      targetX: -gridLeftShift,
      targetY: gridY,
    });
  }

  const { y: xAxisY } = getCurrentTranslate(xAxisGroup);
  applyShiftAnimation({
    element: xAxisGroup,
    shiftOffset,
    speed,
    targetX: 0,
    targetY: xAxisY || chartHeight,
  });
};
