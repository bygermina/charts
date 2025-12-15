import { select } from 'd3-selection';
import { useEffect, useRef } from 'react';

import { type ChartVariant, type SVGGroupSelection, type ChartScales } from '../../model/types';
import { useChartBase } from '../../lib/use-chart-base';
import { useVisibility } from '../../lib/use-visibility';
import { createChartGroups } from '../../lib/chart-utils';
import { createClipPaths } from '../../lib/utils/clip-paths';
import type { LineSeries, MultiLineChartMetadata } from './types';
import { DEFAULT_METADATA } from './types';
import { useMultiLineChartLines } from './hooks/use-multi-line-chart-lines';
import { useMultiLineChartGrid } from './hooks/use-multi-line-chart-grid';

import styles from './multi-line-chart.module.scss';

interface MultiLineChartProps {
  lines: LineSeries[];
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  showHeaderLegend?: boolean;
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
  showHeaderLegend = true,
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

  const scalesRef = useRef<ChartScales | null>(null);
  const mainGroupRef = useRef<SVGGroupSelection | null>(null);
  const axesGroupRef = useRef<SVGGroupSelection | null>(null);
  const gridGroupRef = useRef<SVGGroupSelection | null>(null);
  const xAxisGroupRef = useRef<SVGGroupSelection | null>(null);
  const lastChartDataRef = useRef<{ shouldAnimateShift: boolean; shiftOffset: number } | null>(
    null,
  );

  const prevMetadataRef = useRef<MultiLineChartMetadata>(DEFAULT_METADATA);

  useVisibility({
    onHidden: () => {
      prevMetadataRef.current = DEFAULT_METADATA;
      lastChartDataRef.current = null;

      if (mainGroupRef.current) {
        mainGroupRef.current.selectAll('*').remove();
      }
      if (axesGroupRef.current) {
        axesGroupRef.current.selectAll('*').remove();
      }
    },
  });

  useMultiLineChartLines({
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
    strokeWidth,
    animationSpeed,
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
  }, [svgRef, chartWidth, chartHeight, margin]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = select(svgElement);

    const { mainGroup, axesGroup } = createChartGroups({
      svg,
      margin: { left: margin.left, top: margin.top },
      useClipPath: true,
    });

    mainGroupRef.current = mainGroup;
    axesGroupRef.current = axesGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartWidth, chartHeight, margin]);

  useMultiLineChartGrid({
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
  });

  const headerLegendLines = showHeaderLegend ? lines : [];

  return (
    <div className={styles.container} style={{ width }}>
      {headerLegendLines.length > 0 && (
        <div className={styles.headerLegend}>
          {headerLegendLines.map((line) => (
            <div
              key={line.label}
              className={styles.headerLegendItem}
              style={{ ['--multi-line-header-color' as string]: line.color }}
            >
              <div className={styles.headerLegendLine} />
              <span className={styles.headerLegendLabel}>{line.label}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ width, height }}>
        <svg ref={svgRef} width={width} height={height} className={styles.svg} />
      </div>
    </div>
  );
};
