import type { Segment } from './types';

export const FLOW_SEGMENTS: Segment[] = [
  {
    type: 'water_cold',
    from: { x: 30, y: 355 },
    to: { x: 360, y: 355 },
  },
  {
    type: 'water_hot',
    from: { x: 540, y: 130 },
    to: { x: 900, y: 130 },
  },
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
