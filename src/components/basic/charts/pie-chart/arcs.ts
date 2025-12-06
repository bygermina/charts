import * as d3 from 'd3';

import { type PieDataPoint } from '../types';
import { type CreateArcConfig } from './types';
import { PAD_ANGLE, CORNER_RADIUS } from './constants';

export const createPie = (): d3.Pie<unknown, PieDataPoint> => {
  return d3
    .pie<PieDataPoint>()
    .value((d) => d.value)
    .sort(null)
    .padAngle(PAD_ANGLE);
};

export const createArc = ({
  innerRadius,
  outerRadius,
}: CreateArcConfig): d3.Arc<unknown, d3.PieArcDatum<PieDataPoint>> => {
  return d3
    .arc<d3.PieArcDatum<PieDataPoint>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(CORNER_RADIUS);
};
