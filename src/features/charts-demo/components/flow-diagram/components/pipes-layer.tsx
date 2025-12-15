import { memo, useMemo } from 'react';

import { Pipe } from './pipe';
import { getParticleColor } from '../config/flow-config';
import type { Segment } from '../config/types';

interface PipesLayerProps {
  segments: Segment[];
}

export const PipesLayer = memo(({ segments }: PipesLayerProps) => {
  const pipes = useMemo(
    () =>
      segments.map((seg, segIndex) => (
        <Pipe key={`pipe-${segIndex}`} segment={seg} color={getParticleColor(seg.type)} />
      )),
    [segments],
  );

  return <>{pipes}</>;
});

