import { clamp } from './math-utils';

interface DataPoint {
  time: number;
  value: number;
}

interface GenerateDataConfig {
  count: number;
  startTime?: number;
  endTime?: number;
  valueGenerator?: () => number;
}

export const generateTimeSeriesData = ({
  count,
  startTime,
  endTime,
  valueGenerator = () => Math.random() * 100 + 50,
}: GenerateDataConfig): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = endTime ?? Date.now();
  const start = startTime ?? now - (count - 1) * 1000;
  const timeRange = now - start;
  const interval = timeRange / (count - 1);

  for (let i = 0; i < count; i++) {
    data.push({
      time: start + i * interval,
      value: valueGenerator(),
    });
  }

  return data;
};

const maxVelocity = 5;
const velocityDecay = 0.9;
const noiseStrength = 8;
const valueSpreadMargin = maxVelocity + noiseStrength / 2;
const boundaryInfluenceZone = 30;
const boundaryForce = 0.3;

export const createTrendGenerator = (
  initialValue: number = 75,
  baseRange: [number, number] = [30, 170],
) => {
  let currentValue = initialValue;
  let velocity = 0;

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

    velocity = clamp(velocity, -maxVelocity, maxVelocity);

    currentValue += velocity;

    const noise = (Math.random() - 0.5) * noiseStrength;
    currentValue += noise;

    currentValue = clamp(currentValue, expandedMin, expandedMax);

    return currentValue;
  };
};
