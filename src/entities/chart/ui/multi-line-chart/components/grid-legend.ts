import { getClippedWidth } from '../../../lib/chart-dimensions';
import { createGrid, createLineLegend } from '../../../lib/chart-utils';
import type { SVGGroupSelection } from '../../../model/types';
import { type ManageLegendConfig, type ManageGridConfig } from '../types';

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
  shouldAnimate = false,
}: ManageGridConfig & { shouldAnimate?: boolean }): SVGGroupSelection | null => {
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

  if (!shouldAnimate) {
    const transform = savedTransform || `translate(${-gridLeftShift}, 0)`;
    gridGroup.attr('transform', transform);
  }

  return gridGroup;
};
