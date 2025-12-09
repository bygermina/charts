import React from 'react';

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

export const Legend: React.FC<LegendProps> = ({ entries, x = 30, y = 30, fontSize = 14 }) => {
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
              fill="rgb(203, 213, 225)"
              fontSize={fontSize}
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              dominantBaseline="middle"
            >
              {entry.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

