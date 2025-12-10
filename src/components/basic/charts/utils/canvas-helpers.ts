import * as d3 from 'd3';

export const resolveCSSVariable = (variable: string, element: HTMLElement): string => {
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
  element: HTMLElement,
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

  return ctx;
};

interface DrawAxesConfig {
  ctx: CanvasRenderingContext2D;
  xAxisScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  chartWidth: number;
  chartHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  resolvedColors: Record<string, string>;
  xTicks?: number;
  yTicks?: number;
}

const CHART_FONT_SIZE = '12px';
const CHART_FONT_FAMILY = 'Arial, sans-serif';

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
      const timeFormat = timeRange > oneDay ? d3.timeFormat('%d.%m %H:%M') : d3.timeFormat('%H:%M:%S');
      xTickFormat = (value: number) => timeFormat(new Date(value));
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
