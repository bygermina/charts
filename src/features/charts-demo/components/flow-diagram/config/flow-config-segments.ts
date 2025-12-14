import type { Segment } from './types';

interface BoilerDimensions {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WaterContainerDimensions {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const createFlowSegments = (
  boiler: BoilerDimensions,
  waterContainer: WaterContainerDimensions,
): Segment[] => [
  {
    type: 'water_cold',
    from: { x: boiler.x - 300, y: boiler.y + boiler.h - 45 },
    to: { x: waterContainer.x, y: boiler.y + boiler.h - 45 },
  },
  {
    type: 'water_cold',
    from: { x: waterContainer.x, y: boiler.y + boiler.h - 45 },
    to: { x: waterContainer.x, y: waterContainer.y + waterContainer.h },
  },
  {
    type: 'water_hot',
    from: { x: waterContainer.x + waterContainer.w, y: waterContainer.y },
    to: { x: boiler.x + boiler.w + 330, y: waterContainer.y },
  },
  {
    type: 'gas',
    from: { x: boiler.x - 300, y: boiler.y + boiler.h + 60 },
    to: { x: boiler.x + boiler.w / 2 - 35, y: boiler.y + boiler.h + 60 },
  },
  {
    type: 'gas',
    from: { x: boiler.x + boiler.w / 2 - 35, y: boiler.y + boiler.h + 60 },
    to: { x: boiler.x + boiler.w / 2 - 35, y: boiler.y + boiler.h - 5 },
  },
  {
    type: 'air',
    from: { x: boiler.x + boiler.w + 240, y: boiler.y + boiler.h + 60 },
    to: { x: boiler.x + boiler.w / 2 + 35, y: boiler.y + boiler.h + 60 },
  },
  {
    type: 'air',
    from: { x: boiler.x + boiler.w / 2 + 35, y: boiler.y + boiler.h + 60 },
    to: { x: boiler.x + boiler.w / 2 + 35, y: boiler.y + boiler.h - 5 },
  },
  {
    type: 'air',
    from: { x: boiler.x + boiler.w / 2, y: boiler.y },
    to: { x: boiler.x + boiler.w / 2, y: boiler.y - 180 },
  },
];

