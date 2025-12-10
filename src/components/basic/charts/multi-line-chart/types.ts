import { type DataPoint } from '../types';

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

export interface CreateClipPathsConfig {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
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
  xScale: d3.ScaleLinear<number, number>;
  xAxisScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
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
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

export interface UpdateLinePathConfig {
  path: d3.Selection<SVGPathElement, unknown, null, undefined>;
  line: d3.Line<DataPoint>;
  data: DataPoint[];
  isInitialRender: boolean;
}

export interface CalculateAnimationSpeedConfig {
  data: Array<{ time: number }>;
  xScale: d3.ScaleLinear<number, number>;
  customSpeed?: number;
  fallbackSpeed: number;
}

export interface UpdateLineWithShiftConfig {
  path: d3.Selection<SVGPathElement, unknown, null, undefined>;
  line: d3.Line<DataPoint>;
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  shiftOffset: number;
  speed: number;
}

export interface UpdateLineConfig {
  path: d3.Selection<SVGPathElement, unknown, null, undefined>;
  line: d3.Line<DataPoint>;
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  isInitialRender: boolean;
  shouldShift: boolean;
  shiftOffset: number;
  speed?: number;
}

export interface UpdateDotsConfig {
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  lineIndex: number;
  data: DataPoint[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

export interface CreateDotsConfig {
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  lineIndex: number;
  data: DataPoint[];
  color: string;
  isInitialRender: boolean;
}

export interface GetOrCreateLineGroupConfig {
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  lineIndex: number;
}

export interface GetOrCreateLinePathConfig {
  lineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  color: string;
  strokeWidth: number;
  isInitialRender: boolean;
}

import { type ChartColors } from '../chart-utils';

export interface ManageLegendConfig {
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  lines: LineSeries[];
  chartWidth: number;
  showLegend: boolean;
  chartColors: ChartColors;
}

export interface ManageGridConfig {
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
  gridLeftShift: number;
  chartColors: ChartColors;
  svgElement?: SVGSVGElement;
}

export interface AnimateGridAndAxisConfig {
  gridGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null;
  xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  shiftOffset: number;
  speed: number;
  gridLeftShift: number;
  chartHeight: number;
}
