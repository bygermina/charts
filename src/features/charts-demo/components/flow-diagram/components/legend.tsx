import { memo } from 'react';

interface LegendEntry {
  label: string;
  color: string;
}

interface LegendProps {
  entries: LegendEntry[];
  x?: number;
  y?: number;
  fontSize?: number;
}

export const Legend = memo(({ entries, x = 30, y = 30, fontSize = 14 }: LegendProps) => {
  const lineHeight = 27;

  return (
    <g>
      {entries.map((entry, i) => {
        const currentY = y + i * lineHeight;
        return (
          <g key={entry.label}>
            <rect x={x} y={currentY - 9} width={27} height={18} rx={6} fill={entry.color} />
            <text
              x={x + 39}
              y={currentY}
              fill="var(--color-slate-300)"
              fontSize={fontSize}
              fontFamily="sans-serif"
              dominantBaseline="middle"
            >
              {entry.label}
            </text>
          </g>
        );
      })}
    </g>
  );
});
