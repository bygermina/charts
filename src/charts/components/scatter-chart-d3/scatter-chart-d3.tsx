import { ScatterChart, type ScatterDataPoint } from '@/components/basic/charts';

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
    <ScatterChart
      data={generateScatterData(50)}
      width={600}
      height={250}
      variant={'normal'}
      xAxisLabel="X Value"
      yAxisLabel="Y Value"
      showGrid={true}
    />
  );
};
