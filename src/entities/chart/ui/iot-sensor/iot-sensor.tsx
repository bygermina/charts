import { clamp } from '@/shared/lib/utils';

import { CHART_TEXT_BASE_PROPS, type ChartVariant, getChartColors } from '../../model/types';

import styles from './iot-sensor.module.scss';

interface IoTSensorProps {
  value: number;
  unit?: string;
  variant?: ChartVariant;
  min?: number;
  max?: number;
}

const VIEWBOX_WIDTH = 140;
const VIEWBOX_HEIGHT = 130;

export const IoTSensor = ({
  value,
  unit = '',
  variant = 'normal',
  min = 0,
  max = 100,
}: IoTSensorProps) => {
  const chartColors = getChartColors(variant);

  const clampedValue = clamp(value, min, max);
  const normalizedValue = (clampedValue - min) / (max - min);
  const displayValue = clampedValue.toFixed(1);

  let statusColor = chartColors.tertiary;
  if (normalizedValue < 0.33) statusColor = chartColors.primary;
  else if (normalizedValue < 0.66) statusColor = chartColors.secondary;

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className={styles.svg}>
        <g transform="translate(10 10)">
          <rect
            x={0}
            y={0}
            width={120}
            height={100}
            rx={8}
            fill="var(--color-slate-700)"
            stroke="var(--color-slate-600)"
            strokeWidth={1}
          />
          <rect
            x={5}
            y={5}
            width={110}
            height={90}
            rx={6}
            fill="var(--color-slate-800)"
            stroke="var(--color-slate-700)"
            strokeWidth={1}
          />
          <rect
            x={10}
            y={10}
            width={100}
            height={70}
            rx={5}
            fill="var(--color-slate-900)"
            stroke="var(--color-slate-800)"
            strokeWidth={1}
          />

          <text
            x={60}
            y={40}
            textAnchor="middle"
            fill={statusColor}
            fontSize="26px"
            fontWeight="bold"
            {...CHART_TEXT_BASE_PROPS}
          >
            {displayValue}
          </text>

          <text
            x={60}
            y={58}
            textAnchor="middle"
            fill="var(--color-slate-400)"
            fontSize="11px"
            {...CHART_TEXT_BASE_PROPS}
          >
            {unit}
          </text>

          <rect
            x={15}
            y={80}
            width={90}
            height={5}
            rx={2.5}
            fill="var(--color-slate-800)"
            stroke="var(--color-slate-700)"
            strokeWidth={0.5}
          />
          <rect x={15} y={80} width={90 * normalizedValue} height={5} rx={2.5} fill={statusColor} />
        </g>
      </svg>
    </div>
  );
};
