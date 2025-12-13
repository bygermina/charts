import { useEffect, useState } from 'react';
import type * as d3 from 'd3';

import { calculateAnimationSpeed } from '../../lib/chart-animation';
import { createAxes } from '../../lib/chart-utils';
import { DEFAULT_X_AXIS_TICKS, DEFAULT_Y_AXIS_TICKS } from '../../model/constants';
import type { ChartColors } from '../../model/types';
import { getOrCreateLineGroup, getOrCreateLinePath } from './components/svg-groups';
import { createAndAnimateDots } from './components/dots';
import { prepareChartData } from './utils/data-calculations';
import { createScalesForAxes, updateScalesForAxes } from './utils/scales';
import { createLineGenerator, updateLine } from './utils/line-generator';
import type { LineSeries, Metadata, Scales } from './types';

interface UseMultiLineChartLinesParams {
  lines: LineSeries[];
  svgRef: React.RefObject<SVGSVGElement | null>;
  mainGroupRef: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  axesGroupRef: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  scalesRef: React.RefObject<Scales | null>;
  xAxisGroupRef: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  lastChartDataRef: React.RefObject<{
    shouldAnimateShift: boolean;
    shiftOffset: number;
  } | null>;
  prevMetadataRef: React.RefObject<Metadata>;
  chartWidth: number;
  chartHeight: number;
  margin: { left: number; right: number; top: number; bottom: number };
  chartColors: ChartColors;
  yDomain?: [number, number];
  animationSpeed?: number;
  strokeWidth: number;
  visibilityKey: number;
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
  visibilityKey,
}: UseMultiLineChartLinesParams) => {
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (lines.length === 0 || lines.some((line) => line.data.length === 0)) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;
    if (!mainGroupRef.current || !axesGroupRef.current) return;

    const mainGroup = mainGroupRef.current;
    const axesGroup = axesGroupRef.current;

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
        const { data, color } = lineSeries;
        const line = createLineGenerator({ xScale, yScale });
        const lineGroup = getOrCreateLineGroup({ mainGroup, lineIndex });
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
      });
    }

    lines.forEach((lineSeries, lineIndex) => {
      const { data, color, showDots } = lineSeries;
      if (showDots ?? true) {
        const lineGroup = getOrCreateLineGroup({ mainGroup, lineIndex });
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
    visibilityKey,
  ]);

  useEffect(() => {
    if (visibilityKey > 0) {
      setIsInitialRender(true);
    }
  }, [visibilityKey]);

  return { isInitialRender };
};
