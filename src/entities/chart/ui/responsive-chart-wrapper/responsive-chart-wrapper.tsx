import { useRef, type ReactNode } from 'react';

import { DEFAULT_CHART_SIZE } from '../../model/constants';
import { useContainerSize } from '../../lib/use-container-size';

import styles from './responsive-chart-wrapper.module.scss';

export interface ChartSize {
  width: number;
  height: number;
}

interface ResponsiveChartWrapperProps {
  children: (size: ChartSize) => ReactNode;
  width?: number;
  height?: number;
  fixedWidth?: boolean;
}

export const ResponsiveChartWrapper = ({
  children,
  width,
  height,
  fixedWidth = false,
}: ResponsiveChartWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);
  const chartWidth =
    width ??
    (fixedWidth && DEFAULT_CHART_SIZE.width > containerSize.width
      ? DEFAULT_CHART_SIZE.width
      : containerSize.width);
  const chartHeight = height ?? containerSize.height;

  return (
    <div ref={containerRef} className={styles.wrapper}>
      {children({ width: chartWidth, height: chartHeight })}
    </div>
  );
};
