import { useEffect, useMemo, useRef } from 'react';

import { type ChartVariant, getChartColors, type DataPoint } from '@/components/basic/charts';
import { type LineSeries } from '@/components/basic/charts/multi-line-chart/index';
import { RealTimeMultiLineChartCanvas } from '@/components/basic/charts/real-time-multi-line-chart-canvas';
import { useRealTimeDataStream } from '@/components/basic/charts/use-real-time-data-stream';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';

import { createTrendGenerator, generateLineData } from './data-generators';

interface MultiLineChartCanvasProps {
  delay?: number;
  count?: number;
  variant?: ChartVariant;
  showLegend?: boolean;
  width?: number;
  height?: number;
}

const BUFFER_SIZE = 200;

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

export const MultiLineChartD3Canvas = ({
  delay = 12,
  count = 200,
  variant = 'normal',
  showLegend = true,
  width,
  height,
}: MultiLineChartCanvasProps) => {
  const chartColors = useMemo(() => getChartColors(variant), [variant]);

  const generators = useMemo(
    () => LINE_CONFIGS.map((config) => createTrendGenerator(config.baseValue, config.baseRange)),
    [],
  );

  const createInitialData = (initialCount: number, generatorIndex: number): DataPoint[] => {
    const config = LINE_CONFIGS[generatorIndex];
    if (!config) return [];

    return generateLineData(initialCount, undefined, undefined, config.baseValue, config.baseRange);
  };

  const dataBuffersRef = useRef<DataPoint[][]>(
    LINE_CONFIGS.map((_, index) => createInitialData(count, index)),
  );

  const linesRef = useRef<LineSeries[]>([]);

  const chartColorsRef = useRef(chartColors);

  // Переиспользуем объекты LineSeries
  const linesCacheRef = useRef<LineSeries[]>([
    {
      data: [],
      color: '',
      label: '',
    },
    {
      data: [],
      color: '',
      label: '',
    },
  ]);

  const updateLines = (buffers: DataPoint[][]) => {
    if (buffers.length < 2) {
      linesRef.current = [];
      return;
    }

    const cache = linesCacheRef.current;
    const colors = chartColorsRef.current;
    cache[0].data = buffers[0];
    cache[0].color = colors.primary;
    cache[0].label = LINE_CONFIGS[0].label;
    cache[1].data = buffers[1];
    cache[1].color = colors.tertiary;
    cache[1].label = LINE_CONFIGS[1].label;
    linesRef.current = cache;
  };

  const onDataUpdate = (buffers: DataPoint[][]) => {
    dataBuffersRef.current = buffers;
    updateLines(buffers);
  };

  useEffect(() => {
    chartColorsRef.current = chartColors;
    updateLines(dataBuffersRef.current);
  }, [chartColors]);

  useRealTimeDataStream({
    generators,
    delay,
    bufferSize: BUFFER_SIZE,
    initialCount: count,
    createInitialData,
    onDataUpdate,
  });

  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }) => (
        <RealTimeMultiLineChartCanvas
          linesRef={linesRef}
          width={chartWidth}
          height={chartHeight}
          variant={variant}
          showLegend={showLegend}
          yDomain={[0, 200]}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
