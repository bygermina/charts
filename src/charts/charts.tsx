import { Typography } from '@/components/basic/typography/typography';
import { ChartContainer } from '@/components/basic/charts';

import { MultiLineChartD3 } from './components/multiline-chart-d3/multi-line-chart';
import { BarChartD3 } from './components/bar-chart-d3/bar-chart-d3';
import { PieChartD3 } from './components/pie-chart-d3/pie-chart-d3';
import { ScatterChartD3 } from './components/scatter-chart-d3/scatter-chart-d3';
import { GaugeChartD3 } from './components/gauge-chart-d3/gauge-chart-d3';
import RealTimeChart from './components/canvas-canvas/Canvas';

import styles from './charts.module.scss';

export const Charts = () => {
  return (
    <section className={styles.root}>
      <div className={styles.container}>
        <Typography variant="h2" size="4xl" weight="bold" align="center" className={styles.title}>
          Real-time Analytics
        </Typography>
        <div className={styles.chartsGrid}>
          <ChartContainer header="d3.js Multi Line Chart (SVG)" subtitle="data update every second">
            <MultiLineChartD3 />
          </ChartContainer>
          <ChartContainer
            header="Multi Line Chart (Canvas) 1000 points / sec"
            subtitle="data update every second"
          >
            <RealTimeChart />
          </ChartContainer>
          <ChartContainer header="Weekly Statistics" subtitle="Daily breakdown">
            <BarChartD3 />
          </ChartContainer>
          <ChartContainer header="Category Distribution" subtitle="Percentage breakdown">
            <PieChartD3 />
          </ChartContainer>
          <ChartContainer header="Distribution" subtitle="Data correlation">
            <ScatterChartD3 />
          </ChartContainer>
          <ChartContainer header="Gauge Meter" subtitle="Interactive gauge with input">
            <GaugeChartD3 />
          </ChartContainer>
        </div>
      </div>
    </section>
  );
};
