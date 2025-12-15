import { FLOW_COLORS } from './flow-colors';
import { type FlowType } from './types';

const BASE_SPEED_BY_TYPE: Record<FlowType, number> = {
  water_cold: 0.09,
  water_hot: 0.11,
  gas: 0.16,
  air: 0.07,
};

export const getBaseSpeed = (type: FlowType): number => BASE_SPEED_BY_TYPE[type] ?? 0.1;

export const getParticleColor = (type: FlowType): string => {
  const colorByType: Record<FlowType, string> = {
    water_cold: FLOW_COLORS.waterCold,
    water_hot: FLOW_COLORS.waterHot,
    gas: FLOW_COLORS.gas,
    air: FLOW_COLORS.air,
  };

  return colorByType[type] ?? FLOW_COLORS.default;
};

export const getLegendEntries = (): { label: string; color: string }[] => {
  return [
    { label: 'Cold Water', color: FLOW_COLORS.waterCold },
    { label: 'Hot Water', color: FLOW_COLORS.waterHot },
    { label: 'Gas', color: FLOW_COLORS.gas },
    { label: 'Air / Smoke', color: FLOW_COLORS.air },
  ];
};
