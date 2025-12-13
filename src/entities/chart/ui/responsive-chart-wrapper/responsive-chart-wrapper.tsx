import { useRef, type ReactNode } from 'react';

import { useContainerSize } from '../../lib/use-container-size';

import styles from './responsive-chart-wrapper.module.scss';

interface ResponsiveChartWrapperProps {
  children: (size: { width: number; height: number }) => ReactNode;
  width?: number;
  height?: number;
}

export const ResponsiveChartWrapper = ({
  children,
  width,
  height,
}: ResponsiveChartWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);
  const chartWidth = width ?? containerSize.width;
  const chartHeight = height ?? containerSize.height;

  return (
    <div ref={containerRef} className={styles.wrapper}>
      {children({ width: chartWidth, height: chartHeight })}
    </div>
  );
};
