import type { FlowType, Segment } from '../config/types';

export const getSegmentLength = (seg: Segment): number => {
  return Math.sqrt(Math.pow(seg.to.x - seg.from.x, 2) + Math.pow(seg.to.y - seg.from.y, 2));
};

export const getChainPathD = (chain: number[], segments: Segment[]): string => {
  const firstSeg = segments[chain[0]];
  const rest = chain.map((idx) => {
    const seg = segments[idx];
    return `L ${seg.to.x} ${seg.to.y}`;
  });

  return `M ${firstSeg.from.x} ${firstSeg.from.y} ${rest.join(' ')}`;
};

export const getSegmentChains = (segments: Segment[]): Map<FlowType, number[][]> => {
  const chains = new Map<FlowType, number[][]>();
  const processed = new Set<number>();

  segments.forEach((seg, startIndex) => {
    if (processed.has(startIndex)) return;

    const chain: number[] = [startIndex];
    processed.add(startIndex);

    let currentIndex = startIndex;
    while (true) {
      const currentSeg = segments[currentIndex];
      const nextIndex = segments.findIndex(
        (s, i) =>
          !processed.has(i) &&
          i !== currentIndex &&
          s.type === currentSeg.type &&
          Math.abs(s.from.x - currentSeg.to.x) < 0.5 &&
          Math.abs(s.from.y - currentSeg.to.y) < 0.5,
      );

      if (nextIndex === -1) break;

      chain.push(nextIndex);
      processed.add(nextIndex);
      currentIndex = nextIndex;
    }

    const typeChains = chains.get(seg.type) || [];
    typeChains.push(chain);
    chains.set(seg.type, typeChains);
  });

  return chains;
};

export const getChainLength = (chain: number[], segments: Segment[]): number => {
  return chain.reduce((sum, segIndex) => sum + getSegmentLength(segments[segIndex]), 0);
};
