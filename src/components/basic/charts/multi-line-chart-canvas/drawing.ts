import * as d3 from 'd3';

import { type LineSeries } from '../multi-line-chart/types';

const DEFAULT_X_AXIS_TICKS = 5;
const DEFAULT_Y_AXIS_TICKS = 5;

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartWidth: number,
  chartHeight: number,
  margin: { right: number },
  gridLeftShift: number,
  chartColors: Record<string, string>,
): void => {
  ctx.save();
  ctx.strokeStyle = chartColors.grid;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 2]);
  ctx.globalAlpha = 0.3;

  ctx.translate(-gridLeftShift, 0);

  yScale.ticks(DEFAULT_Y_AXIS_TICKS).forEach((tick) => {
    const y = yScale(tick);
    if (tick <= 0 || Math.abs(y - chartHeight) < 1) return;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(chartWidth - margin.right, y);
    ctx.stroke();
  });

  xScale.ticks(DEFAULT_X_AXIS_TICKS).forEach((tick) => {
    const x = xScale(tick);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, chartHeight - 0.5);
    ctx.stroke();
  });

  ctx.restore();
};

export const drawAxes = (
  ctx: CanvasRenderingContext2D,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartWidth: number,
  chartHeight: number,
  margin: { right: number },
  chartColors: Record<string, string>,
): void => {
  ctx.save();
  ctx.strokeStyle = chartColors.textSecondary;
  ctx.fillStyle = chartColors.textSecondary;
  ctx.font = '11px sans-serif';
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, chartHeight);
  ctx.lineTo(chartWidth - margin.right, chartHeight);
  ctx.stroke();

  xScale.ticks(DEFAULT_X_AXIS_TICKS).forEach((tick) => {
    const x = xScale(tick);
    ctx.beginPath();
    ctx.moveTo(x, chartHeight);
    ctx.lineTo(x, chartHeight + 5);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, chartHeight);
  ctx.stroke();

  yScale.ticks(DEFAULT_Y_AXIS_TICKS).forEach((tick) => {
    const y = yScale(tick);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(-5, y);
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(tick.toString(), -8, y);
  });

  ctx.restore();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  data: Array<{ time: number; value: number }>,
  line: d3.Line<{ time: number; value: number }>,
  color: string,
  strokeWidth: number,
  shiftOffset: number = 0,
): void => {
  if (data.length === 0) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = 0.8;

  if (shiftOffset !== 0) ctx.translate(shiftOffset, 0);

  const lineWithContext = line.context(ctx);
  ctx.beginPath();
  lineWithContext(data);
  ctx.stroke();

  ctx.restore();
};

export const drawLegend = (
  ctx: CanvasRenderingContext2D,
  lines: LineSeries[],
  chartWidth: number,
  chartColors: Record<string, string>,
): void => {
  const legendX = chartWidth - 120;
  const legendY = 10;
  const itemHeight = 20;

  lines.forEach((line, index) => {
    const y = legendY + index * itemHeight;

    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, y);
    ctx.lineTo(legendX + 15, y);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = chartColors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(line.label, legendX + 20, y);
  });
};
