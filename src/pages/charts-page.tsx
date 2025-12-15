import { BarChartDemo } from '@/features/charts-demo/components/bar-chart-demo/bar-chart-demo';
import { RealTimeCanvasChart } from '@/features/charts-demo/components/canvas-chart-demo';
import { BoilerFlowDiagram } from '@/features/charts-demo/components/flow-diagram/boiler-flow-diagram';
import { GaugeChartDemo } from '@/features/charts-demo/components/gauge-chart-demo/gauge-chart-demo';
import { IoTNetworkGraph } from '@/features/charts-demo/components/iot-network-graph/iot-network-graph';
import { IoTSensors } from '@/features/charts-demo/components/iot-sensors/iot-sensors';
import { MultiLineChartDemo } from '@/features/charts-demo/components/multi-line-chart-demo/multi-line-chart-demo';
import { Typography } from '@/shared/ui';
import { ChartContainer } from '@/widgets/chart-container';

import styles from './charts-page.module.scss';

export const Charts = () => {
  return (
    <section className={styles.root}>
      <div className={styles.container}>
        <Typography variant="h2" size="4xl" weight="bold" align="center" className={styles.title}>
          Real-time Analytics
        </Typography>
        <div className={styles.chartsGrid}>
          <ChartContainer
            header="d3.js Multi Line Chart (SVG)"
            subtitle="data update every second"
            className={styles.fixedScaleChart}
          >
            <MultiLineChartDemo />
          </ChartContainer>
          <ChartContainer
            header="Canvas chart 1000 points / sec"
            subtitle="data update every millisecond"
            className={styles.fixedScaleChart}
          >
            <RealTimeCanvasChart />
          </ChartContainer>
          <ChartContainer
            header="Bar Chart"
            subtitle="Hover to see the value"
            className={styles.fixedScaleChart}
          >
            <BarChartDemo />
          </ChartContainer>
          <ChartContainer
            header="Svg sensor (change value in input)"
            subtitle="I can draw any svg shape and add any animation to it"
            className={styles.sensorContainer}
          >
            <div className={styles.sensorColumnGauge}>
              <GaugeChartDemo />
            </div>
            <div className={styles.sensorColumnSensor}>
              <IoTSensors />
            </div>
          </ChartContainer>
          <ChartContainer
            header="Network Graph (d3)"
            subtitle="Drag nodes, scroll to zoom, drag background to pan. Hover to highlight connections"
          >
            <IoTNetworkGraph />
          </ChartContainer>
          <ChartContainer header="Flow Diagram" subtitle="Simulates data flow between nodes">
            <BoilerFlowDiagram />
          </ChartContainer>
        </div>
      </div>
    </section>
  );
};
