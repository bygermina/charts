import type { Line } from 'd3-shape';
import type { ScaleLinear } from 'd3-scale';
import type { Selection } from 'd3-selection';

import { type DataPoint } from '../../model/types';

export interface LineSeries {
  data: DataPoint[];
  color: string;
  label: string;
  showDots?: boolean;
}

export interface TimeExtentConfig {
  lines: LineSeries[];
}

export interface TimeExtentResult {
  timeExtent: [number, number];
  timeStep: number;
}

export interface CreateScalesConfig {
  timeExtent: [number, number];
  maxValue: number;
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
  yDomain?: [number, number];
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  xAxisScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export interface CalculateMaxValueConfig {
  lines: LineSeries[];
}

export interface CalculateGridLeftShiftConfig {
  timeStep: number;
  timeExtent: [number, number];
  chartWidth: number;
}

export interface CreateLineGeneratorConfig {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export interface UpdateLinePathConfig {
  path: Selection<SVGPathElement, unknown, null, undefined>;
  line: Line<DataPoint>;
  data: DataPoint[];
  isInitialRender: boolean;
}

export interface UpdateLineWithShiftConfig {
  path: Selection<SVGPathElement, unknown, null, undefined>;
  line: Line<DataPoint>;
  lineGroup: Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  shiftOffset: number;
  speed: number;
}

export interface UpdateLineConfig {
  path: Selection<SVGPathElement, unknown, null, undefined>;
  line: Line<DataPoint>;
  lineGroup: Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  isInitialRender: boolean;
  shouldShift: boolean;
  shiftOffset: number;
  speed?: number;
}

export interface UpdateDotsConfig {
  lineGroup: Selection<SVGGElement, unknown, null, undefined>;
  lineIndex: number;
  data: DataPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export interface CreateDotsConfig {
  lineGroup: Selection<SVGGElement, unknown, null, undefined>;
  lineIndex: number;
  data: DataPoint[];
  color: string;
  isInitialRender: boolean;
}

export interface GetOrCreateLineGroupConfig {
  mainGroup: Selection<SVGGElement, unknown, null, undefined>;
  lineIndex: number;
}

export interface GetOrCreateLinePathConfig {
  lineGroup: Selection<SVGGElement, unknown, null, undefined>;
  color: string;
  strokeWidth: number;
  isInitialRender: boolean;
}

import { type ChartColors } from '../../model/types';

export interface ManageLegendConfig {
  mainGroup: Selection<SVGGElement, unknown, null, undefined>;
  lines: LineSeries[];
  chartWidth: number;
  showLegend: boolean;
  chartColors: ChartColors;
}

export interface ManageGridConfig {
  mainGroup: Selection<SVGGElement, unknown, null, undefined>;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
  gridLeftShift: number;
  chartColors: ChartColors;
  svgElement?: SVGSVGElement;
}

export interface AnimateGridAndAxisConfig {
  gridGroup: Selection<SVGGElement, unknown, null, undefined> | null;
  xAxisGroup: Selection<SVGGElement, unknown, null, undefined>;
  shiftOffset: number;
  speed: number;
  gridLeftShift: number;
  chartHeight: number;
}
