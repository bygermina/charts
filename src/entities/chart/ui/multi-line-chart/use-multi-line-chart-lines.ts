import { useEffect, useState, type RefObject } from 'react';

import { calculateAnimationSpeed } from '../../lib/chart-animation';
import { createAxes } from '../../lib/chart-utils';
import { DEFAULT_X_AXIS_TICKS, DEFAULT_Y_AXIS_TICKS } from '../../model/constants';
import type { ChartColors, SVGGroupSelection } from '../../model/types';
import { getOrCreateLineGroup, getOrCreateLinePath } from './components/svg-groups';
import { createAndAnimateDots } from './components/dots';
import { prepareChartData } from './utils/data-calculations';
import { calculateGridLeftShift } from './utils/grid-shift-calculations';
import { createScalesForAxes, updateScalesForAxes } from './utils/scales';
import { createLineGenerator, updateLine } from './utils/line-generator';
import type { LineSeries, Metadata, Scales } from './types';

interface UseMultiLineChartLinesParams {
  lines: LineSeries[];
  svgRef: RefObject<SVGSVGElement | null>;
  mainGroupRef: RefObject<SVGGroupSelection | null>;
  axesGroupRef: RefObject<SVGGroupSelection | null>;
  scalesRef: RefObject<Scales | null>;
  xAxisGroupRef: RefObject<SVGGroupSelection | null>;
  lastChartDataRef: RefObject<{
    shouldAnimateShift: boolean;
    shiftOffset: number;
  } | null>;
  prevMetadataRef: RefObject<Metadata>;
  chartWidth: number;
  chartHeight: number;
  margin: { left: number; right: number; top: number; bottom: number };
  chartColors: ChartColors;
  yDomain?: [number, number];
  animationSpeed?: number;
  strokeWidth: number;
}

export const useMultiLineChartLines = ({
  lines,
  svgRef,
  mainGroupRef,
  axesGroupRef,
  scalesRef,
  xAxisGroupRef,
  lastChartDataRef,
  prevMetadataRef,
  chartWidth,
  chartHeight,
  margin,
  chartColors,
  yDomain,
  animationSpeed,
  strokeWidth,
}: UseMultiLineChartLinesParams) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const isVisible = !document.hidden;

  useEffect(() => {
    if (lines.length === 0 || lines.some((line) => line.data.length === 0)) {
      if (mainGroupRef.current) {
        mainGroupRef.current.selectAll('*').remove();
      }
      return;
    }

    const svgElement = svgRef.current;
    if (!svgElement) return;
    if (!mainGroupRef.current || !axesGroupRef.current) return;

    const mainGroup = mainGroupRef.current;
    const axesGroup = axesGroupRef.current;

    const chartData = prepareChartData({
      lines,
      prevMetadata: prevMetadataRef.current,
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

    xAxisGroup.attr('transform', `translate(${-gridLeftShift},${chartHeight})`);

    xAxisGroupRef.current = xAxisGroup;

    if (timeExtent) {
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
        const lineGroup = getOrCreateLineGroup({ mainGroup, lineIndex });

        const line = createLineGenerator({ xScale, yScale });
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
    }

    prevMetadataRef.current = {
      timeExtent,
      timeStep,
    };
    lastChartDataRef.current = {
      shouldAnimateShift,
      shiftOffset,
    };
    setIsInitialRender(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lines,
    chartWidth,
    chartHeight,
    margin,
    yDomain,
    isInitialRender,
    animationSpeed,
    strokeWidth,
    chartColors,
    isVisible,
  ]);

  return { isInitialRender };
};
