export type { LineSeries, MultiLineChartScales } from './types';

export { prepareChartData } from './utils/data-calculations';

export { calculateGridLeftShift } from './utils/grid-shift-calculations';

export { createOrUpdateScalesForAxes } from './utils/scales';

export { createLineGenerator, updateLine } from './utils/line-generator';

export { renderDots } from './utils/dots';

export { createChartGroups, getOrCreateLinePath } from './utils/svg-groups';
export { getOrCreateLineGroup } from './utils/svg-group-helpers';

export { manageGrid, manageLegend } from './utils/grid-legend';
