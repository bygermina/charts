import { useEffect, type RefObject } from 'react';

import type { ChartColors, ChartScales, SVGGroupSelection } from '../../../model/types';
import { manageGrid } from '../utils/grid-legend';
import { calculateGridLeftShift } from '../utils/grid-shift-calculations';
import type { LineSeries, MultiLineChartMetadata } from '../types';

interface UseMultiLineChartGridParams {
  lines: LineSeries[];
  svgRef: RefObject<SVGSVGElement | null>;
  mainGroupRef: RefObject<SVGGroupSelection | null>;
  scalesRef: RefObject<ChartScales | null>;
  gridGroupRef: RefObject<SVGGroupSelection | null>;
  lastChartDataRef: RefObject<{
    shouldAnimateShift: boolean;
    shiftOffset: number;
  } | null>;
  prevMetadataRef: RefObject<MultiLineChartMetadata>;
  chartWidth: number;
  chartHeight: number;
  margin: { left: number; right: number; top: number; bottom: number };
  chartColors: ChartColors;
  showGrid: boolean;
}

export const useMultiLineChartGrid = ({
  lines,
  svgRef,
  mainGroupRef,
  scalesRef,
  gridGroupRef,
  lastChartDataRef,
  prevMetadataRef,
  chartWidth,
  chartHeight,
  margin,
  chartColors,
  showGrid,
}: UseMultiLineChartGridParams) => {
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

    const shouldAnimate = lastChartDataRef.current?.shouldAnimateShift && !document.hidden;

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
          shouldAnimate,
        })
      : null;

    gridGroupRef.current = gridGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrid, chartColors, chartWidth, chartHeight, margin, lines]);
};
