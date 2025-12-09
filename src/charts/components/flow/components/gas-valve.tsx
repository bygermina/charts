import React from 'react';

interface GasValveProps {
  x: number;
  y: number;
  label?: string;
  color: string;
  fontSize?: number;
}

export const GasValve: React.FC<GasValveProps> = ({ x, y, label, color, fontSize = 12 }) => {
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
          fill="rgb(203, 213, 225)"
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

