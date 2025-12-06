import * as d3 from 'd3';

import { type PieDataPoint } from '../types';

export interface CreateArcConfig {
  innerRadius: number;
  outerRadius: number;
}

export interface CreateGradientsConfig {
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
  colors: string[];
}

export interface CreateShadowFilterConfig {
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
}

export interface CreateArcsConfig {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  pieData: d3.PieArcDatum<PieDataPoint>[];
  arc: d3.Arc<unknown, d3.PieArcDatum<PieDataPoint>>;
  colors: string[];
}

export interface CreateLabelsConfig {
  arcs: d3.Selection<SVGGElement, d3.PieArcDatum<PieDataPoint>, SVGGElement, unknown>;
  arc: d3.Arc<unknown, d3.PieArcDatum<PieDataPoint>>;
  innerRadius: number;
  outerRadius: number;
  textColor: string;
}
