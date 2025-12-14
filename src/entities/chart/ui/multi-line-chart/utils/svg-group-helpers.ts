import type { SVGGroupSelection } from '@/entities/chart/model/types';

export interface GetOrCreateLineGroupConfig {
  mainGroup: SVGGroupSelection;
  lineIndex: number;
}

export const getOrCreateLineGroup = ({ mainGroup, lineIndex }: GetOrCreateLineGroupConfig) => {
  const selection = mainGroup
    .selectAll<SVGGElement, number>(`g.line-group-${lineIndex}`)
    .data([lineIndex], (d) => d)
    .join(
      (enter) => enter.append('g').attr('class', `line-group-${lineIndex}`),
      (update) => update,
      (exit) => exit.remove(),
    );

  return selection;
};
