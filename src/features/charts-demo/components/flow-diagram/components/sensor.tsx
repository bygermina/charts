import { CHART_TEXT_BASE_PROPS } from '@/entities/chart';

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

const radius = 40;
const innerRadius = 35;

const SENSOR_TEXT_PROPS = {
  ...CHART_TEXT_BASE_PROPS,
  textAnchor: 'middle' as const,
};

export const Sensor = ({
  x,
  y,
  type,
  label,
  value,
  unit,
  color,
  fontSize = 12,
  pipeY,
}: SensorProps) => {
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
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill="var(--color-background-dark)"
          stroke={color}
          strokeWidth={3}
        />
        <circle
          cx={x}
          cy={y}
          r={innerRadius}
          fill="var(--color-slate-800-50)"
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
            fontWeight="700"
            {...SENSOR_TEXT_PROPS}
          >
            {value.toFixed(type === 'temperature' ? 1 : 2)}
          </text>
        )}
        <text
          x={x}
          y={y + 18}
          fill={color}
          fontSize={fontSize + 1}
          opacity={0.9}
          fontWeight="500"
          {...SENSOR_TEXT_PROPS}
        >
          {unit || label || (type === 'temperature' ? '°C' : 'bar')}
        </text>
      </g>
    );
  }

  return null;
};
