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
    <main className={styles.root}>
      <div className={styles.container}>
        <Typography variant="h2" size="4xl" weight="bold" align="center" className={styles.title}>
          Real-Time Data Visualization & Performance-Critical Frontend
        </Typography>
        <div className={styles.chartsGrid}>
          <ChartContainer
            header="d3.js Multi Line Chart"
            subtitle="Real-time chart with discrete 1-second data updates, rendered as smooth, continuous motion using transform: translate and frame-synchronized animations for stable FPS"
            className={styles.fixedScaleChart}
          >
            <MultiLineChartDemo />
          </ChartContainer>
          <ChartContainer
            header="Canvas chart 1000 points / sec"
            subtitle="High-frequency real-time Canvas visualization processing a continuous data stream with millisecond-level updates."
            className={styles.fixedScaleChart}
          >
            <RealTimeCanvasChart />
          </ChartContainer>
          <ChartContainer
            header="d3.js Bar Chart"
            subtitle="Interactive bar chart built with D3.js, providing hover-based value inspection"
            className={styles.fixedScaleChart}
          >
            <BarChartDemo />
          </ChartContainer>
          <ChartContainer
            header="Svg sensor (change value in input)"
            subtitle="Interactive SVG-based sensors with input-driven value updates, demonstrating data-driven visuals and controlled UI state"
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
            header="d3.js Network Graph"
            subtitle="Drag nodes, scroll to zoom, drag background to pan. Hover to highlight connections"
          >
            <IoTNetworkGraph />
          </ChartContainer>
          <ChartContainer
            header="Svg Flow Diagram"
            subtitle="Data flow visualization between nodes using custom SVG graphics and animations"
          >
            <BoilerFlowDiagram />
          </ChartContainer>
        </div>
      </div>
    </main>
  );
};
