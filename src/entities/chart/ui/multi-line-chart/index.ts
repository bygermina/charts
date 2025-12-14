export type { LineSeries, Scales } from './types';

export { prepareChartData } from './utils/data-calculations';

export { calculateGridLeftShift } from './utils/grid-shift-calculations';

export { createOrUpdateScalesForAxes } from './utils/scales';

export { createLineGenerator, updateLine } from './utils/line-generator';

export { createAndAnimateDots } from './components/dots';

export { createChartGroups, getOrCreateLinePath } from './components/svg-groups';
export { getOrCreateLineGroup } from './utils/svg-group-helpers';

export { manageGrid, manageLegend, animateGridAndAxis } from './components/grid-legend';
