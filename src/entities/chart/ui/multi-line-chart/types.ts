import type { Selection } from 'd3-selection';

import {
  type ChartColors,
  type DataPoint,
  type LinearScale,
  type SVGGroupSelection,
} from '../../model/types';

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

export interface CalculateMaxValueConfig {
  lines: LineSeries[];
}

export interface CalculateGridLeftShiftConfig {
  timeStep: number;
  timeExtent: [number, number];
  chartWidth: number;
}

export interface GetOrCreateLinePathConfig {
  lineGroup: Selection<SVGGElement, number, SVGGElement, unknown>;
  color: string;
  strokeWidth: number;
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

export interface MultiLineChartMetadata {
  timeExtent: [number, number] | null;
  timeStep: number;
}

export const DEFAULT_METADATA: MultiLineChartMetadata = { timeExtent: null, timeStep: 0 };
