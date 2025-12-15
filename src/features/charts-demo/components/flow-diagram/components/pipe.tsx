import { memo } from 'react';

import type { Segment } from '../config/types';

interface PipeProps {
  segment: Segment;
  color: string;
  lineWidth?: number;
}

export const Pipe = memo(({ segment, color, lineWidth = 3 }: PipeProps) => {
  const x1 = segment.from.x;
  const y1 = segment.from.y;
  const x2 = segment.to.x;
  const y2 = segment.to.y;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--color-gray-500-15)"
        strokeWidth={lineWidth * 5}
        strokeLinecap="round"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={lineWidth}
        strokeLinecap="round"
      />
    </g>
  );
});
