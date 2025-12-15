import { clamp } from '@/shared/lib/utils';

import { CHART_TEXT_BASE_PROPS, type ChartVariant, getChartColors } from '../../model/types';

import styles from './iot-sensor.module.scss';

interface IoTSensorProps {
  value: number;
  label: string;
  unit?: string;
  variant?: ChartVariant;
  min?: number;
  max?: number;
  scale?: number;
}

export const IoTSensor = ({
  value,
  label,
  unit = '',
  variant = 'normal',
  min = 0,
  max = 100,
  scale = 0.7,
}: IoTSensorProps) => {
  const chartColors = getChartColors(variant);

  const clampedValue = clamp(value, min, max);
  const normalizedValue = (clampedValue - min) / (max - min);
  const displayValue = clampedValue.toFixed(1);

  let statusColor = chartColors.tertiary;
  if (normalizedValue < 0.33) statusColor = chartColors.primary;
  else if (normalizedValue < 0.66) statusColor = chartColors.secondary;

  const padding = 5;
  const viewBoxX = -60 * scale - padding;
  const viewBoxY = -50 * scale - padding;
  const viewBoxWidth = 120 * scale + padding * 2;
  const viewBoxHeight = 110 * scale + padding * 2;

  return (
    <div className={styles.container}>
      <svg
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        className={styles.svg}
      >
        <g>
          <rect
            x={-60 * scale}
            y={-50 * scale}
            width={120 * scale}
            height={100 * scale}
            rx={8 * scale}
            fill="var(--color-slate-700)"
            stroke="var(--color-slate-600)"
            strokeWidth={1 * scale}
          />
          <rect
            x={-55 * scale}
            y={-45 * scale}
            width={110 * scale}
            height={90 * scale}
            rx={6 * scale}
            fill="var(--color-slate-800)"
            stroke="var(--color-slate-700)"
            strokeWidth={1 * scale}
          />
          <rect
            x={-50 * scale}
            y={-40 * scale}
            width={100 * scale}
            height={70 * scale}
            rx={5 * scale}
            fill="var(--color-slate-900)"
            stroke="var(--color-slate-800)"
            strokeWidth={1 * scale}
          />
          <text
            x={0}
            y={-8 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={statusColor}
            fontSize={`${26 * scale}px`}
            fontFamily="'Courier New', monospace"
            fontWeight="bold"
          >
            {displayValue}
          </text>
          <text
            x={0}
            y={12 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-slate-400)"
            fontSize={`${11 * scale}px`}
            fontFamily="'Courier New', monospace"
          >
            {unit}
          </text>
          <rect
            x={-45 * scale}
            y={20 * scale}
            width={90 * scale}
            height={5 * scale}
            rx={2.5 * scale}
            fill="var(--color-slate-800)"
            stroke="var(--color-slate-700)"
            strokeWidth={0.5 * scale}
          />
          <rect
            x={-45 * scale}
            y={20 * scale}
            width={90 * scale * normalizedValue}
            height={5 * scale}
            rx={2.5 * scale}
            fill={statusColor}
          />
          <text
            x={0}
            y={60 * scale}
            textAnchor="middle"
            fill={chartColors.text}
            fontSize={`${12 * scale}px`}
            fontWeight="500"
            {...CHART_TEXT_BASE_PROPS}
          >
            {label}
          </text>
        </g>
      </svg>
    </div>
  );
};
