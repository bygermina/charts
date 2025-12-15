import { FLOW_TEXT_BASE_PROPS } from '../config/text-props';

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

const lineHeight = 27;

export const Legend = ({ entries, x = 30, y = 30, fontSize = 14 }: LegendProps) => {
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
              {...FLOW_TEXT_BASE_PROPS}
            >
              {entry.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
