import * as d3 from 'd3';
import type React from 'react';

import { getChartColors } from './types';

export type ChartColors = ReturnType<typeof getChartColors>;

export interface CreateChartGroupsConfig {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  margin: { left: number; top: number };
  useClipPath?: boolean;
}

export interface ChartGroups {
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  axesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
}

export const createChartGroups = ({
  svg,
  margin,
  useClipPath = false,
}: CreateChartGroupsConfig): ChartGroups => {
  let mainGroup = svg.select<SVGGElement>('g.chart-main-group');
  if (mainGroup.empty()) {
    mainGroup = svg
      .append('g')
      .attr('class', 'chart-main-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (useClipPath) {
      mainGroup.attr('clip-path', 'url(#chart-clip)');
    }
  }

  let axesGroup = svg.select<SVGGElement>('g.axes-group');
  if (axesGroup.empty()) {
    axesGroup = svg
      .append('g')
      .attr('class', 'axes-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  return { mainGroup, axesGroup };
};

export type XScale =
  | d3.ScaleTime<number, number>
  | d3.ScaleBand<string>
  | d3.ScaleLinear<number, number>;
export type YScale = d3.ScaleLinear<number, number>;

export interface ChartBaseConfig {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

export const getChartDimensions = (config: ChartBaseConfig) => {
  const margin = config.margin || DEFAULT_MARGIN;
  const chartWidth = config.width - margin.left - margin.right;
  const chartHeight = config.height - margin.top - margin.bottom;

  return { margin, chartWidth, chartHeight };
};

const createHorizontalGrid = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  yScale: YScale,
  chartWidth: number,
  chartColors: ChartColors,
) => {
  g.append('g')
    .attr('class', 'grid')
    .call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickSize(-chartWidth)
        .tickFormat(() => ''),
    )
    .attr('stroke', chartColors.grid)
    .attr('stroke-opacity', 0.3)
    .attr('stroke-width', 0.5)
    .attr('stroke-dasharray', '2,2');
};

const createVerticalGrid = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  chartHeight: number,
  chartColors: ChartColors,
) => {
  const verticalGridGroup = g
    .append('g')
    .attr('class', 'vertical-grid')
    .attr('transform', `translate(0,${chartHeight})`);

  if ('bandwidth' in xScale) {
    const bandScale = xScale as d3.ScaleBand<string>;
    const domain = bandScale.domain();
    domain.forEach((d) => {
      const x = bandScale(d);
      if (x !== undefined) {
        verticalGridGroup
          .append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', -chartHeight)
          .attr('stroke', chartColors.grid)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '2,2');
      }
    });
  } else {
    verticalGridGroup.call(
      d3
        .axisBottom(xScale as d3.AxisScale<d3.NumberValue>)
        .ticks(5)
        .tickSize(-chartHeight)
        .tickFormat(() => ''),
    );
    verticalGridGroup
      .attr('stroke', chartColors.grid)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2');
  }
};

export const createGrid = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  yScale: YScale,
  chartWidth: number,
  chartHeight: number,
  chartColors: ChartColors,
): d3.Selection<SVGGElement, unknown, null, undefined> => {
  let gridGroup = g.select<SVGGElement>('g.grid-group');
  if (gridGroup.empty()) {
    gridGroup = g.append('g').attr('class', 'grid-group');
  } else {
    const savedTransform = gridGroup.attr('transform') || '';
    gridGroup.selectAll('*').remove();
    if (savedTransform) {
      gridGroup.attr('transform', savedTransform);
    }
  }

  createHorizontalGrid(gridGroup, yScale, chartWidth, chartColors);
  createVerticalGrid(gridGroup, xScale, chartHeight, chartColors);

  return gridGroup;
};

const createXAxis = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  chartHeight: number,
  chartColors: ChartColors,
  ticks?: number,
) => {
  g.attr('transform', `translate(0,${chartHeight})`);

  if ('bandwidth' in xScale) {
    const axis = d3.axisBottom(xScale as d3.ScaleBand<string>);
    g.call(axis);
  } else {
    const axis = d3.axisBottom(xScale as d3.AxisScale<Date | d3.NumberValue>);
    if (ticks !== undefined) {
      axis.ticks(ticks);
    }
    g.call(axis);
  }

  g.attr('color', chartColors.text).attr('font-size', '11px');

  g.selectAll('path')
    .attr('stroke', chartColors.textSecondary)
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.8);

  g.selectAll('line')
    .attr('stroke', chartColors.textSecondary)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.6);

  g.selectAll('text')
    .attr('fill', chartColors.textSecondary)
    .attr('font-size', '11px')
    .attr('opacity', 1)
    .style('pointer-events', 'none');
};

const createYAxis = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  yScale: YScale,
  chartColors: ChartColors,
  ticks?: number,
) => {
  const axis = d3.axisLeft(yScale);
  if (ticks !== undefined) {
    axis.ticks(ticks);
  }
  g.call(axis);
  const axisGroup = g;

  axisGroup.attr('color', chartColors.text).attr('font-size', '11px').attr('opacity', 0.7);

  axisGroup
    .selectAll('path')
    .attr('stroke', chartColors.textSecondary)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.5);

  axisGroup
    .selectAll('line')
    .attr('stroke', chartColors.textSecondary)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.4);

  axisGroup
    .selectAll('text')
    .attr('fill', chartColors.textSecondary)
    .attr('font-size', '11px')
    .attr('opacity', 1)
    .style('pointer-events', 'none');
};

export const createAxes = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  yScale: YScale,
  chartHeight: number,
  chartColors: ChartColors,
  xTicks?: number,
  yTicks?: number,
): {
  xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
} => {
  let xAxisGroup = g.select<SVGGElement>('g.x-axis-group');
  let yAxisGroup = g.select<SVGGElement>('g.y-axis-group');

  if (xAxisGroup.empty()) {
    xAxisGroup = g.append('g').attr('class', 'x-axis-group');
  } else {
    xAxisGroup.selectAll('*').remove();
  }

  if (yAxisGroup.empty()) {
    yAxisGroup = g.append('g').attr('class', 'y-axis-group');
  } else {
    const savedTransform = yAxisGroup.attr('transform') || '';
    yAxisGroup.selectAll('*').remove();
    if (savedTransform) {
      yAxisGroup.attr('transform', savedTransform);
    }
  }

  createXAxis(xAxisGroup, xScale, chartHeight, chartColors, xTicks);
  createYAxis(yAxisGroup, yScale, chartColors, yTicks);

  return { xAxisGroup, yAxisGroup };
};

export const initChart = (
  svgRef: React.RefObject<SVGSVGElement | null>,
  margin: { top: number; right: number; bottom: number; left: number },
): d3.Selection<SVGGElement, unknown, null, undefined> | null => {
  if (!svgRef.current) return null;

  const svg = d3.select(svgRef.current);
  svg.selectAll('*').remove();

  return svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
};

export const createXAxisLabel = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  label: string,
  chartWidth: number,
  chartHeight: number,
  chartColors: ChartColors,
  offset = 35,
) => {
  g.append('text')
    .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + offset})`)
    .style('text-anchor', 'middle')
    .attr('fill', chartColors.textSecondary)
    .attr('font-size', '11px')
    .text(label);
};

export const createYAxisLabel = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  label: string,
  chartHeight: number,
  chartColors: ChartColors,
  offset = 40,
) => {
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -offset)
    .attr('x', -chartHeight / 2)
    .style('text-anchor', 'middle')
    .attr('fill', chartColors.textSecondary)
    .attr('font-size', '11px')
    .text(label);
};

export interface LegendItem {
  label: string;
  color: string;
  type?: 'line' | 'circle' | 'rect';
}

export const createLineLegend = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  items: LegendItem[],
  chartWidth: number,
  chartColors: ChartColors,
  position = { x: 120, y: 10 },
  itemHeight = 20,
) => {
  const legend = g
    .append('g')
    .attr('transform', `translate(${chartWidth - position.x}, ${position.y})`);

  items.forEach((item, i) => {
    const legendRow = legend.append('g').attr('transform', `translate(0, ${i * itemHeight})`);

    legendRow
      .append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', item.color)
      .attr('stroke-width', 2);

    legendRow
      .append('text')
      .attr('x', 20)
      .attr('y', 4)
      .attr('fill', chartColors.text)
      .attr('font-size', '11px')
      .text(item.label);
  });
};

export const createCircleLegend = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  items: LegendItem[],
  chartWidth: number,
  chartColors: ChartColors,
  position = { x: 100, y: 10 },
  itemHeight = 20,
  radius = 5,
) => {
  const legend = g
    .append('g')
    .attr('transform', `translate(${chartWidth - position.x}, ${position.y})`);

  items.forEach((item, i) => {
    const legendRow = legend.append('g').attr('transform', `translate(0, ${i * itemHeight})`);

    legendRow.append('circle').attr('r', radius).attr('fill', item.color).attr('opacity', 0.7);

    legendRow
      .append('text')
      .attr('x', radius * 2 + 2)
      .attr('y', 4)
      .attr('fill', chartColors.text)
      .attr('font-size', '11px')
      .text(item.label);
  });
};

export const createRectLegend = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  items: LegendItem[],
  width: number,
  chartColors: ChartColors,
  position = { x: 150, y: 20 },
  itemHeight = 25,
  rectSize = { width: 15, height: 15 },
) => {
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - position.x}, ${position.y})`);

  items.forEach((item, i) => {
    const legendRow = legend.append('g').attr('transform', `translate(0, ${i * itemHeight})`);

    legendRow
      .append('rect')
      .attr('width', rectSize.width)
      .attr('height', rectSize.height)
      .attr('fill', item.color)
      .attr('rx', 2);

    legendRow
      .append('text')
      .attr('x', rectSize.width + 5)
      .attr('y', rectSize.height - 3)
      .attr('fill', chartColors.text)
      .attr('font-size', '11px')
      .text(item.label);
  });
};
