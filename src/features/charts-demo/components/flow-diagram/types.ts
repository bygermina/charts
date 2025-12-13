type FlowType = 'water_cold' | 'water_hot' | 'gas' | 'air';

type Segment = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: FlowType;
};

type Particle = {
  segmentIndex: number;
  t: number;
  speed: number;
};

export type { FlowType, Segment, Particle };
