import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { type BarDataPoint, type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { createGrid, createAxes, createChartGroups } from './chart-utils';
import { createClipPaths } from './multi-line-chart/index';
import {
  createScales,
  createGradient,
  createBars,
  animateBars,
  updateBars,
  DEFAULT_X_AXIS_TICKS,
  DEFAULT_Y_AXIS_TICKS,
  BAR_WIDTH_RATIO,
  BAR_GAP,
} from './bar-chart/index';

interface BarChartProps {
  data: BarDataPoint[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
}

const GRADIENT_ID = 'bar-gradient';

export const BarChart = ({
  data,
  width = 600,
  height = 250,
  variant = 'normal',
  showGrid = true,
}: BarChartProps) => {
  const { svgRef, chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const prevDataRef = useRef<BarDataPoint[]>([]);
  const isInitialRenderRef = useRef(true);
  const fillColor = chartColors.secondary;

  useEffect(() => {
    if (data.length === 0) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = d3.select(svgElement);

    createClipPaths({
      svg,
      chartWidth,
      chartHeight,
      margin,
    });

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
      createGrid(mainGroup, xScale, yScale, chartWidth, chartHeight, chartColors, svgElement);
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

    const defs = mainGroup.append('defs');
    createGradient({
      defs,
      color: fillColor,
      chartHeight,
      gradientId: GRADIENT_ID,
    });

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
      gradientId: GRADIENT_ID,
      barWidth,
      chartColors,
    });

    if (isInitialRenderRef.current) {
      animateBars({ bars: barsUpdate, yScale, chartHeight });
      isInitialRenderRef.current = false;
    } else {
      updateBars({ barsEnter, barsUpdate, barsExit, yScale, chartHeight });
    }

    prevDataRef.current = data.map((d) => ({ ...d }));
  }, [
    data,
    width,
    height,
    variant,
    chartColors,
    fillColor,
    showGrid,
    margin,
    chartWidth,
    chartHeight,
    svgRef,
  ]);

  return <svg ref={svgRef} width={width} height={height} />;
};
