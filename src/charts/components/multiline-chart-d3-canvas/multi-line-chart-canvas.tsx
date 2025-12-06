import { useEffect, useRef } from 'react';

import { getChartColors, type ChartVariant, type DataPoint } from '@/components/basic/charts';
import { DEFAULT_MARGIN } from '@/components/basic/charts/chart-utils';
import {
  type LineSeries,
  createScalesForAxes,
  calculateGridLeftShift,
  createLineGenerator,
  prepareChartData,
} from '@/components/basic/charts/multi-line-chart/index';
import { resolveChartColors, setupCanvas } from '@/components/basic/charts/utils/canvas-helpers';
import {
  drawGrid,
  drawAxes,
  drawLine,
  drawLegend,
} from '@/components/basic/charts/multi-line-chart-canvas/drawing';
import { createTrendGenerator, generateLineData } from './data-generators';
import styles from '@/components/basic/charts/multi-line-chart-canvas.module.scss';

interface MultiLineChartCanvasProps {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  showLegend?: boolean;
  width?: number;
  height?: number;
}

const BUFFER_SIZE = 200;
const TIME_WINDOW_MS = 30000;
const MAX_DISPLAY_POINTS = 200;

const LINE_CONFIGS = [
  {
    baseValue: 100,
    baseRange: [50, 150] as [number, number],
    label: 'Line 1',
  },
  {
    baseValue: 80,
    baseRange: [30, 130] as [number, number],
    label: 'Line 2',
  },
] as const;

const createInitialData = (count: number, config: (typeof LINE_CONFIGS)[number]) =>
  generateLineData(count, undefined, undefined, config.baseValue, config.baseRange);

const processLinesData = (lines: LineSeries[], timeWindowStart: number): LineSeries[] => {
  const processed = lines.map((line) => ({
    ...line,
    data: line.data.slice(-MAX_DISPLAY_POINTS),
  }));

  return processed.map((line) => {
    const filtered = line.data.filter((point) => point.time >= timeWindowStart);
    return { ...line, data: filtered.length > 0 ? filtered : line.data };
  });
};

export const MultiLineChartD3Canvas = ({
  delay = 12,
  count = 200,
  variant = 'normal',
  showLegend = true,
  width = 600,
  height = 250,
}: MultiLineChartCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const generatorsRef = useRef(
    LINE_CONFIGS.map((config) => createTrendGenerator(config.baseValue, config.baseRange)),
  );

  const lineDataRef = useRef<DataPoint[]>([]);
  const areaDataRef = useRef<DataPoint[]>([]);
  const isInitializedRef = useRef(false);

  const chartColors = getChartColors(variant);
  const margin = DEFAULT_MARGIN;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!isInitializedRef.current) {
      lineDataRef.current = createInitialData(count, LINE_CONFIGS[0]);
      areaDataRef.current = createInitialData(count, LINE_CONFIGS[1]);
      isInitializedRef.current = true;
    }
  }, [count]);

  useEffect(() => {
    let dataUpdateFrameId: number | null = null;
    let renderFrameId: number | null = null;
    let lastDataUpdateTime = 0;
    let wasHidden = false;
    let isMounted = true;

    const updateDataBuffer = () => {
      if (!isMounted || document.hidden) return;

      const now = Date.now();
      const currentTime = performance.now();

      if (currentTime - lastDataUpdateTime >= delay) {
        const lineBuffer = lineDataRef.current;
        const areaBuffer = areaDataRef.current;

        lineBuffer.push({ time: now, value: generatorsRef.current[0]() });
        areaBuffer.push({ time: now, value: generatorsRef.current[1]() });

        if (lineBuffer.length > BUFFER_SIZE) lineBuffer.shift();
        if (areaBuffer.length > BUFFER_SIZE) areaBuffer.shift();

        lastDataUpdateTime = currentTime;
      }

      if (isMounted && !document.hidden) {
        dataUpdateFrameId = requestAnimationFrame(updateDataBuffer);
      }
    };

    const render = () => {
      if (!isMounted || document.hidden) {
        renderFrameId = null;
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        if (isMounted && !document.hidden) {
          renderFrameId = requestAnimationFrame(render);
        }
        return;
      }

      const setupResult = setupCanvas(canvas, width, height);
      if (!setupResult) {
        if (isMounted && !document.hidden) {
          renderFrameId = requestAnimationFrame(render);
        }
        return;
      }

      const { ctx } = setupResult;
      const resolvedChartColors = resolveChartColors(chartColors, canvas);

      const timeWindowStart = Date.now() - TIME_WINDOW_MS;
      const linesData: LineSeries[] = [
        {
          data: lineDataRef.current,
          color: resolvedChartColors.primary,
          label: LINE_CONFIGS[0].label,
        },
        {
          data: areaDataRef.current,
          color: resolvedChartColors.tertiary,
          label: LINE_CONFIGS[1].label,
        },
      ];

      const dataToUse = processLinesData(linesData, timeWindowStart);

      if (dataToUse.length === 0 || dataToUse.some((line) => line.data.length === 0)) {
        if (isMounted && !document.hidden) {
          renderFrameId = requestAnimationFrame(render);
        }
        return;
      }

      const chartData = prepareChartData({
        lines: dataToUse,
        prevMetadata: { timeExtent: null, timeStep: 0 },
        isInitialRender: true,
        chartWidth,
      });

      const { timeExtent, timeStep, maxValue, shiftOffset } = chartData;

      const { xScale, xAxisScale, yScale } = createScalesForAxes({
        timeExtent,
        maxValue,
        chartWidth,
        chartHeight,
        margin,
        yDomain: [0, 200],
      });

      const gridLeftShift = calculateGridLeftShift({
        timeStep,
        timeExtent,
        chartWidth,
      });

      ctx.save();
      ctx.translate(margin.left, margin.top);

      const lineGenerator = createLineGenerator({ xScale, yScale });

      drawGrid(
        ctx,
        xAxisScale,
        yScale,
        chartWidth,
        chartHeight,
        margin,
        gridLeftShift,
        resolvedChartColors,
      );

      const linesWithResolvedColors = dataToUse.map((line) => {
        drawLine(ctx, line.data, lineGenerator, line.color, 1, shiftOffset);
        return line;
      });

      drawAxes(ctx, xAxisScale, yScale, chartWidth, chartHeight, margin, resolvedChartColors);

      if (showLegend) {
        drawLegend(ctx, linesWithResolvedColors, chartWidth, resolvedChartColors);
      }

      ctx.restore();

      if (isMounted && !document.hidden) {
        renderFrameId = requestAnimationFrame(render);
      }
    };

    const startLoops = () => {
      if (!document.hidden && isMounted) {
        lastDataUpdateTime = performance.now();
        dataUpdateFrameId = requestAnimationFrame(updateDataBuffer);
        renderFrameId = requestAnimationFrame(render);
      }
    };

    const resetData = (now: number) => {
      lineDataRef.current = generateLineData(
        count,
        undefined,
        now,
        LINE_CONFIGS[0].baseValue,
        LINE_CONFIGS[0].baseRange,
      );
      areaDataRef.current = generateLineData(
        count,
        undefined,
        now,
        LINE_CONFIGS[1].baseValue,
        LINE_CONFIGS[1].baseRange,
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHidden = true;
        if (dataUpdateFrameId !== null) {
          cancelAnimationFrame(dataUpdateFrameId);
          dataUpdateFrameId = null;
        }
        if (renderFrameId !== null) {
          cancelAnimationFrame(renderFrameId);
          renderFrameId = null;
        }
      } else if (isMounted) {
        if (wasHidden) {
          wasHidden = false;
          resetData(Date.now());
        }
        if (dataUpdateFrameId === null || renderFrameId === null) {
          startLoops();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startLoops();

    return () => {
      isMounted = false;
      if (dataUpdateFrameId !== null) {
        cancelAnimationFrame(dataUpdateFrameId);
      }
      if (renderFrameId !== null) {
        cancelAnimationFrame(renderFrameId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    delay,
    count,
    width,
    height,
    variant,
    chartColors,
    showLegend,
    chartWidth,
    chartHeight,
    margin,
  ]);

  return (
    <div className={styles.container} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
    </div>
  );
};
