import { memo, useMemo } from 'react';

import { clamp } from '@/shared/lib/utils';

import type { Segment } from '../config/types';
import { getParticleColor, getBaseSpeed } from '../config/flow-config';
import { getSegmentChains, getChainLength } from '../utils/segment-utils';

import styles from './particles-layer-css.module.scss';

interface ParticlesLayerCssProps {
  segments: Segment[];
  particleRadius?: number;
}

const MIN_PARTICLES = 3;
const MAX_PARTICLES = 8;
const PARTICLES_PER_60PX = 1;
const BASE_SPEED_PX_PER_SEC = 750;

const getChainPathD = (chain: number[], segments: Segment[]): string => {
  const firstSeg = segments[chain[0]];
  const rest = chain.map((idx) => {
    const seg = segments[idx];
    return `L ${seg.to.x} ${seg.to.y}`;
  });
  return `M ${firstSeg.from.x} ${firstSeg.from.y} ${rest.join(' ')}`;
};

export const ParticlesLayerCss = memo(
  ({ segments, particleRadius = 5 }: ParticlesLayerCssProps) => {
    const { paths, particles } = useMemo(() => {
      const chains = getSegmentChains(segments);
      const pathsList: Array<{ id: string; d: string }> = [];
      const particlesList: Array<{
        pathId: string;
        duration: number;
        delay: number;
        color: string;
        radius: number;
        key: string;
      }> = [];

      chains.forEach((typeChains, type) => {
        typeChains.forEach((chain, chainIndex) => {
          const totalLength = getChainLength(chain, segments);
          const duration = totalLength / (BASE_SPEED_PX_PER_SEC * getBaseSpeed(type));
          const count = clamp(
            Math.round((totalLength / 60) * PARTICLES_PER_60PX),
            MIN_PARTICLES,
            MAX_PARTICLES,
          );
          const pathId = `path-${type}-${chainIndex}`;

          pathsList.push({ id: pathId, d: getChainPathD(chain, segments) });

          particlesList.push(
            ...Array.from({ length: count }, (_, j) => ({
              pathId,
              duration,
              delay: (j / count) * duration,
              color: getParticleColor(type),
              radius: type === 'gas' ? particleRadius + 1 : particleRadius,
              key: `${pathId}-${j}`,
            })),
          );
        });
      });

      return { paths: pathsList, particles: particlesList };
    }, [segments, particleRadius]);

    return (
      <g className={styles.container}>
        <defs>
          {paths.map((path) => (
            <path key={path.id} id={path.id} d={path.d} className={styles.particlePath} />
          ))}
        </defs>
        {particles.map((p) => (
          <circle key={p.key} r={p.radius} fill={p.color} className={styles.particle}>
            <animateMotion
              dur={`${p.duration}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
              fill="freeze"
            >
              <mpath href={`#${p.pathId}`} />
            </animateMotion>
          </circle>
        ))}
      </g>
    );
  },
);
