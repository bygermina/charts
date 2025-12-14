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
  xScale: LinearScale;
  xAxisScale: LinearScale;
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
  xScale: LinearScale;
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
