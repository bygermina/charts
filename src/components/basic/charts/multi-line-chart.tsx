import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { createAxes } from './chart-utils';
import { useVisibilityCleanup } from './use-visibility-cleanup';

import styles from './multi-line-chart.module.scss';
import {
  type LineSeries,
  createClipPaths,
  createScalesForAxes,
  calculateGridLeftShift,
  createLineGenerator,
  updateLine,
  updateDotsCoordinates,
  prepareChartData,
  createAndAnimateDots,
  createChartGroups,
  getOrCreateLineGroup,
  getOrCreateLinePath,
  manageGrid,
  manageLegend,
  animateGridAndAxis,
} from './multi-line-chart/index';
import { calculateAnimationSpeed } from './chart-animation';

const DEFAULT_X_AXIS_TICKS = 5;
const DEFAULT_Y_AXIS_TICKS = 5;

interface MultiLineChartProps {
  lines: LineSeries[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  animationSpeed?: number; // px/sec
  yDomain?: [number, number]; // Fixed Y axis domain to prevent jumping
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

  const [isInitialRender, setIsInitialRender] = useState(true);

  useVisibilityCleanup({
    svgRef,
    onHidden: () => {
      setIsInitialRender(true);
    },
    onVisible: () => {
      setIsInitialRender(true);
      prevMetadataRef.current = { timeExtent: null, timeStep: 0 };
    },
  });

  useEffect(() => {
    if (lines.length === 0 || lines.some((line) => line.data.length === 0)) return;
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const renderChart = () => {
      const svg = d3.select(svgElement);

      createClipPaths({
        svg,
        chartWidth,
        chartHeight,
        margin,
      });

      const { mainGroup: g, axesGroup } = createChartGroups({
        svg,
        margin,
      });

      const chartData = prepareChartData({
        lines,
        prevMetadata: prevMetadataRef.current,
        isInitialRender,
        chartWidth,
      });

      const { timeExtent, timeStep, maxValue, shouldAnimateShift, shiftOffset } = chartData;

      const { xScale, xAxisScale, yScale } = createScalesForAxes({
        timeExtent,
        maxValue,
        chartWidth,
        chartHeight,
        margin,
        yDomain,
      });

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
          })
        : null;

      const { xAxisGroup } = createAxes(
        axesGroup,
        xAxisScale,
        yScale,
        chartHeight,
        chartColors,
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
          updateDotsCoordinates({
            lineGroup,
            lineIndex,
            data,
            xScale,
            yScale,
          });

          createAndAnimateDots({
            lineGroup,
            lineIndex,
            data,
            color,
            isInitialRender,
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

    renderChart();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lines,
    width,
    height,
    variant,
    chartColors,
    showGrid,
    showLegend,
    strokeWidth,
    margin,
    chartWidth,
    chartHeight,
    animationSpeed,
    isInitialRender,
    yDomain,
  ]);

  return (
    <div className={styles.container} style={{ width, height }}>
      <svg ref={svgRef} width={width} height={height} className={styles.svg} />
    </div>
  );
};
