import React, { useEffect, useState } from 'react';

import { Pipe } from './components/pipe';
import { Boiler } from './components/boiler';
import { Sensor } from './components/sensor';
import { Pump } from './components/pump';
import { GasValve } from './components/gas-valve';
import { Legend } from './components/legend';
import type { Segment, Particle } from './types';
import { getParticleColor, getLegendEntries } from './flow-config';
import { getInitialParticles, updateParticles } from './particle-utils';

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

  const segments: Segment[] = [
    {
      type: 'water_cold',
      from: { x: boiler.x - 300, y: boiler.y + boiler.h - 45 },
      to: { x: waterContainer.x, y: boiler.y + boiler.h - 45 },
    },
    {
      type: 'water_cold',
      from: { x: waterContainer.x, y: boiler.y + boiler.h - 45 },
      to: { x: waterContainer.x, y: waterContainer.y + waterContainer.h },
    },
    {
      type: 'water_hot',
      from: { x: waterContainer.x + waterContainer.w, y: waterContainer.y },
      to: { x: boiler.x + boiler.w + 330, y: waterContainer.y },
    },
    {
      type: 'gas',
      from: { x: boiler.x - 300, y: boiler.y + boiler.h + 60 },
      to: { x: boiler.x + boiler.w / 2 - 35, y: boiler.y + boiler.h + 60 },
    },
    {
      type: 'gas',
      from: { x: boiler.x + boiler.w / 2 - 35, y: boiler.y + boiler.h + 60 },
      to: { x: boiler.x + boiler.w / 2 - 35, y: boiler.y + boiler.h - 5 },
    },
    {
      type: 'air',
      from: { x: boiler.x + boiler.w + 240, y: boiler.y + boiler.h + 60 },
      to: { x: boiler.x + boiler.w / 2 + 35, y: boiler.y + boiler.h + 60 },
    },
    {
      type: 'air',
      from: { x: boiler.x + boiler.w / 2 + 35, y: boiler.y + boiler.h + 60 },
      to: { x: boiler.x + boiler.w / 2 + 35, y: boiler.y + boiler.h - 5 },
    },
    {
      type: 'air',
      from: { x: boiler.x + boiler.w / 2, y: boiler.y },
      to: { x: boiler.x + boiler.w / 2, y: boiler.y - 180 },
    },
  ];

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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
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
          color="rgb(239, 68, 68)"
          pipeY={waterContainer.y}
        />

        <Sensor
          x={boiler.x + boiler.w / 2 + 40}
          y={boiler.y + 60}
          type="temperature"
          label="T Boiler"
          value={82.3}
          unit="°C"
          color="rgb(239, 68, 68)"
          pipeY={boiler.y}
        />

        <Sensor
          x={waterContainer.x - 80}
          y={boiler.y + boiler.h - 120}
          type="pressure"
          label="P"
          value={2.5}
          unit="bar"
          color="rgb(103, 232, 249)"
          pipeY={boiler.y + boiler.h - 45}
        />

        <Legend entries={legendEntries} />
      </svg>
    </div>
  );
};

export default BoilerDiagram;
