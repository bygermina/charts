import * as d3 from 'd3';

import { getChartColors } from './types';
import { resolveCSSVariable } from './utils/canvas-helpers';
import { CHART_FONT_SIZE, CHART_FONT_FAMILY, DEFAULT_MARGIN } from './constants';

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
  svgElement?: SVGSVGElement,
) => {
  const gridColor = svgElement
    ? resolveCSSVariable(chartColors.grid, svgElement)
    : chartColors.grid;

  const gridGroup = g
    .append('g')
    .attr('class', 'grid')
    .call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickSize(-chartWidth)
        .tickFormat(() => ''),
    );

  gridGroup
    .selectAll('path')
    .attr('stroke', 'none')
    .attr('stroke-width', 0)
    .attr('stroke-opacity', 0);

  gridGroup
    .selectAll('line')
    .attr('stroke', gridColor)
    .attr('stroke-opacity', 0.7)
    .attr('stroke-width', 0.5)
    .attr('stroke-dasharray', '2,2');
};

const createVerticalGrid = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  chartHeight: number,
  chartColors: ChartColors,
  svgElement?: SVGSVGElement,
) => {
  const gridColor = svgElement
    ? resolveCSSVariable(chartColors.grid, svgElement)
    : chartColors.grid;

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
          .attr('stroke', gridColor)
          .attr('stroke-opacity', 0.5)
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
      .selectAll('path')
      .attr('stroke', 'none')
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 0);
    verticalGridGroup
      .selectAll('line')
      .attr('stroke', gridColor)
      .attr('stroke-opacity', 0.5)
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
  svgElement?: SVGSVGElement,
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

  createHorizontalGrid(gridGroup, yScale, chartWidth, chartColors, svgElement);
  createVerticalGrid(gridGroup, xScale, chartHeight, chartColors, svgElement);

  return gridGroup;
};

const getTimeFormatter = (min: number, max: number): ((date: Date) => string) => {
  const timeRange = max - min;
  const oneDay = 24 * 60 * 60 * 1000;

  return timeRange > oneDay ? d3.timeFormat('%d.%m %H:%M') : d3.timeFormat('%H:%M:%S');
};

const createXAxis = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  chartHeight: number,
  chartWidth: number,
  chartColors: ChartColors,
  margin: { right: number },
  ticks?: number,
) => {
  g.attr('transform', `translate(0,${chartHeight})`);

  if ('bandwidth' in xScale) {
    const axis = d3.axisBottom(xScale as d3.ScaleBand<string>);
    g.call(axis);
  } else {
    const domain = xScale.domain();
    const firstValue = domain[0];
    const isTimeScale = firstValue instanceof Date;
    const linearScale = xScale as d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
    const [min, max] = domain as [number | Date, number | Date];

    const axis = d3.axisBottom(linearScale as d3.AxisScale<d3.NumberValue>);

    if (isTimeScale) {
      const timeFormat = getTimeFormatter((min as Date).getTime(), (max as Date).getTime());
      axis.tickFormat((d) => {
        const date = d instanceof Date ? d : new Date(d as number);
        return timeFormat(date);
      });
    } else {
      const minNum = min as number;
      const maxNum = max as number;
      const isTimestamp =
        typeof minNum === 'number' && typeof maxNum === 'number' && minNum > 1000000000;

      if (isTimestamp) {
        const timeFormat = getTimeFormatter(minNum, maxNum);
        axis.tickFormat((d) => {
          const value = typeof d === 'number' ? d : Number(d);
          return timeFormat(new Date(value));
        });
      }
    }

    if (ticks !== undefined) {
      axis.ticks(ticks);
    }
    axis.tickSizeOuter(0);
    g.call(axis);
  }

  g.attr('color', chartColors.text)
    .attr('font-size', CHART_FONT_SIZE)
    .attr('font-family', CHART_FONT_FAMILY);

  const axisColor = chartColors.grid;
  const clippedWidth = chartWidth - margin.right;
  g.selectAll('path')
    .attr('stroke', axisColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 1)
    .attr('d', `M0,0H${clippedWidth}`);

  g.selectAll('line')
    .attr('stroke', axisColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 1)
    .each(function () {
      const line = this as SVGLineElement;
      const x1 = parseFloat(line.getAttribute('x1') || '0');
      if (x1 > clippedWidth) {
        line.setAttribute('stroke-opacity', '0');
      }
    });

  g.selectAll('text')
    .attr('fill', chartColors.textSecondary)
    .attr('font-size', CHART_FONT_SIZE)
    .attr('font-family', CHART_FONT_FAMILY)
    .attr('opacity', 1)
    .style('pointer-events', 'none')
    .each(function () {
      const text = this as SVGTextElement;
      const x = parseFloat(text.getAttribute('x') || '0');
      const textWidth = text.getBBox().width;
      if (x + textWidth / 2 > clippedWidth) {
        text.setAttribute('opacity', '0');
      }
    });
};

const createYAxis = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  yScale: YScale,
  chartHeight: number,
  chartColors: ChartColors,
  ticks?: number,
) => {
  const axis = d3.axisLeft(yScale);
  if (ticks !== undefined) {
    axis.ticks(ticks);
  }
  axis.tickSizeOuter(0);
  g.call(axis);
  const axisGroup = g;

  axisGroup
    .attr('color', chartColors.text)
    .attr('font-size', CHART_FONT_SIZE)
    .attr('font-family', CHART_FONT_FAMILY)
    .attr('opacity', 1);

  const axisColor = chartColors.grid;
  axisGroup
    .selectAll('path')
    .attr('stroke', axisColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 1)
    .attr('d', `M0,${chartHeight}V0`);

  axisGroup
    .selectAll('line')
    .attr('stroke', axisColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 1);

  axisGroup
    .selectAll('text')
    .attr('fill', chartColors.textSecondary)
    .attr('font-size', CHART_FONT_SIZE)
    .attr('font-family', CHART_FONT_FAMILY)
    .attr('opacity', 1)
    .style('pointer-events', 'none');
};

export const createAxes = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: XScale,
  yScale: YScale,
  chartHeight: number,
  chartWidth: number,
  chartColors: ChartColors,
  margin: { right: number },
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

  createXAxis(xAxisGroup, xScale, chartHeight, chartWidth, chartColors, margin, xTicks);
  createYAxis(yAxisGroup, yScale, chartHeight, chartColors, yTicks);

  return { xAxisGroup, yAxisGroup };
};

export interface LegendItem {
  label: string;
  color: string;
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
    .attr('class', 'chart-legend')
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
      .attr('font-size', CHART_FONT_SIZE)
      .attr('font-family', CHART_FONT_FAMILY)
      .text(item.label);
  });
};
