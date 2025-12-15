import { memo } from 'react';
import { FLOW_TEXT_BASE_PROPS } from '../config/text-props';

interface GasValveProps {
  x: number;
  y: number;
  label?: string;
  color: string;
  fontSize?: number;
}

const GAS_VALVE_TEXT_PROPS = {
  ...FLOW_TEXT_BASE_PROPS,
  fontWeight: '500' as const,
};

export const GasValve = memo(({ x, y, label, color, fontSize = 12 }: GasValveProps) => (
  <g>
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M 0 -14 L 14 0 L 0 14 L -14 0 Z"
        fill="transparent"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <line x1="-9.8" y1="0" x2="9.8" y2="0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
    {label && (
      <text
        x={x + 36}
        y={y}
        fill="var(--color-slate-300)"
        fontSize={fontSize}
        {...GAS_VALVE_TEXT_PROPS}
      >
        {label}
      </text>
    )}
  </g>
));
