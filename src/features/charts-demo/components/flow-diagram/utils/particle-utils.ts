import { clamp } from '@/shared/lib/utils';

import type { Particle, Segment } from '../config/types';
import { getBaseSpeed } from '../config/flow-config';
import { getSegmentLength, getSegmentChains, getChainLength } from './segment-utils';

const MIN_PARTICLES = 3;
const MAX_PARTICLES = 8;
const PARTICLES_PER_60PX = 1;

export const getInitialParticles = (segments: Segment[]): Particle[] => {
  const allParticles: Particle[] = [];
  const chains = getSegmentChains(segments);

  chains.forEach((typeChains, type) => {
    typeChains.forEach((chain) => {
      const totalLength = getChainLength(chain, segments);
      const baseSpeed = getBaseSpeed(type);

      const count = clamp(
        Math.round((totalLength / 60) * PARTICLES_PER_60PX),
        MIN_PARTICLES,
        MAX_PARTICLES,
      );

      for (let j = 0; j < count; j++) {
        const normalizedPosition = j / count;
        let accumulatedLength = 0;
        let targetSegmentIndex = chain[0];
        let targetT = 0;

        for (const segIndex of chain) {
          const segLength = getSegmentLength(segments[segIndex]);
          const segmentStart = accumulatedLength / totalLength;
          const segmentEnd = (accumulatedLength + segLength) / totalLength;

          if (normalizedPosition >= segmentStart && normalizedPosition <= segmentEnd) {
            targetSegmentIndex = segIndex;
            targetT = (normalizedPosition - segmentStart) / (segmentEnd - segmentStart);
            break;
          }

          accumulatedLength += segLength;
        }

        allParticles.push({
          segmentIndex: targetSegmentIndex,
          t: targetT,
          speed: baseSpeed,
        });
      }
    });
  });

  return allParticles;
};

const findSegmentByPosition = (
  chain: number[],
  segments: Segment[],
  normalizedPosition: number,
  totalLength: number,
): { segmentIndex: number; t: number } => {
  let accumulatedLength = 0;

  for (const segIdx of chain) {
    const segLength = getSegmentLength(segments[segIdx]);
    const segmentStart = accumulatedLength / totalLength;
    const segmentEnd = (accumulatedLength + segLength) / totalLength;

    if (normalizedPosition >= segmentStart && normalizedPosition <= segmentEnd) {
      const t = (normalizedPosition - segmentStart) / (segmentEnd - segmentStart);
      return { segmentIndex: segIdx, t };
    }

    accumulatedLength += segLength;
  }

  return { segmentIndex: chain[0], t: 0 };
};

export const updateParticles = (
  particles: Particle[],
  segments: Segment[],
  dt: number,
): Particle[] => {
  return particles.map((p) => {
    const segmentIndex = p.segmentIndex;
    const t = p.t;
    const seg = segments[segmentIndex];
    if (!seg) return p;

    const chains = getSegmentChains(segments);
    const typeChains = chains.get(seg.type) || [];
    const chain = typeChains.find((c) => c.includes(segmentIndex));
    if (!chain) return p;

    const totalLength = getChainLength(chain, segments);
    const BASE_SPEED_PX_PER_SEC = 60;
    const distancePx = (BASE_SPEED_PX_PER_SEC * dt) / 1000;
    const distance = distancePx / totalLength;

    const currentSegmentIndex = chain.indexOf(segmentIndex);
    let currentPosition = 0;

    for (let i = 0; i <= currentSegmentIndex; i++) {
      const segLength = getSegmentLength(segments[chain[i]]);
      if (i === currentSegmentIndex) {
        currentPosition += (t * segLength) / totalLength;
      } else {
        currentPosition += segLength / totalLength;
      }
    }

    let newPosition = (currentPosition + distance) % 1;
    if (newPosition < 0) newPosition += 1;

    const { segmentIndex: newSegmentIndex, t: newT } = findSegmentByPosition(
      chain,
      segments,
      newPosition,
      totalLength,
    );

    return {
      ...p,
      segmentIndex: newSegmentIndex,
      t: newT,
      speed: getBaseSpeed(seg.type),
    };
  });
};

