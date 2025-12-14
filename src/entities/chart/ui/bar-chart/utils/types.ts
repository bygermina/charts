import type { ScaleTime } from 'd3-scale';
import type { Selection } from 'd3-selection';

import {
  type ChartColors,
  type BarDataPoint,
  type LinearScale,
  type SVGGroupSelection,
} from '../../../model/types';

export interface CreateScalesConfig {
  data: BarDataPoint[];
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
}

export interface Scales {
  xScale: ScaleTime<number, number>;
  xAxisScale: ScaleTime<number, number>;
  yScale: LinearScale;
}

export interface CreateGradientConfig {
  defs: Selection<SVGDefsElement, unknown, null, undefined>;
  color: string;
  chartHeight: number;
  gradientId: string;
}

export interface CreateBarsConfig {
  g: SVGGroupSelection;
  data: BarDataPoint[];
  xScale: ScaleTime<number, number>;
  yScale: LinearScale;
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
