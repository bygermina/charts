import type { Line } from 'd3-shape';
import type { Selection } from 'd3-selection';

import { type DataPoint, type LinearScale, type SVGGroupSelection } from '../../model/types';

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
  xScale: LinearScale;
  xAxisScale: LinearScale;
  yScale: LinearScale;
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
  xScale: LinearScale;
  yScale: LinearScale;
}

export interface UpdateLinePathConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  data: DataPoint[];
  isInitialRender: boolean;
}

export interface UpdateLineWithShiftConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  data: DataPoint[];
  shiftOffset: number;
  speed: number;
}

export interface UpdateLineConfig {
  path: Selection<SVGPathElement, string, SVGGElement, number>;
  line: Line<DataPoint>;
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  data: DataPoint[];
  isInitialRender: boolean;
  shouldShift: boolean;
  shiftOffset: number;
  speed?: number;
}

export interface UpdateDotsConfig {
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  lineIndex: number;
  data: DataPoint[];
  xScale: LinearScale;
  yScale: LinearScale;
}

export interface CreateDotsConfig {
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  lineIndex: number;
  data: DataPoint[];
  color: string;
  isInitialRender: boolean;
}

export interface GetOrCreateLineGroupConfig {
  mainGroup: SVGGroupSelection;
  lineIndex: number;
}

export interface GetOrCreateLinePathConfig {
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  color: string;
  strokeWidth: number;
  isInitialRender: boolean;
}

import { type ChartColors } from '../../model/types';

export interface ManageLegendConfig {
  mainGroup: SVGGroupSelection;
  lines: LineSeries[];
  chartWidth: number;
  showLegend: boolean;
  chartColors: ChartColors;
}

export interface ManageGridConfig {
  mainGroup: SVGGroupSelection;
  xScale: LinearScale;
  yScale: LinearScale;
  chartWidth: number;
  chartHeight: number;
  margin: { right: number };
  gridLeftShift: number;
  chartColors: ChartColors;
  svgElement?: SVGSVGElement;
}

export interface AnimateGridAndAxisConfig {
  gridGroup: SVGGroupSelection | null;
  xAxisGroup: SVGGroupSelection;
  shiftOffset: number;
  speed: number;
  gridLeftShift: number;
  chartHeight: number;
}

export interface Metadata {
  timeExtent: [number, number] | null;
  timeStep: number;
}

export const DEFAULT_METADATA: Metadata = { timeExtent: null, timeStep: 0 };
