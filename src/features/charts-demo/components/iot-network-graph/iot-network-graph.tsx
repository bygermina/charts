import { useEffect, useRef } from 'react';

import { getChartColors, type ChartVariant, ResponsiveChartWrapper } from '@/entities/chart';

import { createNetworkGraph } from './create-network-graph';

import styles from './iot-network-graph.module.scss';

interface IoTNetworkGraphProps {
  width?: number;
  height?: number;
  variant?: ChartVariant;
}

const NetworkGraphContent = ({
  width,
  height,
  variant = 'normal',
}: {
  width: number;
  height: number;
  variant?: ChartVariant;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const chartColors = getChartColors(variant);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || width === 0 || height === 0) return;

    return createNetworkGraph({
      svgElement,
      width,
      height,
      chartColors,
    });
  }, [width, height, chartColors]);

  return (
    <div className={styles.container}>
      <svg ref={svgRef} width={width} height={height} className={styles.svg} />
    </div>
  );
};

export const IoTNetworkGraph = ({
  width,
  height = 300,
  variant = 'normal',
}: IoTNetworkGraphProps) => {
  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }: { width: number; height: number }) => (
        <NetworkGraphContent width={chartWidth} height={chartHeight} variant={variant} />
      )}
    </ResponsiveChartWrapper>
  );
};
