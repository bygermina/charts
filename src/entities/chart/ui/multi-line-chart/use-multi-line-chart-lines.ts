import { useEffect, type RefObject } from 'react';

import { createAxes } from '../../lib/chart-utils';
import { DEFAULT_X_AXIS_TICKS, DEFAULT_Y_AXIS_TICKS } from '../../model/constants';
import type { ChartColors, SVGGroupSelection } from '../../model/types';
import { getOrCreateLineGroup } from './utils/svg-group-helpers';
import { getOrCreateLinePath } from './components/svg-groups';
import { createAndAnimateDots } from './components/dots';
import { prepareChartData } from './utils/data-calculations';
import { createOrUpdateScalesForAxes } from './utils/scales';
import { createLineGenerator, updateLine } from './utils/line-generator';
import type { LineSeries, Metadata, Scales } from './types';
import { calculateGridLeftShift } from './utils/grid-shift-calculations';
import { animateChartShift, calculateChartAnimationSpeed } from './utils/chart-animation';

interface UseMultiLineChartLinesParams {
  lines: LineSeries[];
  svgRef: RefObject<SVGSVGElement | null>;
  mainGroupRef: RefObject<SVGGroupSelection | null>;
  axesGroupRef: RefObject<SVGGroupSelection | null>;
  scalesRef: RefObject<Scales | null>;
  xAxisGroupRef: RefObject<SVGGroupSelection | null>;
  gridGroupRef: RefObject<SVGGroupSelection | null>;
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
  strokeWidth: number;
  animationSpeed?: number;
}

export const useMultiLineChartLines = ({
  lines,
  svgRef,
  mainGroupRef,
  axesGroupRef,
  scalesRef,
  xAxisGroupRef,
  gridGroupRef,
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
  useEffect(() => {
    if (lines.length === 0 || lines.some((line) => line.data.length === 0)) {
      if (mainGroupRef.current) {
        mainGroupRef.current.selectAll('*').remove();
      }
      if (svgRef.current && axesGroupRef.current) {
        axesGroupRef.current.selectAll('*').remove();
      }
      return;
    }

    if (!svgRef.current) return;
    if (!mainGroupRef.current || !axesGroupRef.current) return;

    const mainGroup = mainGroupRef.current;
    const axesGroup = axesGroupRef.current;

    const chartData = prepareChartData({
      lines,
      prevMetadata: prevMetadataRef.current,
      chartWidth,
    });

    const { timeExtent, timeStep, maxValue, currentXScale, shouldAnimateShift, shiftOffset } =
      chartData;

    scalesRef.current = createOrUpdateScalesForAxes(scalesRef.current, {
      timeExtent,
      maxValue,
      chartWidth,
      chartHeight,
      margin,
      yDomain,
      xScale: currentXScale,
    });

    const { xAxisScale, yScale } = scalesRef.current;

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
        ? calculateChartAnimationSpeed({
            lines,
            xScale: xAxisScale,
            chartWidth,
            customSpeed: animationSpeed,
          })
        : undefined;

      const lineGroups: SVGGroupSelection[] = [];

      lines.forEach((lineSeries, lineIndex) => {
        const { data, color, showDots } = lineSeries;

        const lineGroup = getOrCreateLineGroup({ mainGroup, lineIndex });
        lineGroups.push(lineGroup as unknown as SVGGroupSelection);

        if (!shouldShift) {
          lineGroup.attr('transform', `translate(${-gridLeftShift}, 0)`);
        }

        const line = createLineGenerator({ xScale: xAxisScale, yScale });

        const path = getOrCreateLinePath({
          lineGroup,
          color,
          strokeWidth,
        });

        updateLine({
          path,
          line,
          data,
        });

        if (showDots ?? true) {
          createAndAnimateDots({
            lineGroup,
            lineIndex,
            data,
            color,
            xScale: xAxisScale,
            yScale,
          });
        }
      });

      if (shouldShift && speed !== undefined) {
        animateChartShift({
          lineGroups,
          gridGroup: gridGroupRef.current,
          xAxisGroup: xAxisGroupRef.current,
          shiftOffset,
          speed,
          gridLeftShift,
          chartHeight,
        });
      }
    }

    prevMetadataRef.current = {
      timeExtent,
      timeStep,
    };
    lastChartDataRef.current = {
      shouldAnimateShift,
      shiftOffset,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, chartWidth, chartHeight, margin, yDomain, strokeWidth, chartColors, animationSpeed]);
};
