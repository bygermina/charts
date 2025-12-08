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

  // Batch all style changes before drawing
  ctx.strokeStyle = chartColors.grid;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 2]);
  ctx.globalAlpha = 0.3;

  ctx.translate(-gridLeftShift, 0);

  // Use D3's ticks() method for optimal tick calculation
  // Batch horizontal grid lines
  const yTicks = yScale.ticks(DEFAULT_Y_AXIS_TICKS);
  ctx.beginPath();
  for (const tick of yTicks) {
    const y = yScale(tick);
    if (tick <= 0 || Math.abs(y - chartHeight) < 1) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(chartWidth - margin.right, y);
  }
  ctx.stroke();

  // Batch vertical grid lines
  const xTicks = xScale.ticks(DEFAULT_X_AXIS_TICKS);
  ctx.beginPath();
  for (const tick of xTicks) {
    const x = xScale(tick);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, chartHeight - 0.5);
  }
  ctx.stroke();

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
  xTicks?: number,
  yTicks?: number,
): void => {
  ctx.save();

  // Используем D3 axis generators для получения данных осей (как в SVG версии)
  const xAxis = d3.axisBottom(xScale);
  if (xTicks !== undefined) {
    xAxis.ticks(xTicks);
  }
  // Форматируем время как часы:минуты:секунды
  xAxis.tickFormat(d3.timeFormat('%H:%M:%S'));

  const yAxis = d3.axisLeft(yScale);
  if (yTicks !== undefined) {
    yAxis.ticks(yTicks);
  }

  // Получаем ticks и форматирование из D3 axis generators
  const numXTicks = xTicks || DEFAULT_X_AXIS_TICKS;
  const numYTicks = yTicks || DEFAULT_Y_AXIS_TICKS;
  const xAxisTicks = xScale.ticks(numXTicks);
  const xTickFormat = xAxis.tickFormat();
  const yAxisTicks = yScale.ticks(numYTicks);
  const yTickFormat = yAxis.tickFormat();

  // Batch style changes - используем цвет из дизайн-системы для осей
  const axisColor = chartColors.grid;
  ctx.strokeStyle = axisColor;
  ctx.fillStyle = chartColors.textSecondary;
  // Используем Arial для более читаемого отображения без сжатия символов
  ctx.font = 'normal 12px Arial, sans-serif';
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;

  // Draw X-axis line
  ctx.beginPath();
  ctx.moveTo(0, chartHeight);
  ctx.lineTo(chartWidth - margin.right, chartHeight);
  ctx.stroke();

  // Draw X-axis ticks
  ctx.beginPath();
  for (const tick of xAxisTicks) {
    const x = xScale(tick);
    ctx.moveTo(x, chartHeight);
    ctx.lineTo(x, chartHeight + 5);
  }
  ctx.stroke();

  // Draw X-axis labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 1;
  // Увеличиваем ширину символов на 60% по оси X
  ctx.save();
  ctx.scale(1.6, 1);
  xAxisTicks.forEach((tick, index) => {
    const x = xScale(tick) / 1.6; // Компенсируем масштаб для позиционирования
    const label = xTickFormat ? xTickFormat(tick, index) : String(tick);
    // Убеждаемся, что подписи видны под осью
    if (label && label.trim()) {
      ctx.fillText(label, x, chartHeight + 8);
    }
  });
  ctx.restore();

  // Draw Y-axis line - тот же цвет и толщина
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, chartHeight);
  ctx.stroke();

  // Draw Y-axis ticks
  ctx.beginPath();
  for (const tick of yAxisTicks) {
    const y = yScale(tick);
    ctx.moveTo(0, y);
    ctx.lineTo(-5, y);
  }
  ctx.stroke();

  // Draw Y-axis labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 1;
  // Увеличиваем ширину символов на 60% по оси X
  ctx.save();
  ctx.scale(1.6, 1);
  yAxisTicks.forEach((tick, index) => {
    const y = yScale(tick);
    const label = yTickFormat ? yTickFormat(tick, index) : String(tick);
    // Убеждаемся, что подписи видны слева от оси
    if (label && label.trim()) {
      ctx.fillText(label, -10 / 1.6, y); // Компенсируем масштаб для позиционирования
    }
  });
  ctx.restore();

  ctx.restore();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  data: Array<{ time: number; value: number }>,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  color: string,
  strokeWidth: number,
  shiftOffset: number = 0,
): void => {
  if (data.length === 0) return;

  ctx.save();

  // Batch style changes together
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = 0.8;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (shiftOffset !== 0) ctx.translate(shiftOffset, 0);

  // Draw line using pure canvas API
  ctx.beginPath();
  let isFirstPoint = true;

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const x = xScale(point.time);
    const y = yScale(point.value);

    // Skip invalid points
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    if (isFirstPoint) {
      ctx.moveTo(x, y);
      isFirstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

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
    ctx.font = 'normal 12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(line.label, legendX + 20, y);
  });
};
