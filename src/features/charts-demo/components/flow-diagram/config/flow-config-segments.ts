import type { Segment } from './types';

// Absolute segment coordinates in the flow diagram viewBox (0 0 900 500).
// These match the original math for width=900, height=500, boiler and water container positions.
export const FLOW_SEGMENTS: Segment[] = [
  // cold water: from left into boiler bottom
  {
    type: 'water_cold',
    from: { x: 30, y: 355 },
    to: { x: 360, y: 355 },
  },
  // hot water: from boiler/water container to the right
  {
    type: 'water_hot',
    from: { x: 540, y: 130 },
    to: { x: 900, y: 130 },
  },
  // gas: from left to boiler bottom left
  {
    type: 'gas',
    from: { x: 30, y: 460 },
    to: { x: 415, y: 460 },
  },
  {
    type: 'gas',
    from: { x: 415, y: 460 },
    to: { x: 415, y: 400 },
  },
  // air: from right to boiler bottom right and chimney
  {
    type: 'air',
    from: { x: 810, y: 460 },
    to: { x: 485, y: 460 },
  },
  {
    type: 'air',
    from: { x: 485, y: 460 },
    to: { x: 485, y: 400 },
  },
  {
    type: 'air',
    from: { x: 450, y: 100 },
    to: { x: 450, y: -80 },
  },
];

export const createFlowSegments = (): Segment[] => FLOW_SEGMENTS;
