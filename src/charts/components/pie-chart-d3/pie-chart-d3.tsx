import { PieChart, type PieDataPoint } from '@/components/basic/charts';
import { ResponsiveChartWrapper } from '@/components/basic/charts/utils/responsive-chart-wrapper';

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
    <ResponsiveChartWrapper>
      {({ width: chartWidth, height: chartHeight }) => (
        <PieChart
          data={generatePieData()}
          width={chartWidth}
          height={chartHeight}
          variant={'normal'}
          showLabels={true}
          showLegend={true}
        />
      )}
    </ResponsiveChartWrapper>
  );
};
