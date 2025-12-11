import React from 'react';

type SensorType = 'temperature' | 'pressure';

interface SensorProps {
  x: number;
  y: number;
  type: SensorType;
  label?: string;
  value?: number;
  unit?: string;
  color: string;
  fontSize?: number;
  pipeY?: number;
}

export const Sensor: React.FC<SensorProps> = ({
  x,
  y,
  type,
  label,
  value,
  unit,
  color,
  fontSize = 12,
  pipeY,
}) => {
  const radius = 40;
  const innerRadius = radius - 5;

  if (type === 'temperature' || type === 'pressure') {
    return (
      <g>
        {pipeY !== undefined && (
          <line
            x1={x}
            y1={pipeY}
            x2={x}
            y2={y - radius}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="4,4"
            opacity={0.6}
          />
        )}
        <circle cx={x} cy={y} r={radius} fill="rgb(16, 19, 24)" stroke={color} strokeWidth={3} />
        <circle
          cx={x}
          cy={y}
          r={innerRadius}
          fill="rgba(30, 41, 59)"
          stroke={color}
          strokeWidth={1}
          opacity={0.5}
        />
        {value !== undefined && (
          <text
            x={x}
            y={y - 6}
            fill={color}
            fontSize={fontSize + 8}
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            dominantBaseline="middle"
            textAnchor="middle"
            fontWeight="700"
          >
            {value.toFixed(type === 'temperature' ? 1 : 2)}
          </text>
        )}
        <text
          x={x}
          y={y + 18}
          fill={color}
          fontSize={fontSize + 1}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          dominantBaseline="middle"
          textAnchor="middle"
          opacity={0.9}
          fontWeight="500"
        >
          {unit || label || (type === 'temperature' ? '°C' : 'bar')}
        </text>
        {label && !value && (
          <text
            x={x + radius + 8}
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
  }

  return null;
};
