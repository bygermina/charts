import { select } from 'd3-selection';

import { type ChartColors } from '../shared/types';
import { createAxes } from '../shared/chart-utils';
import { calculateAnimationSpeed } from '../shared/chart-animation';
import { DEFAULT_X_AXIS_TICKS, DEFAULT_Y_AXIS_TICKS } from '../shared/constants';
import type { LineSeries } from './types';
import { createClipPaths } from '../shared/utils/clip-paths';
import {
  createChartGroups,
  prepareChartData,
  createScalesForAxes,
  updateScalesForAxes,
  calculateGridLeftShift,
  createLineGenerator,
  updateLine,
  createAndAnimateDots,
  getOrCreateLineGroup,
  getOrCreateLinePath,
  manageGrid,
  manageLegend,
  animateGridAndAxis,
  type Scales,
} from './index';

interface RenderChartConfig {
  svgElement: SVGSVGElement;
  lines: LineSeries[];
  prevMetadataRef: React.RefObject<{
    timeExtent: [number, number] | null;
    timeStep: number;
  }>;
  scalesRef: React.RefObject<Scales | null>;
  isInitialRender: boolean;
  chartWidth: number;
  chartHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartColors: ChartColors;
  showGrid: boolean;
  showLegend: boolean;
  strokeWidth: number;
  animationSpeed?: number;
  yDomain?: [number, number];
  setIsInitialRender: (value: boolean) => void;
}

export const renderMultiLineChart = ({
  svgElement,
  lines,
  prevMetadataRef,
  scalesRef,
  isInitialRender,
  chartWidth,
  chartHeight,
  margin,
  chartColors,
  showGrid,
  showLegend,
  strokeWidth,
  animationSpeed,
  yDomain,
  setIsInitialRender,
}: RenderChartConfig): void => {
  const svg = select(svgElement);

  createClipPaths({
    svg,
    chartWidth,
    chartHeight,
    margin,
  });

  const { mainGroup: g, axesGroup } = createChartGroups({
    svg,
    margin: { left: margin.left, top: margin.top },
  });

  const chartData = prepareChartData({
    lines,
    prevMetadata: prevMetadataRef.current,
    isInitialRender,
    chartWidth,
  });

  const { timeExtent, timeStep, maxValue, shouldAnimateShift, shiftOffset } = chartData;

  if (!scalesRef.current) {
    scalesRef.current = createScalesForAxes({
      timeExtent,
      maxValue,
      chartWidth,
      chartHeight,
      margin,
      yDomain,
    });
  } else {
    updateScalesForAxes(scalesRef.current, {
      timeExtent,
      maxValue,
      chartWidth,
      chartHeight,
      margin,
      yDomain,
    });
  }

  const { xScale, xAxisScale, yScale } = scalesRef.current;

  const gridLeftShift = calculateGridLeftShift({
    timeStep,
    timeExtent,
    chartWidth,
  });

  const gridGroup = showGrid
    ? manageGrid({
        mainGroup: g,
        xScale: xAxisScale,
        yScale,
        chartWidth,
        chartHeight,
        margin,
        gridLeftShift,
        chartColors,
        svgElement,
      })
    : null;

  const { xAxisGroup } = createAxes(
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

  const shouldShift = shouldAnimateShift && !document.hidden;
  const speed = shouldShift
    ? calculateAnimationSpeed({
        data: lines[0].data,
        xScale,
        customSpeed: animationSpeed,
        fallbackSpeed: chartWidth / 10,
      })
    : undefined;

  lines.forEach((lineSeries, lineIndex) => {
    const { data, color, showDots } = lineSeries;
    const line = createLineGenerator({ xScale, yScale });
    const lineGroup = getOrCreateLineGroup({ mainGroup: g, lineIndex });
    const path = getOrCreateLinePath({
      lineGroup,
      color,
      strokeWidth,
      isInitialRender,
    });

    updateLine({
      path,
      line,
      lineGroup,
      data,
      isInitialRender,
      shouldShift,
      shiftOffset,
      speed,
    });

    if (showDots ?? true) {
      createAndAnimateDots({
        lineGroup,
        lineIndex,
        data,
        color,
        isInitialRender,
        xScale,
        yScale,
      });
    }
  });

  if (shouldShift && gridGroup && speed !== undefined) {
    animateGridAndAxis({
      gridGroup,
      xAxisGroup,
      shiftOffset,
      speed,
      gridLeftShift,
      chartHeight,
    });
  }

  manageLegend({
    mainGroup: g,
    lines,
    chartWidth,
    showLegend,
    chartColors,
  });

  prevMetadataRef.current = {
    timeExtent,
    timeStep,
  };
  setIsInitialRender(false);
};
