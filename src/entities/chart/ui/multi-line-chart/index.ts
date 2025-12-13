export type { LineSeries, Scales } from './types';

export { prepareChartData } from './utils/data-calculations';

export { calculateGridLeftShift } from './utils/grid-shift-calculations';

export { createScalesForAxes, updateScalesForAxes } from './utils/scales';

export { createLineGenerator, updateLine } from './utils/line-generator';

export { createAndAnimateDots } from './components/dots';

export {
  createChartGroups,
  getOrCreateLineGroup,
  getOrCreateLinePath,
} from './components/svg-groups';

export { manageGrid, manageLegend, animateGridAndAxis } from './components/grid-legend';
