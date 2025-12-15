import { memo } from 'react';

interface BoilerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  waterContainerX: number;
  waterContainerY: number;
  waterContainerWidth: number;
  waterContainerHeight: number;
}

export const Boiler = memo(
  ({
    x,
    y,
    width,
    height,
    waterContainerX,
    waterContainerY,
    waterContainerWidth,
    waterContainerHeight,
  }: BoilerProps) => {
    const centerX = x + width / 2;
    const flameY = y + height - 5;
    const gradientId = `water-gradient-${x}-${y}`;

    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--color-blue-400)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-red-500)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={18}
          fill="var(--color-slate-800)"
          stroke="var(--color-slate-600)"
          strokeWidth={2}
        />
        <rect
          x={waterContainerX}
          y={waterContainerY}
          width={waterContainerWidth}
          height={waterContainerHeight}
          rx={12}
          fill={`url(#${gradientId})`}
          stroke="var(--color-cyan-400-50)"
          strokeWidth={2}
        />
        <g transform={`translate(${centerX - 35}, ${flameY}) scale(1.2)`}>
          <path
            d="M 0 0 Q -3.6 -10.5 -6 -9 Q -4.8 -6 0 -3 Q 4.8 -6 6 -9 Q 3.6 -10.5 0 0 Z"
            fill="var(--color-red-500-90)"
          />
          <path
            d="M 0 -2.4 Q -2.4 -6 -3.6 -7.2 Q -3 -9 0 -10.5 Q 3 -9 3.6 -7.2 Q 2.4 -6 0 -2.4 Z"
            fill="var(--color-orange-600-95)"
          />
        </g>
        <g transform={`translate(${centerX}, ${flameY}) scale(1.2)`}>
          <path
            d="M 0 0 Q -3.6 -10.5 -6 -9 Q -4.8 -6 0 -3 Q 4.8 -6 6 -9 Q 3.6 -10.5 0 0 Z"
            fill="var(--color-red-500-90)"
          />
          <path
            d="M 0 -2.4 Q -2.4 -6 -3.6 -7.2 Q -3 -9 0 -10.5 Q 3 -9 3.6 -7.2 Q 2.4 -6 0 -2.4 Z"
            fill="var(--color-orange-600-95)"
          />
        </g>
        <g transform={`translate(${centerX + 35}, ${flameY}) scale(1.2)`}>
          <path
            d="M 0 0 Q -3.6 -10.5 -6 -9 Q -4.8 -6 0 -3 Q 4.8 -6 6 -9 Q 3.6 -10.5 0 0 Z"
            fill="var(--color-red-500-90)"
          />
          <path
            d="M 0 -2.4 Q -2.4 -6 -3.6 -7.2 Q -3 -9 0 -10.5 Q 3 -9 3.6 -7.2 Q 2.4 -6 0 -2.4 Z"
            fill="var(--color-orange-600-95)"
          />
        </g>
      </g>
    );
  },
);
