import { useEffect } from 'react';
import type * as d3 from 'd3';

import { calculateAnimationSpeed } from '../../lib/chart-animation';
import type { ChartColors } from '../../model/types';
import { animateGridAndAxis, manageGrid, manageLegend } from './components/grid-legend';
import { calculateGridLeftShift } from './utils/grid-shift-calculations';
import type { LineSeries, Metadata, Scales } from './types';

interface UseMultiLineChartGridParams {
  lines: LineSeries[];
  svgRef: React.RefObject<SVGSVGElement | null>;
  mainGroupRef: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  scalesRef: React.RefObject<Scales | null>;
  gridGroupRef: React.RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
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
  showGrid: boolean;
  showLegend: boolean;
  animationSpeed?: number;
}

export const useMultiLineChartGrid = ({
  lines,
  svgRef,
  mainGroupRef,
  scalesRef,
  gridGroupRef,
  xAxisGroupRef,
  lastChartDataRef,
  prevMetadataRef,
  chartWidth,
  chartHeight,
  margin,
  chartColors,
  showGrid,
  showLegend,
  animationSpeed,
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
};
