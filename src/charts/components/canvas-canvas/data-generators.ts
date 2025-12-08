const maxVelocity = 5;
const velocityDecay = 0.9;
const noiseStrength = 8;
const valueSpreadMargin = maxVelocity + noiseStrength / 2;
const boundaryInfluenceZone = 30; // Zone where boundaries influence movement direction
const boundaryForce = 0.3; // Force applied by boundaries to velocity

export const createTrendGenerator = (
  initialValue: number = 75,
  baseRange: [number, number] = [30, 170],
) => {
  let currentValue = initialValue;
  let velocity = 0; // Rate of change per update - each generator has its own velocity

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
