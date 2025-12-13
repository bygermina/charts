import * as d3 from 'd3';
import { select } from 'd3-selection';
import { useEffect, useRef, useState } from 'react';

import { DEFAULT_X_AXIS_TICKS, DEFAULT_Y_AXIS_TICKS } from '../../model/constants';
import { type ChartVariant } from '../../model/types';
import { calculateAnimationSpeed } from '../../lib/chart-animation';
import { createAxes } from '../../lib/chart-utils';
import { createClipPaths } from '../../lib/utils/clip-paths';
import { useChartBase } from '../../lib/use-chart-base';
import { useVisibilityCleanup } from '../../lib/use-visibility-cleanup';
import type { LineSeries, Scales } from './types';
import {
  createChartGroups,
  getOrCreateLineGroup,
  getOrCreateLinePath,
} from './components/svg-groups';
import { prepareChartData } from './utils/data-calculations';
import { createScalesForAxes, updateScalesForAxes } from './utils/scales';
import { createLineGenerator, updateLine } from './utils/line-generator';
import { createAndAnimateDots } from './components/dots';
import { calculateGridLeftShift } from './utils/grid-shift-calculations';
import { animateGridAndAxis, manageGrid, manageLegend } from './components/grid-legend';

import styles from './multi-line-chart.module.scss';

interface MultiLineChartProps {
  lines: LineSeries[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  animationSpeed?: number;
  yDomain?: [number, number];
}

export const MultiLineChart = ({
  lines,
  width = 600,
  height = 250,
  variant = 'normal',
  showGrid = true,
  showLegend = true,
  strokeWidth = 1,
  animationSpeed,
  yDomain,
}: MultiLineChartProps) => {
  const { svgRef, chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  const prevMetadataRef = useRef<{
    timeExtent: [number, number] | null;
    timeStep: number;
  }>({ timeExtent: null, timeStep: 0 });

  const scalesRef = useRef<Scales | null>(null);
  const mainGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const axesGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const gridGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const xAxisGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const lastChartDataRef = useRef<{ shouldAnimateShift: boolean; shiftOffset: number } | null>(
    null,
  );

  const [isInitialRender, setIsInitialRender] = useState(true);
  const [visibilityKey, setVisibilityKey] = useState(0);

  useVisibilityCleanup({
    svgRef,
    cleanupOnHidden: false,
    onHidden: () => {
      setIsInitialRender(true);
    },
    onVisible: () => {
      setIsInitialRender(true);
      prevMetadataRef.current = { timeExtent: null, timeStep: 0 };
      scalesRef.current = null;
      mainGroupRef.current = null;
      axesGroupRef.current = null;
      gridGroupRef.current = null;
      xAxisGroupRef.current = null;
      setVisibilityKey((prev) => prev + 1);
    },
  });

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = select(svgElement);

    createClipPaths({
      svg,
      chartWidth,
      chartHeight,
      margin,
    });

    const { mainGroup, axesGroup } = createChartGroups({
      svg,
      margin: { left: margin.left, top: margin.top },
    });

    mainGroupRef.current = mainGroup;
    axesGroupRef.current = axesGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartWidth, chartHeight, margin, visibilityKey]);

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
    if (lines.length === 0 || lines.some((line) => line.data.length === 0)) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;
    if (!mainGroupRef.current || !scalesRef.current) return;

    const mainGroup = mainGroupRef.current;
    const { xAxisScale, yScale } = scalesRef.current;
    const { timeExtent, timeStep } = prevMetadataRef.current;

    if (!timeExtent) return;

    const gridLeftShift = calculateGridLeftShift({
      timeStep,
      timeExtent,
      chartWidth,
    });

    const gridGroup = showGrid
      ? manageGrid({
          mainGroup,
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

    gridGroupRef.current = gridGroup;

    manageLegend({
      mainGroup,
      lines,
      chartWidth,
      showLegend,
      chartColors,
    });

    if (gridGroup && xAxisGroupRef.current && lastChartDataRef.current) {
      const { shouldAnimateShift, shiftOffset } = lastChartDataRef.current;
      const shouldShift = shouldAnimateShift && !document.hidden;

      if (shouldShift) {
        const speed = calculateAnimationSpeed({
          data: lines[0].data,
          xScale: scalesRef.current.xScale,
          customSpeed: animationSpeed,
          fallbackSpeed: chartWidth / 10,
        });

        if (speed !== undefined) {
          animateGridAndAxis({
            gridGroup,
            xAxisGroup: xAxisGroupRef.current,
            shiftOffset,
            speed,
            gridLeftShift,
            chartHeight,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrid, showLegend, chartColors, chartWidth, chartHeight, margin, lines, animationSpeed]);

  return (
    <div className={styles.container} style={{ width, height }}>
      <svg ref={svgRef} width={width} height={height} className={styles.svg} />
    </div>
  );
};
