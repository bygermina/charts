import * as d3 from 'd3';

import { type BarDataPoint } from '../types';

export interface CreateScalesConfig {
  data: BarDataPoint[];
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
}

export interface Scales {
  xScale: d3.ScaleTime<number, number>;
  xAxisScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

export interface CreateGradientConfig {
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
  color: string;
  chartHeight: number;
  gradientId: string;
}

export interface CreateBarsConfig {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: BarDataPoint[];
  xScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  chartHeight: number;
  gradientId: string;
  barWidth: number;
  chartColors: Record<string, string>;
}

export interface BarsSelection {
  barsEnter: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsUpdate: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsExit: d3.Selection<SVGRectElement, unknown, SVGGElement, unknown>;
}

export interface AnimateBarsConfig {
  bars: d3.Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  yScale: d3.ScaleLinear<number, number>;
  chartHeight: number;
}
