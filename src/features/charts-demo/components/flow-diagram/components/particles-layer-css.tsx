import { clamp } from '@/shared/lib/utils';

import type { FlowType, Segment } from '../config/types';
import { getParticleColor, getBaseSpeed } from '../config/flow-config';
import { getSegmentChains, getChainLength, getChainPathD } from '../utils/segment-utils';

import styles from './particles-layer-css.module.scss';

interface ParticlesLayerCssProps {
  segments: Segment[];
  particleRadius?: number;
}

const MIN_PARTICLES = 3;
const MAX_PARTICLES = 8;
const PARTICLES_PER_60PX = 1;
const BASE_SPEED_PX_PER_SEC = 750;

interface ParticlePath {
  id: string;
  d: string;
}

interface Particle {
  pathId: string;
  duration: number;
  delay: number;
  color: string;
  radius: number;
  key: string;
}

const calculateChainDuration = (totalLength: number, type: FlowType): number => {
  return totalLength / (BASE_SPEED_PX_PER_SEC * getBaseSpeed(type));
};

const calculateParticleCount = (totalLength: number): number => {
  return clamp(Math.round((totalLength / 60) * PARTICLES_PER_60PX), MIN_PARTICLES, MAX_PARTICLES);
};

const createParticlePathId = (type: FlowType, chainIndex: number): string => {
  return `path-${type}-${chainIndex}`;
};

const createParticlesForPath = ({
  pathId,
  count,
  duration,
  type,
  particleRadius,
}: {
  pathId: string;
  count: number;
  duration: number;
  type: FlowType;
  particleRadius: number;
}): Particle[] => {
  return Array.from({ length: count }, (_, index) => ({
    pathId,
    duration,
    delay: (index / count) * duration,
    color: getParticleColor(type),
    radius: particleRadius,
    key: `${pathId}-${index}`,
  }));
};

const createChainParticles = ({
  chain,
  type,
  chainIndex,
  segments,
  particleRadius,
}: {
  chain: number[];
  type: FlowType;
  chainIndex: number;
  segments: Segment[];
  particleRadius: number;
}): { path: ParticlePath; particles: Particle[] } => {
  const totalLength = getChainLength(chain, segments);
  const duration = calculateChainDuration(totalLength, type);
  const count = calculateParticleCount(totalLength);
  const pathId = createParticlePathId(type, chainIndex);

  const path: ParticlePath = { id: pathId, d: getChainPathD(chain, segments) };
  const particles = createParticlesForPath({
    pathId,
    count,
    duration,
    type,
    particleRadius,
  });

  return { path, particles };
};

const buildPathsAndParticles = ({
  segments,
  particleRadius,
}: {
  segments: Segment[];
  particleRadius: number;
}): { paths: ParticlePath[]; particles: Particle[] } => {
  const chains = getSegmentChains(segments);
  const paths: ParticlePath[] = [];
  const particles: Particle[] = [];

  chains.forEach((typeChains, type) => {
    typeChains.forEach((chain, chainIndex) => {
      const { path, particles: chainParticles } = createChainParticles({
        chain,
        type,
        chainIndex,
        segments,
        particleRadius,
      });

      paths.push(path);
      particles.push(...chainParticles);
    });
  });

  return { paths, particles };
};

export const ParticlesLayerCss = ({ segments, particleRadius = 5 }: ParticlesLayerCssProps) => {
  const { paths, particles } = buildPathsAndParticles({ segments, particleRadius });

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
};
