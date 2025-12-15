export type FlowType = 'water_cold' | 'water_hot' | 'gas' | 'air';

export type Segment = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: FlowType;
};

export type Particle = {
  segmentIndex: number;
  t: number;
  speed: number;
};
