import { useMemo } from 'react';

import { type ChartVariant, getChartColors } from '../types';

import styles from './gauge-chart.module.scss';

interface GaugeChartProps {
  value: number;
  variant?: ChartVariant;
  min?: number;
  max?: number;
}

const GAUGE_RADIUS = 80;
const GAUGE_START_ANGLE = -Math.PI;
const GAUGE_END_ANGLE = 0;
const TICK_COUNT = 11;
const NEEDLE_LENGTH = 60;
const NEEDLE_WIDTH = 3;
const LABEL_OFFSET = 15;
const PADDING = 30;
const VIEWBOX_WIDTH = (GAUGE_RADIUS + LABEL_OFFSET + PADDING) * 2;
const VIEWBOX_HEIGHT = VIEWBOX_WIDTH * 0.7;
const CENTER = VIEWBOX_WIDTH / 2;

const valueToAngle = (value: number, min: number, max: number): number => {
  const normalizedValue = (value - min) / (max - min);
  return GAUGE_START_ANGLE + normalizedValue * (GAUGE_END_ANGLE - GAUGE_START_ANGLE);
};

const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const GaugeChart = ({ value, variant = 'normal', min = 0, max = 100 }: GaugeChartProps) => {
  const chartColors = getChartColors(variant);

  const clampedValue = Math.max(min, Math.min(max, value));
  const needleAngle = valueToAngle(clampedValue, min, max);
  const needleRotationDegrees = radiansToDegrees(needleAngle);

  const ticks = useMemo(() => {
    const tickArray = [];
    for (let i = 0; i <= TICK_COUNT - 1; i++) {
      const tickValue = min + (i / (TICK_COUNT - 1)) * (max - min);
      const angle = valueToAngle(tickValue, min, max);
      const isMajorTick = i % (TICK_COUNT / 2) === 0 || i === TICK_COUNT - 1;

      const tickStartRadius = GAUGE_RADIUS - (isMajorTick ? 15 : 10);
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
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        <g transform={`translate(${CENTER}, ${CENTER})`}>
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
                  x={Math.cos(tick.angle) * (GAUGE_RADIUS + 15)}
                  y={Math.sin(tick.angle) * (GAUGE_RADIUS + 15)}
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
              x2={NEEDLE_LENGTH}
              y2={0}
              stroke={chartColors.primary}
              strokeWidth={NEEDLE_WIDTH}
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
