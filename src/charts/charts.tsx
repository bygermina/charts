import { Typography } from '@/components/basic/typography/typography';
import { ChartContainer } from '@/components/basic/charts';

import { MultiLineChartD3 } from './components/multiline-chart-d3/multi-line-chart';
import { BarChartD3 } from './components/bar-chart-d3/bar-chart-d3';
import { GaugeChartD3 } from './components/gauge-chart-d3/gauge-chart-d3';
import { IoTSensors } from './components/iot-sensors/iot-sensors';
import { IoTNetworkGraph } from './components/iot-network-graph/iot-network-graph';
import RealTimeChart from './components/canvas-canvas/canvas';

import styles from './charts.module.scss';
import BoilerDiagram from './components/flow/flow';

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
            header="Canvas chart 1000 points / sec"
            subtitle="data update every millisecond"
          >
            <RealTimeChart />
          </ChartContainer>
          <ChartContainer header="Weekly Statistics" subtitle="Daily breakdown">
            <BarChartD3 />
          </ChartContainer>
          <ChartContainer
            header="Svg sensor (change value in input)"
            subtitle="I can draw any svg shape and add any animation to it"
            className={styles.sensorContainer}
          >
            <GaugeChartD3 />
            <IoTSensors />
          </ChartContainer>
          <ChartContainer
            header="IoT Network Graph"
            subtitle="Drag nodes, scroll to zoom, drag background to pan. Hover to highlight connections"
          >
            <IoTNetworkGraph />
          </ChartContainer>
          <ChartContainer header="Flow Diagram" subtitle="Simulates data flow between nodes">
            <BoilerDiagram />
          </ChartContainer>
        </div>
      </div>
    </section>
  );
};
