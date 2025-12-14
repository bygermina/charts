import * as d3 from 'd3';
import { select } from 'd3-selection';
import { useEffect, useRef, useState } from 'react';

import { type ChartVariant } from '../../model/types';
import { createClipPaths } from '../../lib/utils/clip-paths';
import { useChartBase } from '../../lib/use-chart-base';
import { useVisibilityCleanup } from '../../lib/use-visibility-cleanup';
import type { LineSeries, Metadata, Scales } from './types';
import { DEFAULT_METADATA } from './types';
import { createChartGroups } from './components/svg-groups';
import { useMultiLineChartLines } from './use-multi-line-chart-lines';
import { useMultiLineChartGrid } from './use-multi-line-chart-grid';

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
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
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
  margin: customMargin,
}: MultiLineChartProps) => {
  const { svgRef, chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
    margin: customMargin,
  });

  const scalesRef = useRef<Scales | null>(null);
  const mainGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const axesGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const gridGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const xAxisGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const lastChartDataRef = useRef<{ shouldAnimateShift: boolean; shiftOffset: number } | null>(
    null,
  );

  const [visibilityKey, setVisibilityKey] = useState(0);
  const prevMetadataRef = useRef<Metadata>(DEFAULT_METADATA);

  useMultiLineChartLines({
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
  });

  useVisibilityCleanup({
    svgRef,
    cleanupOnHidden: false,
    onHidden: () => {
      // Reset handled in useMultiLineChartLines
    },
    onVisible: () => {
      prevMetadataRef.current = DEFAULT_METADATA;
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

  useMultiLineChartGrid({
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
  });

  return (
    <div className={styles.container} style={{ width, height }}>
      <svg ref={svgRef} width={width} height={height} className={styles.svg} />
    </div>
  );
};
