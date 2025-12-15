import type { ScaleTime, ScaleBand } from 'd3-scale';
import { select, type Selection } from 'd3-selection';
import { axisLeft, axisBottom } from 'd3-axis';
import { interrupt } from 'd3-transition';

import { CHART_FONT_SIZE, CHART_FONT_FAMILY } from '../model/constants';
import { type ChartColors, type SVGGroupSelection, type LinearScale } from '../model/types';
import { getClippedWidth } from './chart-dimensions';
import { resolveCSSVariable } from './utils/canvas-helpers';
import { getTimeFormatter, isTimestamp } from './utils/time-utils';

interface CreateChartGroupsConfig {
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  margin: { left: number; top: number };
  useClipPath?: boolean;
}

interface ChartGroups {
  mainGroup: SVGGroupSelection;
  axesGroup: SVGGroupSelection;
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

type XScale = ScaleTime<number, number> | ScaleBand<string> | LinearScale;
type YScale = LinearScale;

const getGridColor = (chartColors: ChartColors, svgElement?: SVGSVGElement): string => {
  return svgElement ? resolveCSSVariable(chartColors.grid, svgElement) : chartColors.grid;
};

const createHorizontalGrid = (
  g: SVGGroupSelection,
  yScale: YScale,
  chartWidth: number,
  chartColors: ChartColors,
  svgElement?: SVGSVGElement,
  ticks?: number,
) => {
  const gridColor = getGridColor(chartColors, svgElement);

  const axis = axisLeft(yScale)
    .tickSize(-chartWidth)
    .tickFormat(() => '');

  axis.ticks(ticks ?? 5);

  const gridGroup = g.append('g').attr('class', 'grid').call(axis);

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
  g: SVGGroupSelection,
  xScale: XScale,
  chartHeight: number,
  chartColors: ChartColors,
  svgElement?: SVGSVGElement,
  ticks?: number,
) => {
  const gridColor = getGridColor(chartColors, svgElement);

  const verticalGridGroup = g
    .append('g')
    .attr('class', 'vertical-grid')
    .attr('transform', `translate(0,${chartHeight})`);

  if ('bandwidth' in xScale) {
    const bandScale = xScale as ScaleBand<string>;
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
    const axis = axisBottom(xScale)
      .tickSize(-chartHeight)
      .tickFormat(() => '');

    axis.ticks(ticks ?? 5);

    verticalGridGroup.call(axis);
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
  g: SVGGroupSelection,
  xScale: XScale,
  yScale: YScale,
  chartWidth: number,
  chartHeight: number,
  chartColors: ChartColors,
  svgElement?: SVGSVGElement,
  xTicks?: number,
  yTicks?: number,
): SVGGroupSelection => {
  let gridGroup = g.select<SVGGElement>('g.grid-group');
  if (gridGroup.empty()) {
    gridGroup = g.append('g').attr('class', 'grid-group');
  } else {
    const savedTransform = gridGroup.attr('transform') || '';
    gridGroup.selectAll('*').each(function () {
      interrupt(this);
    });
    gridGroup.selectAll('*').remove();
    if (savedTransform) {
      gridGroup.attr('transform', savedTransform);
    }
  }

  createHorizontalGrid(gridGroup, yScale, chartWidth, chartColors, svgElement, yTicks);
  createVerticalGrid(gridGroup, xScale, chartHeight, chartColors, svgElement, xTicks);

  return gridGroup;
};

const createXAxis = (
  g: SVGGroupSelection,
  xScale: XScale,
  chartHeight: number,
  chartWidth: number,
  chartColors: ChartColors,
  margin: { right: number },
  ticks?: number,
) => {
  g.attr('transform', `translate(0,${chartHeight})`);

  if ('bandwidth' in xScale) {
    const axis = axisBottom(xScale);
    g.call(axis);
  } else {
    const [minTime, maxTime] = xScale.domain();
    const axis = axisBottom(xScale);

    if (
      isTimestamp(minTime, maxTime) &&
      typeof minTime === 'number' &&
      typeof maxTime === 'number'
    ) {
      const timeFormat = getTimeFormatter(minTime, maxTime);
      axis.tickFormat((d) => {
        const timestamp = d instanceof Date ? d.getTime() : typeof d === 'number' ? d : Number(d);
        return timeFormat(new Date(timestamp));
      });
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
  const clippedWidth = getClippedWidth(chartWidth, margin.right);
  g.selectAll('path')
    .attr('stroke', axisColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0)
    .attr('d', `M0,0H${clippedWidth}`);

  g.selectAll('line')
    .attr('stroke', axisColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 1)
    .each(function () {
      const line = this as SVGLineElement;
      const x1 = parseFloat(line.getAttribute('x1') || '0');
      if (x1 < 0 || x1 > clippedWidth) {
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

      const isOutLeft = x + textWidth / 2 < 0;
      const isOutRight = x - textWidth / 2 > clippedWidth;

      if (isOutLeft || isOutRight) {
        text.setAttribute('opacity', '0');
        return;
      }

      text.setAttribute('opacity', '1');
    });

  // Static baseline for X axis: full chart width, not affected by X-axis animation.
  const jointColor = chartColors.grid;
  const jointLength = clippedWidth;

  const axesGroupNode = (g.node()?.parentNode as SVGGElement | null) ?? null;
  const axesGroupSelection = axesGroupNode ? (select(axesGroupNode) as SVGGroupSelection) : g;

  const existingJoint = axesGroupSelection.select<SVGLineElement>('line.x-axis-static-baseline');
  const jointLine = existingJoint.empty()
    ? axesGroupSelection.append('line').attr('class', 'x-axis-static-baseline')
    : existingJoint;

  jointLine
    .attr('x1', 0)
    .attr('x2', jointLength)
    .attr('y1', chartHeight)
    .attr('y2', chartHeight)
    .attr('stroke', jointColor)
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 1);
};

const createYAxis = (
  g: SVGGroupSelection,
  yScale: YScale,
  chartHeight: number,
  chartColors: ChartColors,
  ticks?: number,
) => {
  const axis = axisLeft(yScale);
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
  g: SVGGroupSelection,
  xScale: XScale,
  yScale: YScale,
  chartHeight: number,
  chartWidth: number,
  chartColors: ChartColors,
  margin: { right: number },
  xTicks?: number,
  yTicks?: number,
): {
  xAxisGroup: SVGGroupSelection;
  yAxisGroup: SVGGroupSelection;
} => {
  let xAxisGroup = g.select<SVGGElement>('g.x-axis-group');
  if (xAxisGroup.empty()) {
    xAxisGroup = g.append('g').attr('class', 'x-axis-group');
  }
  xAxisGroup.attr('clip-path', 'url(#x-axis-clip)');

  let yAxisGroup = g.select<SVGGElement>('g.y-axis-group');
  if (yAxisGroup.empty()) {
    yAxisGroup = g.append('g').attr('class', 'y-axis-group');
  }

  createXAxis(xAxisGroup, xScale, chartHeight, chartWidth, chartColors, margin, xTicks);
  createYAxis(yAxisGroup, yScale, chartHeight, chartColors, yTicks);

  return { xAxisGroup, yAxisGroup };
};

interface LegendItem {
  label: string;
  color: string;
}

export const createLineLegend = (
  g: SVGGroupSelection,
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
