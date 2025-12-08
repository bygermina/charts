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
  resolvedChartColors: Record<string, string>;
  xTicks: number;
  yTicks: number;
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
  resolvedChartColors,
  xTicks,
  yTicks,
}: DrawAxesConfig): void => {
  try {
    const getFallbackColor = (cssVar: string): string => {
      if (typeof window !== 'undefined') {
        return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || 'rgb(51, 65, 85)';
      }
      return 'rgb(51, 65, 85)';
    };

    const axisColor = resolvedChartColors.grid || getFallbackColor('--color-slate-700');
    const textColor = resolvedChartColors.textSecondary || getFallbackColor('--color-slate-400');

    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.fillStyle = textColor;
    ctx.font = `${CHART_FONT_SIZE} ${CHART_FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.beginPath();
    ctx.moveTo(0, chartHeight);
    ctx.lineTo(chartWidth - margin.right, chartHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, chartHeight);
    ctx.stroke();

    const xTickCount = xTicks !== undefined ? xTicks : 10;
    const xTickValues = xAxisScale.ticks(xTickCount);
    const xTickFormat = xAxisScale.tickFormat(xTickCount);

    xTickValues.forEach((tickValue) => {
      const x = xAxisScale(tickValue);
      if (x >= 0 && x <= chartWidth - margin.right) {
        ctx.beginPath();
        ctx.moveTo(x, chartHeight);
        ctx.lineTo(x, chartHeight + 5);
        ctx.stroke();

        const label = xTickFormat(tickValue);
        ctx.fillText(label, x, chartHeight + 15);
      }
    });

    const yTickCount = yTicks !== undefined ? yTicks : 10;
    const yTickValues = yScale.ticks(yTickCount);
    const yTickFormat = yScale.tickFormat(yTickCount);

    ctx.textAlign = 'right';
    yTickValues.forEach((tickValue) => {
      const y = yScale(tickValue);
      if (y >= 0 && y <= chartHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(-5, y);
        ctx.stroke();

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
