import { useEffect, useRef, useState } from 'react';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { useVisibilityCleanup } from './use-visibility-cleanup';

import styles from './multi-line-chart.module.scss';
import { type LineSeries } from './multi-line-chart/index';
import { renderMultiLineChart } from './multi-line-chart/render-chart';

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

    renderMultiLineChart({
      svgElement,
      lines,
      prevMetadataRef,
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
    });

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
