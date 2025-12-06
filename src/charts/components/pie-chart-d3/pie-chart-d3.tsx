import { PieChart, type PieDataPoint } from '@/components/basic/charts';

const generatePieData = (): PieDataPoint[] => {
  return [
    { label: 'Category A', value: Math.random() * 30 + 20 },
    { label: 'Category B', value: Math.random() * 30 + 20 },
    { label: 'Category C', value: Math.random() * 30 + 20 },
    { label: 'Category D', value: Math.random() * 30 + 20 },
    { label: 'Category E', value: Math.random() * 30 + 20 },
  ];
};

export const PieChartD3 = () => {
  return (
    <PieChart
      data={generatePieData()}
      width={600}
      height={250}
      variant={'normal'}
      showLabels={true}
      showLegend={true}
    />
  );
};
