import { type FlowType } from './types';

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
      return 'rgb(59, 130, 246)';
    case 'water_hot':
      return 'rgb(239, 68, 68)';
    case 'gas':
      return 'rgb(234, 179, 8)';
    case 'air':
      return 'rgb(148, 163, 184)';
    default:
      return 'rgb(203, 213, 225)';
  }
};

export const getLegendEntries = (): { label: string; color: string }[] => {
  return [
    { label: 'Cold Water', color: 'rgb(59, 130, 246)' },
    { label: 'Hot Water', color: 'rgb(239, 68, 68)' },
    { label: 'Gas', color: 'rgb(234, 179, 8)' },
    { label: 'Air / Smoke', color: 'rgb(148, 163, 184)' },
  ];
};
