import type { ScaleTime, ScaleLinear } from 'd3-scale';
import type { Selection } from 'd3-selection';

import { type ChartColors, type DataPoint } from '../../../model/types';

type BarDataPoint = DataPoint;

export interface CreateScalesConfig {
  data: BarDataPoint[];
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
}

export interface Scales {
  xScale: ScaleTime<number, number>;
  xAxisScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
}

export interface CreateGradientConfig {
  defs: Selection<SVGDefsElement, unknown, null, undefined>;
  color: string;
  chartHeight: number;
  gradientId: string;
}

export interface CreateBarsConfig {
  g: Selection<SVGGElement, unknown, null, undefined>;
  data: BarDataPoint[];
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  chartHeight: number;
  gradientId: string;
  barWidth: number;
  chartColors: ChartColors;
}

export interface BarsSelection {
  barsEnter: Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsUpdate: Selection<SVGRectElement, BarDataPoint, SVGGElement, unknown>;
  barsExit: Selection<SVGRectElement, unknown, SVGGElement, unknown>;
}
