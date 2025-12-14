import { useMemo } from 'react';

import { clamp } from '@/shared/lib/utils';
import {
  GAUGE_RADIUS,
  GAUGE_START_ANGLE,
  GAUGE_END_ANGLE,
  GAUGE_TICK_COUNT,
  GAUGE_NEEDLE_LENGTH,
  GAUGE_NEEDLE_WIDTH,
  GAUGE_LABEL_OFFSET,
  GAUGE_VIEWBOX_WIDTH,
  GAUGE_VIEWBOX_HEIGHT,
  GAUGE_CENTER,
} from '../../model/constants';
import { type ChartVariant, getChartColors } from '../../model/types';

import styles from './gauge-chart.module.scss';

interface GaugeChartProps {
  value: number;
  variant?: ChartVariant;
  min?: number;
  max?: number;
}

const valueToAngle = (value: number, min: number, max: number): number => {
  const normalizedValue = (value - min) / (max - min);
  return GAUGE_START_ANGLE + normalizedValue * (GAUGE_END_ANGLE - GAUGE_START_ANGLE);
};

const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const GaugeChart = ({ value, variant = 'normal', min = 0, max = 100 }: GaugeChartProps) => {
  const chartColors = getChartColors(variant);

  const clampedValue = clamp(value, min, max);
  const needleAngle = valueToAngle(clampedValue, min, max);
  const needleRotationDegrees = radiansToDegrees(needleAngle);

  const ticks = useMemo(() => {
    const tickArray = [];
    for (let i = 0; i <= GAUGE_TICK_COUNT - 1; i++) {
      const tickValue = min + (i / (GAUGE_TICK_COUNT - 1)) * (max - min);
      const angle = valueToAngle(tickValue, min, max);
      const isMajorTick = i % (GAUGE_TICK_COUNT / 2) === 0 || i === GAUGE_TICK_COUNT - 1;

      const tickStartRadius = GAUGE_RADIUS - (isMajorTick ? GAUGE_LABEL_OFFSET : 10);
      const tickEndRadius = GAUGE_RADIUS;
      const tickStartX = Math.cos(angle) * tickStartRadius;
      const tickStartY = Math.sin(angle) * tickStartRadius;
      const tickEndX = Math.cos(angle) * tickEndRadius;
      const tickEndY = Math.sin(angle) * tickEndRadius;

      tickArray.push({
        value: tickValue,
        angle,
        isMajorTick,
        startX: tickStartX,
        startY: tickStartY,
        endX: tickEndX,
        endY: tickEndY,
      });
    }
    return tickArray;
  }, [min, max]);

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${GAUGE_VIEWBOX_WIDTH} ${GAUGE_VIEWBOX_HEIGHT}`}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${GAUGE_CENTER}, ${GAUGE_CENTER})`}>
          <path
            d="M -80 0 A 80 80 0 1 1 80 0 L 60 0 A 60 60 0 1 0 -60 0 Z"
            fill={chartColors.grid}
            opacity={0.2}
          />

          {ticks.map((tick, index) => (
            <g key={index}>
              <line
                x1={tick.startX}
                y1={tick.startY}
                x2={tick.endX}
                y2={tick.endY}
                stroke={chartColors.textSecondary}
                strokeWidth={tick.isMajorTick ? 2 : 1}
                opacity={0.6}
              />
              {tick.isMajorTick && (
                <text
                  x={Math.cos(tick.angle) * (GAUGE_RADIUS + GAUGE_LABEL_OFFSET)}
                  y={Math.sin(tick.angle) * (GAUGE_RADIUS + GAUGE_LABEL_OFFSET)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={chartColors.textSecondary}
                  fontSize="12px"
                  fontFamily="Arial, sans-serif"
                >
                  {Math.round(tick.value)}
                </text>
              )}
            </g>
          ))}

          <g transform={`rotate(${needleRotationDegrees})`}>
            <line
              x1={0}
              y1={0}
              x2={GAUGE_NEEDLE_LENGTH}
              y2={0}
              stroke={chartColors.primary}
              strokeWidth={GAUGE_NEEDLE_WIDTH}
              strokeLinecap="round"
            />
            <circle cx={0} cy={0} r={5} fill={chartColors.primary} />
          </g>

          <circle cx={0} cy={0} r={3} fill={chartColors.textSecondary} />
        </g>
      </svg>
    </div>
  );
};
