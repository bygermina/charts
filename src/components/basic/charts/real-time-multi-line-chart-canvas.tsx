import { useRef, useCallback, useEffect, type RefObject } from 'react';
import * as d3 from 'd3';

import { type ChartVariant } from './types';
import { useChartBase } from './use-chart-base';
import { type LineSeries, type Scales } from './multi-line-chart/index';
import {
  processLinesData,
  type ProcessLinesDataCache,
} from './multi-line-chart-canvas/process-data';
import { renderMultiLineChart } from './multi-line-chart-canvas/render-chart';
import { TIME_WINDOW_MS, MAX_DISPLAY_POINTS } from './multi-line-chart-canvas/constants';
import { useCanvasRenderLoop } from './use-canvas-render-loop';
import { createCSSVariableCache } from './utils/canvas-helpers';
import { calculateShiftAnimation, calculateAnimationSpeed } from './chart-animation';
import { calculateTimeExtent } from './multi-line-chart/time-extent';
import styles from './multi-line-chart-canvas.module.scss';

interface RealTimeMultiLineChartCanvasProps {
  lines?: LineSeries[];
  linesRef?: RefObject<LineSeries[]>;
  width?: number;
  height?: number;
  variant?: ChartVariant;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  yDomain?: [number, number];
  timeWindowMs?: number;
  maxDisplayPoints?: number;
}

export const RealTimeMultiLineChartCanvas = ({
  lines,
  linesRef,
  width = 600,
  height = 250,
  variant = 'normal',
  showGrid = true,
  showLegend = true,
  strokeWidth = 1,
  yDomain,
  timeWindowMs = TIME_WINDOW_MS,
  maxDisplayPoints = MAX_DISPLAY_POINTS,
}: RealTimeMultiLineChartCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const linesRefInternal = useRef(lines);
  const timeWindowMsRef = useRef(timeWindowMs);
  const maxDisplayPointsRef = useRef(maxDisplayPoints);

  // Кэшируем объекты для переиспользования
  const cachedScalesRef = useRef<Scales | null>(null);
  const cachedResolvedColorsRef = useRef<Record<string, string> | null>(null);
  const cachedLinesForLegendRef = useRef<LineSeries[]>([]);
  const processDataCacheRef = useRef<ProcessLinesDataCache>({
    result: [],
    reusableLineSeries: [],
    slicedArrays: [],
  });
  const cssVariableCacheRef = useRef(createCSSVariableCache());
  const timeExtentCacheRef = useRef<{ allTimes: number[]; timeIntervals: number[] }>({
    allTimes: [],
    timeIntervals: [],
  });
  
  // Для плавного translate
  const prevTimeExtentRef = useRef<[number, number] | null>(null);
  const currentTranslateRef = useRef(0);
  const animationStartTranslateRef = useRef(0);
  const animationStartTimeRef = useRef<number | null>(null);
  const animationDurationRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const cssCache = cssVariableCacheRef.current;
      if (cssCache.cache.size > 30) {
        cssCache.cache.clear();
        cssCache.computedStyle = null;
        cssCache.element = null;
      }

      const timeCache = timeExtentCacheRef.current;
      if (timeCache.allTimes.length > 1000) timeCache.allTimes.length = 0;
      if (timeCache.timeIntervals.length > 1000) timeCache.timeIntervals.length = 0;
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const { chartColors, margin, chartWidth, chartHeight } = useChartBase({
    width,
    height,
    variant,
  });

  useEffect(() => {
    if (lines !== undefined) linesRefInternal.current = lines;
    timeWindowMsRef.current = timeWindowMs;
    maxDisplayPointsRef.current = maxDisplayPoints;
    cachedResolvedColorsRef.current = null;
  }, [lines, timeWindowMs, maxDisplayPoints, chartColors]);

  const renderChart = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const currentLines = linesRef?.current ?? linesRefInternal.current ?? [];
      const timeWindowStart = Date.now() - timeWindowMsRef.current;
      const dataToUse = processLinesData(
        currentLines,
        timeWindowStart,
        maxDisplayPointsRef.current,
        processDataCacheRef.current,
      );

      // Вычисляем текущий timeExtent один раз
      let currentTimeExtent: [number, number] | null = null;
      try {
        const timeExtentResult = calculateTimeExtent({ lines: dataToUse }, timeExtentCacheRef.current);
        if (timeExtentResult.timeExtent[0] !== null && timeExtentResult.timeExtent[1] !== null) {
          currentTimeExtent = timeExtentResult.timeExtent;
        }
      } catch {
        // Игнорируем ошибку если нет данных
      }
      
      // Проверяем нужно ли начать анимацию translate
      if (prevTimeExtentRef.current !== null && currentTimeExtent !== null && !isAnimatingRef.current) {
        const animationResult = calculateShiftAnimation({
          prevTimeExtent: prevTimeExtentRef.current,
          currentTimeExtent,
          chartWidth,
        });

        if (animationResult.shouldAnimate) {
          // Начинаем новую анимацию
          const speed = calculateAnimationSpeed({
            data: dataToUse[0]?.data || [],
            xScale: cachedScalesRef.current?.xScale || d3.scaleTime(),
            fallbackSpeed: chartWidth / 10,
          });
          
          const shiftOffset = animationResult.shiftOffset;
          // Сохраняем текущее значение как начальное для анимации
          animationStartTranslateRef.current = currentTranslateRef.current + shiftOffset;
          currentTranslateRef.current = animationStartTranslateRef.current;
          animationDurationRef.current = Math.abs(shiftOffset / speed) * 1000;
          animationStartTimeRef.current = performance.now();
          isAnimatingRef.current = true;
        }
      }

      // Обновляем анимацию translate
      if (isAnimatingRef.current && animationStartTimeRef.current !== null) {
        const elapsed = performance.now() - animationStartTimeRef.current;
        const progress = Math.min(elapsed / animationDurationRef.current, 1);
        
        // Используем линейную интерполяцию как в SVG версии (d3.easeLinear)
        const startTranslate = animationStartTranslateRef.current;
        
        if (progress >= 1) {
          currentTranslateRef.current = 0;
          isAnimatingRef.current = false;
          animationStartTimeRef.current = null;
        } else {
          // Интерполируем от начального значения к 0
          currentTranslateRef.current = startTranslate * (1 - progress);
        }
      }

      const result = renderMultiLineChart({
        ctx,
        canvas,
        lines: dataToUse,
        chartColors,
        margin,
        chartWidth,
        chartHeight,
        showGrid,
        showLegend,
        strokeWidth,
        yDomain,
        cachedScales: cachedScalesRef.current,
        cachedResolvedColors: cachedResolvedColorsRef.current,
        cachedLinesForLegend: cachedLinesForLegendRef.current,
        cssVariableCache: cssVariableCacheRef.current,
        timeExtentCache: timeExtentCacheRef.current,
        animatedTranslate: currentTranslateRef.current,
        precomputedTimeExtent: currentTimeExtent,
      });

      cachedScalesRef.current = result.scales;
      cachedResolvedColorsRef.current = result.resolvedColors;
      
      // Обновляем prevTimeExtent для следующего рендера
      if (currentTimeExtent !== null) {
        prevTimeExtentRef.current = currentTimeExtent;
      }
    },
    [
      chartColors,
      margin,
      chartWidth,
      chartHeight,
      showGrid,
      showLegend,
      strokeWidth,
      yDomain,
      linesRef,
    ],
  );

  useCanvasRenderLoop({
    canvasRef,
    width,
    height,
    render: renderChart,
    dependencies: [timeWindowMs, maxDisplayPoints],
  });

  return (
    <div className={styles.container} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
    </div>
  );
};
