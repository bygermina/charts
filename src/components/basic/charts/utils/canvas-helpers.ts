import type { ScaleLinear } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

import { CHART_FONT_SIZE, CHART_FONT_FAMILY } from '../shared/constants';

export const resolveCSSVariable = (variable: string, element: Element): string => {
  if (!variable.startsWith('var(')) return variable;

  const match = variable.match(/var\(([^)]+)\)/);
  if (!match) return variable;

  const varName = match[1].trim();
  const computedStyle = getComputedStyle(element);
  const value = computedStyle.getPropertyValue(varName).trim();

  if (value.startsWith('var(')) {
    return resolveCSSVariable(value, element);
  }

  return value || variable;
};

export const resolveChartColors = (
  chartColors: Record<string, string>,
  element: Element,
): Record<string, string> => {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(chartColors)) {
    resolved[key] = resolveCSSVariable(value, element);
  }

  return resolved;
};

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true,
  });
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  const actualWidth = width * dpr;
  const actualHeight = height * dpr;

  if (canvas.width !== actualWidth || canvas.height !== actualHeight) {
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return ctx;
};

interface DrawAxesConfig {
  ctx: CanvasRenderingContext2D;
  xAxisScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  chartWidth: number;
  chartHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  resolvedColors: Record<string, string>;
  xTicks?: number;
  yTicks?: number;
}

export const drawAxes = ({
  ctx,
  xAxisScale,
  yScale,
  chartWidth,
  chartHeight,
  margin,
  resolvedColors,
  xTicks = 5,
  yTicks = 5,
}: DrawAxesConfig): void => {
  try {
    ctx.save();
    ctx.strokeStyle = resolvedColors.grid;
    ctx.fillStyle = resolvedColors.textSecondary;
    ctx.font = `${CHART_FONT_SIZE} ${CHART_FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.beginPath();
    ctx.moveTo(0, chartHeight);
    ctx.lineTo(chartWidth - margin.right, chartHeight);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, chartHeight);
    ctx.stroke();

    const domain = xAxisScale.domain();
    const [min, max] = domain;
    const isTimestamp = typeof min === 'number' && typeof max === 'number' && min > 1000000000;

    const xTickValues = xAxisScale.ticks(xTicks);
    let xTickFormat: (value: number) => string;

    if (isTimestamp) {
      const timeRange = max - min;
      const oneDay = 24 * 60 * 60 * 1000;
      const formatter = timeRange > oneDay ? timeFormat('%d.%m %H:%M') : timeFormat('%H:%M:%S');
      xTickFormat = (value: number) => formatter(new Date(value));
    } else {
      xTickFormat = (value: number) => String(value);
    }

    ctx.beginPath();
    for (let i = 0; i < xTickValues.length; i++) {
      const tickValue = xTickValues[i];
      const x = xAxisScale(tickValue);

      if (x >= 0 && x <= chartWidth - margin.right) {
        ctx.moveTo(x, chartHeight);
        ctx.lineTo(x, chartHeight + 5);
      }
    }
    ctx.stroke();

    for (let i = 0; i < xTickValues.length; i++) {
      const tickValue = xTickValues[i];
      const x = xAxisScale(tickValue);

      if (x >= 0 && x <= chartWidth - margin.right) {
        const label = xTickFormat(tickValue);
        ctx.fillText(label, x, chartHeight + 15);
      }
    }

    const yTickValues = yScale.ticks(yTicks);
    const yTickFormat = yScale.tickFormat(yTicks);

    ctx.beginPath();
    for (let i = 0; i < yTickValues.length; i++) {
      const tickValue = yTickValues[i];
      const y = yScale(tickValue);

      if (y >= 0 && y <= chartHeight) {
        ctx.moveTo(0, y);
        ctx.lineTo(-5, y);
      }
    }
    ctx.stroke();

    ctx.textAlign = 'right';
    for (let i = 0; i < yTickValues.length; i++) {
      const tickValue = yTickValues[i];
      const y = yScale(tickValue);

      if (y >= 0 && y <= chartHeight) {
        const label = yTickFormat(tickValue);
        ctx.fillText(label, -10, y);
      }
    }

    ctx.restore();
  } catch (error) {
    ctx.restore();
    console.error('Error drawing axes:', error);
  }
};

interface DrawGridConfig {
  ctx: CanvasRenderingContext2D;
  xAxisScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  chartWidth: number;
  chartHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  resolvedColors: Record<string, string>;
  xTicks?: number;
  yTicks?: number;
}

export const drawGrid = ({
  ctx,
  xAxisScale,
  yScale,
  chartWidth,
  chartHeight,
  margin,
  resolvedColors,
  xTicks = 5,
  yTicks = 5,
}: DrawGridConfig): void => {
  try {
    ctx.save();
    ctx.strokeStyle = resolvedColors.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    ctx.globalAlpha = 0.5;

    const yTickValues = yScale.ticks(yTicks);
    ctx.beginPath();
    for (let i = 0; i < yTickValues.length; i++) {
      const tickValue = yTickValues[i];
      const rawY = yScale(tickValue);
      const y = Math.floor(rawY) + 0.5;

      if (y >= 0 && y <= chartHeight) {
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth - margin.right, y);
      }
    }
    ctx.stroke();

    const domain = xAxisScale.domain();
    const [min, max] = domain;
    const isTimestamp = typeof min === 'number' && typeof max === 'number' && min > 1000000000;

    let xTickValues: number[];
    if (isTimestamp) {
      const timeRange = max - min;
      const tickCount = Math.min(xTicks, Math.floor(timeRange / 1000));
      xTickValues = xAxisScale.ticks(tickCount);
    } else {
      xTickValues = xAxisScale.ticks(xTicks);
    }

    ctx.beginPath();
    for (let i = 0; i < xTickValues.length; i++) {
      const tickValue = xTickValues[i];
      const rawX = xAxisScale(tickValue);
      const x = Math.floor(rawX) + 0.5;

      if (x >= 0 && x <= chartWidth - margin.right) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
      }
    }
    ctx.stroke();

    ctx.restore();
  } catch (error) {
    ctx.restore();
    console.error('Error drawing grid:', error);
  }
};
