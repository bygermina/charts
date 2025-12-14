interface GasValveProps {
  x: number;
  y: number;
  label?: string;
  color: string;
  fontSize?: number;
}

export const GasValve = ({ x, y, label, color, fontSize = 12 }: GasValveProps) => {
  const size = 28;
  const halfSize = size / 2;

  return (
    <g>
      <path
        d={`M ${x} ${y - halfSize} 
            L ${x + halfSize} ${y} 
            L ${x} ${y + halfSize} 
            L ${x - halfSize} ${y} 
            Z`}
        fill="transparent"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <line
        x1={x - halfSize * 0.7}
        y1={y}
        x2={x + halfSize * 0.7}
        y2={y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {label && (
        <text
          x={x + size + 8}
          y={y}
          fill="var(--color-slate-300)"
          fontSize={fontSize}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          dominantBaseline="middle"
          fontWeight="500"
        >
          {label}
        </text>
      )}
    </g>
  );
};
