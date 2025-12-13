import type { Segment } from '../types';

interface PipeProps {
  segment: Segment;
  color: string;
  lineWidth?: number;
  particles?: Array<{ t: number }>;
  particleRadius?: number;
}

export const Pipe = ({
  segment,
  color,
  lineWidth = 3,
  particles = [],
  particleRadius = 5,
}: PipeProps) => {
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
        stroke="rgba(128, 128, 128, 0.15)"
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
      {particles.map((p, index) => {
        if (p.t < 0 || p.t > 1) return null;

        const x = x1 + (x2 - x1) * p.t;
        const y = y1 + (y2 - y1) * p.t;
        const radius = segment.type === 'gas' ? particleRadius + 1 : particleRadius;

        return (
          <circle key={`particle-${index}`} cx={x} cy={y} r={radius} fill={color} opacity={0.8} />
        );
      })}
    </g>
  );
};
