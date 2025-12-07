import { ScatterChart, type ScatterDataPoint } from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';

const generateScatterData = (count: number): ScatterDataPoint[] => {
  const categories = ['A', 'B', 'C'];
  const data: ScatterDataPoint[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }
  return data;
};

export const ScatterChartD3 = () => {
  return (
    <ResponsiveChartWrapper>
      {({ width: chartWidth, height: chartHeight }) => (
        <ScatterChart
          data={generateScatterData(50)}
          width={chartWidth}
          height={chartHeight}
          variant={'normal'}
          xAxisLabel="X Value"
          yAxisLabel="Y Value"
          showGrid={true}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
