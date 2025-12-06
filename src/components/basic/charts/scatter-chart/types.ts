import * as d3 from 'd3';

import { type ScatterDataPoint } from '../types';

export interface CreateScalesConfig {
  data: ScatterDataPoint[];
  chartWidth: number;
  chartHeight: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
}

export interface Scales {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

export interface CreateDotsConfig {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: ScatterDataPoint[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  categoryColors: Record<string, string>;
  defaultColor: string;
  dotRadius: number;
}

