import { type DataPoint } from '@/components/basic/charts/types';

const maxVelocity = 5; // Maximum change per step
const velocityDecay = 0.9; // Slow down velocity over time
const noiseStrength = 8; // Maximum random deviation from trend
const valueSpreadMargin = maxVelocity + noiseStrength / 2; // ~9 единиц
const boundaryInfluenceZone = 30; // Зона влияния границ на направление движения
const boundaryForce = 0.3; // Сила влияния границ на velocity

export const createTrendGenerator = (
  initialValue: number = 75,
  baseRange: [number, number] = [30, 170],
) => {
  let currentValue = initialValue;
  let velocity = 0; // Rate of change per update - каждый генератор имеет свою velocity

  const [min, max] = baseRange;
  const expandedMin = min - valueSpreadMargin;
  const expandedMax = max + valueSpreadMargin;

  return (): number => {
    velocity *= velocityDecay;

    const randomForce = (Math.random() - 0.5) * 0.5;
    velocity += randomForce;

    if (currentValue > expandedMax - boundaryInfluenceZone) {
      const distance = expandedMax - currentValue;
      const influence = (1 - distance / boundaryInfluenceZone) * boundaryForce;
      velocity -= influence * maxVelocity;
    }

    if (currentValue < expandedMin + boundaryInfluenceZone) {
      const distance = currentValue - expandedMin;
      const influence = (1 - distance / boundaryInfluenceZone) * boundaryForce;
      velocity += influence * maxVelocity;
    }

    velocity = Math.max(-maxVelocity, Math.min(maxVelocity, velocity));

    currentValue += velocity;

    const noise = (Math.random() - 0.5) * noiseStrength;
    currentValue += noise;

    currentValue = Math.max(expandedMin, Math.min(expandedMax, currentValue));

    return currentValue;
  };
};

export const generateLineData = (
  count: number,
  startTime?: number,
  endTime?: number,
  baseValue: number = 75,
  baseRange: [number, number] = [30, 170],
): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = endTime ?? Date.now();
  const start = startTime ?? now - (count - 1) * 1000;
  const timeRange = now - start;
  const interval = timeRange / (count - 1);

  const generateValue = createTrendGenerator(baseValue, baseRange);

  for (let i = 0; i < count; i++) {
    data.push({
      time: start + i * interval,
      value: generateValue(),
    });
  }

  return data;
};
