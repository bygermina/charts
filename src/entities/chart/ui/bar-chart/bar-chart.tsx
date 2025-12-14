import { select } from 'd3-selection';
import { useEffect, useRef } from 'react';

import {
  BAR_GAP,
  BAR_WIDTH_RATIO,
  BAR_GRADIENT_ID,
  DEFAULT_X_AXIS_TICKS,
  DEFAULT_Y_AXIS_TICKS,
} from '../../model/constants';
import { type BarDataPoint, type ChartVariant } from '../../model/types';
import { createGrid, createAxes, createChartGroups } from '../../lib/chart-utils';
import { createClipPaths } from '../../lib/utils/clip-paths';
import { useChartBase } from '../../lib/use-chart-base';
import { getClippedWidth } from '../../lib/chart-dimensions';
import { createBars } from './utils/bars';
import { createGradient } from './utils/gradients';
import { createScales } from './utils/scales';
import { updateBars } from './utils/animation';
import { cleanupBarChart } from './utils/cleanup';

interface BarChartProps {
  data: BarDataPoint[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

export const BarChart = ({
  data,
  width = 600,
  height = 250,
  variant = 'normal',
  showGrid = true,
  margin: customMargin,
}: BarChartProps) => {
  const { svgRef, chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
    margin: customMargin,
  });

  const fillColor = chartColors.secondary;
  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    if (data.length === 0) {
      cleanupBarChart(svgElement);
    }
  }, [data.length, svgRef]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || data.length === 0) return;

    const svg = select(svgElement);
    svg.selectAll('.bar-tooltip').remove();

    createClipPaths({
      svg,
      chartWidth,
      chartHeight,
      margin,
    });

    const { mainGroup } = createChartGroups({
      svg,
      margin,
      useClipPath: true,
    });

    const defs = mainGroup.select<SVGDefsElement>('defs').empty()
      ? mainGroup.append('defs')
      : mainGroup.select<SVGDefsElement>('defs');

    createGradient({
      defs,
      color: fillColor,
      chartHeight,
      gradientId: BAR_GRADIENT_ID,
    });
  }, [chartWidth, chartHeight, margin, fillColor, svgRef, data.length]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || data.length === 0) return;

    const svg = select(svgElement);
    const { mainGroup, axesGroup } = createChartGroups({
      svg,
      margin,
      useClipPath: true,
    });

    const { xScale, xAxisScale, yScale } = createScales({
      data,
      chartWidth,
      chartHeight,
      margin,
    });

    if (showGrid) {
      const clippedWidth = getClippedWidth(chartWidth, margin.right);

      createGrid(
        mainGroup,
        xAxisScale,
        yScale,
        clippedWidth,
        chartHeight,
        chartColors,
        svgElement,
        DEFAULT_X_AXIS_TICKS,
        DEFAULT_Y_AXIS_TICKS,
      );
    }

    createAxes(
      axesGroup,
      xAxisScale,
      yScale,
      chartHeight,
      chartWidth,
      chartColors,
      margin,
      DEFAULT_X_AXIS_TICKS,
      DEFAULT_Y_AXIS_TICKS,
    );

    const timeExtent = xScale.domain();
    const timeRange = timeExtent[1].getTime() - timeExtent[0].getTime();
    const avgInterval = timeRange / Math.max(data.length - 1, 1);
    const nextTime = new Date(timeExtent[0].getTime() + avgInterval);
    const availableSpace = xScale(nextTime) - xScale(timeExtent[0]);
    const barWidth = Math.max((availableSpace - BAR_GAP) * BAR_WIDTH_RATIO, 1);

    const { barsEnter, barsUpdate, barsExit } = createBars({
      g: mainGroup,
      data,
      xScale,
      yScale,
      chartHeight,
      gradientId: BAR_GRADIENT_ID,
      barWidth,
      chartColors,
    });

    updateBars({ barsEnter, barsUpdate, barsExit, yScale, chartHeight });
    isInitialRenderRef.current = false;
  }, [data, chartWidth, chartHeight, margin, showGrid, chartColors, svgRef]);

  return <svg ref={svgRef} width={width} height={height} />;
};
