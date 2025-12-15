import { getParticleColor } from '../config/flow-config';
import type { FlowType, Segment } from '../config/types';
import { getSegmentChains, getChainPathD } from '../utils/segment-utils';

interface PipesLayerProps {
  segments: Segment[];
  lineWidth?: number;
}

export const PipesLayer = ({ segments, lineWidth = 3 }: PipesLayerProps) => {
  const chains = getSegmentChains(segments);

  const paths: Array<{ id: string; d: string; type: FlowType }> = Array.from(
    chains.entries(),
  ).flatMap(([type, typeChains]) =>
    typeChains.map((chain, chainIndex) => ({
      id: `pipe-${type}-${chainIndex}`,
      d: getChainPathD(chain, segments),
      type,
    })),
  );

  const outerWidth = lineWidth * 5;

  return (
    <>
      {paths.map((path) => (
        <g key={path.id}>
          <path
            d={path.d}
            stroke="var(--color-gray-500-15)"
            strokeWidth={outerWidth}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={path.d}
            stroke={getParticleColor(path.type)}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}
    </>
  );
};
