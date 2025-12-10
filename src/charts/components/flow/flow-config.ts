import { type FlowType } from './types';
import { FLOW_COLORS } from './flow-colors';

export const getBaseSpeed = (type: FlowType): number => {
  switch (type) {
    case 'water_cold':
      return 0.09;
    case 'water_hot':
      return 0.11;
    case 'gas':
      return 0.16;
    case 'air':
      return 0.07;
    default:
      return 0.1;
  }
};

export const getParticleColor = (type: FlowType): string => {
  switch (type) {
    case 'water_cold':
      return FLOW_COLORS.waterCold;
    case 'water_hot':
      return FLOW_COLORS.waterHot;
    case 'gas':
      return FLOW_COLORS.gas;
    case 'air':
      return FLOW_COLORS.air;
    default:
      return FLOW_COLORS.default;
  }
};

export const getLegendEntries = (): { label: string; color: string }[] => {
  return [
    { label: 'Cold Water', color: FLOW_COLORS.waterCold },
    { label: 'Hot Water', color: FLOW_COLORS.waterHot },
    { label: 'Gas', color: FLOW_COLORS.gas },
    { label: 'Air / Smoke', color: FLOW_COLORS.air },
  ];
};
