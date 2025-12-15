import { memo, useMemo } from 'react';

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

export const StaticDiagram = memo(({ boiler, waterContainer }: StaticDiagramProps) => {
  const legendEntries = useMemo(() => getLegendEntries(), []);

  const pump1Props = useMemo(
    () => ({
      x: boiler.x - 120,
      y: boiler.y + boiler.h - 45,
      color: getParticleColor('water_cold'),
    }),
    [boiler],
  );

  const pump2Props = useMemo(
    () => ({
      x: boiler.x + boiler.w + 200,
      y: waterContainer.y,
      color: getParticleColor('water_hot'),
    }),
    [boiler, waterContainer],
  );

  const gasValve1Props = useMemo(
    () => ({
      x: boiler.x - 60,
      y: boiler.y + boiler.h + 60,
      color: getParticleColor('gas'),
    }),
    [boiler],
  );

  const gasValve2Props = useMemo(
    () => ({
      x: boiler.x + boiler.w + 150,
      y: boiler.y + boiler.h + 60,
      color: getParticleColor('air'),
    }),
    [boiler],
  );

  const sensor1Props = useMemo(
    () => ({
      x: boiler.x + boiler.w + 78,
      y: waterContainer.y - 80,
      pipeY: waterContainer.y,
    }),
    [boiler, waterContainer],
  );

  const sensor2Props = useMemo(
    () => ({
      x: waterContainer.x - 80,
      y: boiler.y + boiler.h - 120,
      pipeY: boiler.y + boiler.h - 45,
    }),
    [boiler, waterContainer],
  );

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

      <Pump {...pump1Props} rotationSpeed={360} />

      <Pump {...pump2Props} rotationSpeed={360} />

      <GasValve {...gasValve1Props} />

      <GasValve {...gasValve2Props} />

      <Sensor
        {...sensor1Props}
        type="temperature"
        label="T Out"
        value={75.5}
        unit="°C"
        color={FLOW_COLORS.sensorTemperature}
      />

      <Sensor
        {...sensor2Props}
        type="pressure"
        label="P"
        value={2.5}
        unit="bar"
        color={FLOW_COLORS.sensorPressure}
      />

      <Legend entries={legendEntries} />
    </>
  );
});
