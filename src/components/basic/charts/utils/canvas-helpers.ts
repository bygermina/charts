import * as d3 from 'd3';

interface CSSVariableCache {
  computedStyle: CSSStyleDeclaration | null;
  element: HTMLElement | null;
  cache: Map<string, string>;
  maxCacheSize: number;
}

const MAX_CSS_CACHE_SIZE = 50;

const createCSSVariableCache = (): CSSVariableCache => ({
  computedStyle: null,
  element: null,
  cache: new Map(),
  maxCacheSize: MAX_CSS_CACHE_SIZE,
});

export const resolveCSSVariable = (
  variable: string,
  element: HTMLElement,
  cache?: CSSVariableCache,
): string => {
  if (!variable.startsWith('var(')) {
    return variable;
  }

  const match = variable.match(/var\(([^)]+)\)/);
  if (!match) return variable;

  const varName = match[1].trim();

  if (cache) {
    if (cache.element !== element) {
      cache.computedStyle = getComputedStyle(element);
      cache.element = element;
      cache.cache.clear();
    }

    const cached = cache.cache.get(varName);
    if (cached !== undefined) {
      if (cached.startsWith('var(')) {
        return resolveCSSVariable(cached, element, cache);
      }
      return cached;
    }
  }

  const computedStyle = cache?.computedStyle || getComputedStyle(element);
  const value = computedStyle.getPropertyValue(varName).trim();

  if (cache) {
    if (cache.cache.size >= cache.maxCacheSize) {
      const firstKey = cache.cache.keys().next().value;
      if (firstKey) cache.cache.delete(firstKey);
    }
    cache.cache.set(varName, value);
  }

  if (value.startsWith('var(')) {
    return resolveCSSVariable(value, element, cache);
  }

  return value || variable;
};

export const resolveChartColors = (
  chartColors: Record<string, string>,
  element: HTMLElement,
  cache?: CSSVariableCache,
  resultCache?: Record<string, string>,
): Record<string, string> => {
  const resolved = resultCache || {};

  for (const key in resolved) {
    if (!(key in chartColors)) {
      delete resolved[key];
    }
  }

  for (const [key, value] of Object.entries(chartColors)) {
    if (resolved[key] !== value) {
      resolved[key] = resolveCSSVariable(value, element, cache);
    }
  }

  return resolved;
};

export { createCSSVariableCache, type CSSVariableCache };

interface SetupCanvasResult {
  ctx: CanvasRenderingContext2D;
  dpr: number;
  needsResize: boolean;
}

export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): SetupCanvasResult | null => {
  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: false,
  });
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  const actualWidth = width * dpr;
  const actualHeight = height * dpr;

  const needsResize = canvas.width !== actualWidth || canvas.height !== actualHeight;
  if (needsResize) {
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  return { ctx, dpr, needsResize };
};

interface LineSeries {
  data: Array<{ time: number }>;
}

export const hasDataChanged = (current: LineSeries[], previous: LineSeries[]): boolean => {
  if (!previous.length) return true;
  if (current.length !== previous.length) return true;

  return current.some((line, idx) => {
    const prevLine = previous[idx];
    if (!prevLine) return true;
    const lastPoint = line.data.at(-1);
    const prevLastPoint = prevLine.data.at(-1);
    return line.data.length !== prevLine.data.length || lastPoint?.time !== prevLastPoint?.time;
  });
};

interface DrawAxesConfig {
  ctx: CanvasRenderingContext2D;
  xAxisScale: d3.ScaleTime<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  chartWidth: number;
  chartHeight: number;
  margin: { top: number; right: number; bottom: number; left: number };
  resolvedColors: Record<string, string>;
  xTicks: number;
  yTicks: number;
}

const CHART_FONT_SIZE = '12px';
const CHART_FONT_FAMILY = 'Arial, sans-serif';

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

export const drawAxes = ({
  ctx,
  xAxisScale,
  yScale,
  chartWidth,
  chartHeight,
  margin,
  resolvedColors,
  xTicks,
  yTicks,
}: DrawAxesConfig): void => {
  try {
    ctx.save();
    ctx.strokeStyle = resolvedColors.grid;
    ctx.fillStyle = resolvedColors.textSecondary;
    ctx.font = `${CHART_FONT_SIZE} ${CHART_FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    drawLine(ctx, 0, chartHeight, chartWidth - margin.right, chartHeight);
    drawLine(ctx, 0, 0, 0, chartHeight);

    const xTickValues = xAxisScale.ticks(xTicks);
    const xTickFormat = xAxisScale.tickFormat(xTicks);

    xTickValues.forEach((tickValue) => {
      const x = xAxisScale(tickValue);

      if (x >= 0 && x <= chartWidth - margin.right) {
        drawLine(ctx, x, chartHeight, x, chartHeight + 5);

        const label = xTickFormat(tickValue);
        ctx.fillText(label, x, chartHeight + 15);
      }
    });

    const yTickValues = yScale.ticks(yTicks);
    const yTickFormat = yScale.tickFormat(yTicks);

    ctx.textAlign = 'right';
    yTickValues.forEach((tickValue) => {
      const y = yScale(tickValue);

      if (y >= 0 && y <= chartHeight) {
        drawLine(ctx, 0, y, -5, y);

        const label = yTickFormat(tickValue);
        ctx.fillText(label, -10, y);
      }
    });

    ctx.restore();
  } catch (error) {
    ctx.restore();
    console.error('Error drawing axes:', error);
  }
};
