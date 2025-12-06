import { useState, useEffect, useRef, useMemo } from 'react';

import {
  MultiLineChartCanvas,
  getChartColors,
  type ChartVariant,
  type DataPoint,
} from '@/components/basic/charts';
import { createTrendGenerator, generateLineData } from './data-generators';

interface MultiLineChartCanvasProps {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  showLegend?: boolean;
  width?: number;
  height?: number;
}

const MAX_DATA_POINTS = 200;

export const MultiLineChartD3Canvas = ({
  delay = 1,
  count = 200,
  variant = 'normal',
  showLegend = true,
  width = 600,
  height = 250,
}: MultiLineChartCanvasProps) => {
  const line1GeneratorRef = useRef(createTrendGenerator(100, [50, 150]));
  const line2GeneratorRef = useRef(createTrendGenerator(80, [30, 130]));

  const effectiveCount = Math.min(count, MAX_DATA_POINTS);

  const [lineData, setLineData] = useState<DataPoint[]>(() =>
    generateLineData(effectiveCount, undefined, undefined, 100, [50, 150]),
  );
  const [areaData, setAreaData] = useState<DataPoint[]>(() =>
    generateLineData(effectiveCount, undefined, undefined, 80, [30, 130]),
  );

  const chartColors = getChartColors(variant);

  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    let wasHidden = document.hidden;
    let isMounted = true;

    const tick = (timestamp: number) => {
      if (!isMounted) return;

      if (document.hidden) {
        animationFrameId = null;
        return;
      }

      if (timestamp - lastUpdateTime >= delay) {
        const now = Date.now();
        const updateData = (prev: DataPoint[], generator: () => number) => {
          if (prev.length >= effectiveCount) {
            const newData = new Array(effectiveCount);
            for (let i = 0; i < effectiveCount - 1; i++) {
              newData[i] = prev[i + 1];
            }
            newData[effectiveCount - 1] = { time: now, value: generator() };
            return newData;
          }
          return [...prev, { time: now, value: generator() }];
        };

        setLineData((prev) => updateData(prev, line1GeneratorRef.current));
        setAreaData((prev) => updateData(prev, line2GeneratorRef.current));
        lastUpdateTime = timestamp;
      }

      if (isMounted && !document.hidden) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const startTick = () => {
      if (!document.hidden && isMounted) {
        lastUpdateTime = performance.now();
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHidden = true;
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (wasHidden && isMounted) {
        wasHidden = false;
        const now = Date.now();
        line1GeneratorRef.current = createTrendGenerator(100, [50, 150]);
        line2GeneratorRef.current = createTrendGenerator(80, [30, 130]);
        setLineData(generateLineData(effectiveCount, undefined, now, 100, [50, 150]));
        setAreaData(generateLineData(effectiveCount, undefined, now, 80, [30, 130]));
        startTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTick();

    return () => {
      isMounted = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, effectiveCount]);

  const lines = useMemo(
    () => [
      {
        data: lineData,
        color: chartColors.primary,
        label: 'Line 1',
        showDots: true,
      },
      {
        data: areaData,
        color: chartColors.tertiary,
        label: 'Line 2',
        showDots: true,
      },
    ],
    [lineData, areaData, chartColors.primary, chartColors.tertiary],
  );

  return (
    <MultiLineChartCanvas
      lines={lines}
      width={width}
      height={height}
      variant={variant}
      showLegend={showLegend}
      yDomain={[0, 200]}
    />
  );
};
