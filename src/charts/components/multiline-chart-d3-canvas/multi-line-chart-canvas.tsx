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

const LINE_CONFIGS = [
  { baseValue: 100, baseRange: [50, 150] as [number, number] },
  { baseValue: 80, baseRange: [30, 130] as [number, number] },
] as const;

const createInitialData = (count: number, config: (typeof LINE_CONFIGS)[number]) =>
  generateLineData(count, undefined, undefined, config.baseValue, config.baseRange);

export const MultiLineChartD3Canvas = ({
  delay = 12,
  count = 200,
  variant = 'normal',
  showLegend = true,
  width = 600,
  height = 250,
}: MultiLineChartCanvasProps) => {
  const effectiveCount = Math.min(count, MAX_DATA_POINTS);

  const generatorsRef = useRef(
    LINE_CONFIGS.map((config) => createTrendGenerator(config.baseValue, config.baseRange)),
  );

  const [lineData, setLineData] = useState<DataPoint[]>(() =>
    createInitialData(effectiveCount, LINE_CONFIGS[0]),
  );
  const [areaData, setAreaData] = useState<DataPoint[]>(() =>
    createInitialData(effectiveCount, LINE_CONFIGS[1]),
  );

  const chartColors = getChartColors(variant);

  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    let wasHidden = false;
    let isMounted = true;

    const tick = (timestamp: number) => {
      if (!isMounted || document.hidden) {
        animationFrameId = null;
        return;
      }

      if (timestamp - lastUpdateTime >= delay) {
        const now = Date.now();
        setLineData((prev) => [...prev.slice(1), { time: now, value: generatorsRef.current[0]() }]);
        setAreaData((prev) => [...prev.slice(1), { time: now, value: generatorsRef.current[1]() }]);
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

    const resetData = (now: number) => {
      setLineData(
        generateLineData(
          effectiveCount,
          undefined,
          now,
          LINE_CONFIGS[0].baseValue,
          LINE_CONFIGS[0].baseRange,
        ),
      );
      setAreaData(
        generateLineData(
          effectiveCount,
          undefined,
          now,
          LINE_CONFIGS[1].baseValue,
          LINE_CONFIGS[1].baseRange,
        ),
      );
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
        resetData(Date.now());
        startTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTick();

    return () => {
      isMounted = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
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
    [lineData, areaData, chartColors],
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
