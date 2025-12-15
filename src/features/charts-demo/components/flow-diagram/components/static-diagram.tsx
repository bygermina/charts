import { Boiler } from './boiler';
import { Sensor } from './sensor';
import { Pump } from './pump';
import { GasValve } from './gas-valve';
import { Legend } from './legend';
import { getParticleColor, getLegendEntries } from '../config/flow-config';
import { FLOW_COLORS } from '../config/flow-colors';

interface StaticDiagramProps {
  boiler: { x: number; y: number; w: number; h: number };
  waterContainer: { x: number; y: number; w: number; h: number };
}

const LEGEND_ENTRIES = getLegendEntries();

export const StaticDiagram = ({ boiler, waterContainer }: StaticDiagramProps) => {
  const pump1 = {
    x: boiler.x - 120,
    y: boiler.y + boiler.h - 45,
    color: getParticleColor('water_cold'),
  };

  const pump2 = {
    x: boiler.x + boiler.w + 200,
    y: waterContainer.y,
    color: getParticleColor('water_hot'),
  };

  const gasValve1 = {
    x: boiler.x - 60,
    y: boiler.y + boiler.h + 60,
    color: getParticleColor('gas'),
  };

  const gasValve2 = {
    x: boiler.x + boiler.w + 150,
    y: boiler.y + boiler.h + 60,
    color: getParticleColor('air'),
  };

  const sensor1 = {
    x: boiler.x + boiler.w + 78,
    y: waterContainer.y - 80,
    pipeY: waterContainer.y,
  };

  const sensor2 = {
    x: waterContainer.x - 80,
    y: boiler.y + boiler.h - 120,
    pipeY: boiler.y + boiler.h - 45,
  };

  return (
    <>
      <Boiler
        x={boiler.x}
        y={boiler.y}
        width={boiler.w}
        height={boiler.h}
        waterContainerX={waterContainer.x}
        waterContainerY={waterContainer.y}
        waterContainerWidth={waterContainer.w}
        waterContainerHeight={waterContainer.h}
      />

      <Pump {...pump1} rotationSpeed={360} />

      <Pump {...pump2} rotationSpeed={360} />

      <GasValve {...gasValve1} />

      <GasValve {...gasValve2} />

      <Sensor
        {...sensor1}
        type="temperature"
        label="T Out"
        value={75.5}
        unit="°C"
        color={FLOW_COLORS.sensorTemperature}
      />

      <Sensor
        {...sensor2}
        type="pressure"
        label="P"
        value={2.5}
        unit="bar"
        color={FLOW_COLORS.sensorPressure}
      />

      <Legend entries={LEGEND_ENTRIES} />
    </>
  );
};
