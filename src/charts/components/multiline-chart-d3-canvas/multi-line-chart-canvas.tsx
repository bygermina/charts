import { useMemo, useState } from 'react';

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

  const [dataBuffers, setDataBuffers] = useState<DataPoint[][]>(() =>
    LINE_CONFIGS.map((_, index) => createInitialData(count, index)),
  );

  useRealTimeDataStream({
    generators,
    delay,
    bufferSize: BUFFER_SIZE,
    initialCount: count,
    createInitialData,
    onDataUpdate: (buffers) => {
      setDataBuffers(buffers);
    },
  });

  const lines: LineSeries[] = useMemo(() => {
    if (dataBuffers.length < 2) return [];

    return [
      {
        data: dataBuffers[0] || [],
        color: chartColors.primary,
        label: LINE_CONFIGS[0].label,
      },
      {
        data: dataBuffers[1] || [],
        color: chartColors.tertiary,
        label: LINE_CONFIGS[1].label,
      },
    ];
  }, [dataBuffers, chartColors]);

  return (
    <ResponsiveChartWrapper width={width} height={height}>
      {({ width: chartWidth, height: chartHeight }) => (
        <RealTimeMultiLineChartCanvas
          lines={lines}
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
