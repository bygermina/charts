import React, { useEffect, useState } from 'react';

import { Pipe } from './components/pipe';
import { Boiler } from './components/boiler';
import { Sensor } from './components/sensor';
import { Pump } from './components/pump';
import { GasValve } from './components/gas-valve';
import { Legend } from './components/legend';
import type { Particle } from './types';
import { getParticleColor, getLegendEntries } from './flow-config';
import { getInitialParticles, updateParticles } from './particle-utils';
import { createFlowSegments } from './flow-config-segments';
import { FLOW_COLORS } from './flow-colors';
import styles from './flow.module.scss';

type BoilerDiagramProps = {
  width?: number;
  height?: number;
};

const BoilerDiagram: React.FC<BoilerDiagramProps> = ({ width = 900, height = 500 }) => {
  const boiler = {
    x: width / 2 - 120,
    y: height / 2 - 150,
    w: 240,
    h: 300,
  };

  const waterContainer = {
    x: boiler.x + 30,
    y: boiler.y + 30,
    w: boiler.w - 60,
    h: boiler.h - 60,
  };

  const segments = createFlowSegments(boiler, waterContainer);

  const [particles, setParticles] = useState<Particle[]>(() => getInitialParticles(segments));

  useEffect(() => {
    let lastTime = performance.now();
    let animationId: number;

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      setParticles((prevParticles) => updateParticles(prevParticles, segments, dt));

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const legendEntries = getLegendEntries();

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
      >
        {segments.map((seg, segIndex) => {
          const segmentParticles = particles
            .filter((p) => p.segmentIndex === segIndex && p.t >= 0 && p.t <= 1)
            .map((p) => ({ t: p.t }));

          return (
            <Pipe
              key={`pipe-${segIndex}`}
              segment={seg}
              color={getParticleColor(seg.type)}
              particles={segmentParticles}
            />
          );
        })}

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

        <Pump
          x={boiler.x - 120}
          y={boiler.y + boiler.h - 45}
          color={getParticleColor('water_cold')}
          rotationSpeed={360}
        />

        <Pump
          x={boiler.x + boiler.w + 200}
          y={waterContainer.y}
          color={getParticleColor('water_hot')}
          rotationSpeed={360}
        />

        <GasValve x={boiler.x - 60} y={boiler.y + boiler.h + 60} color={getParticleColor('gas')} />

        <GasValve
          x={boiler.x + boiler.w + 150}
          y={boiler.y + boiler.h + 60}
          color={getParticleColor('air')}
        />

        <Sensor
          x={boiler.x + boiler.w + 78}
          y={waterContainer.y - 80}
          type="temperature"
          label="T Out"
          value={75.5}
          unit="°C"
          color={FLOW_COLORS.sensorTemperature}
          pipeY={waterContainer.y}
        />

        <Sensor
          x={waterContainer.x - 80}
          y={boiler.y + boiler.h - 120}
          type="pressure"
          label="P"
          value={2.5}
          unit="bar"
          color={FLOW_COLORS.sensorPressure}
          pipeY={boiler.y + boiler.h - 45}
        />

        <Legend entries={legendEntries} />
      </svg>
    </div>
  );
};

export default BoilerDiagram;
