import type { Particle, Segment } from './types';
import { getBaseSpeed } from './flow-config';
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

      const count = Math.max(
        MIN_PARTICLES,
        Math.min(MAX_PARTICLES, Math.round((totalLength / 60) * PARTICLES_PER_60PX)),
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

    const totalLengthPx = getChainLength(chain, segments);

    const BASE_SPEED_PX_PER_SEC = 60;
    const speedPxPerSec = BASE_SPEED_PX_PER_SEC;

    const distancePx = (speedPxPerSec * dt) / 1000;

    const distance = distancePx / totalLengthPx;
    let currentPosition = 0;

    for (let i = 0; i < chain.length; i++) {
      if (chain[i] === segmentIndex) {
        const segLength = getSegmentLength(segments[chain[i]]);
        const totalLength = getChainLength(chain, segments);

        currentPosition = t * (segLength / totalLength);

        for (let j = 0; j < i; j++) {
          currentPosition += getSegmentLength(segments[chain[j]]) / totalLength;
        }
        break;
      }
    }

    let newPosition = currentPosition + distance;

    if (newPosition >= 1) {
      newPosition = newPosition % 1;
    }
    let accumulatedLength = 0;
    let newSegmentIndex = chain[0];
    let newT = 0;
    const totalLength = getChainLength(chain, segments);

    for (const segIdx of chain) {
      const segLength = getSegmentLength(segments[segIdx]);
      const segmentStart = accumulatedLength / totalLength;
      const segmentEnd = (accumulatedLength + segLength) / totalLength;

      if (newPosition >= segmentStart && newPosition <= segmentEnd) {
        newSegmentIndex = segIdx;
        newT = (newPosition - segmentStart) / (segmentEnd - segmentStart);
        break;
      }

      accumulatedLength += segLength;
    }

    return {
      ...p,
      segmentIndex: newSegmentIndex,
      t: newT,
      speed: getBaseSpeed(seg.type),
    };
  });
};
