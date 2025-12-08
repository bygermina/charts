interface CSSVariableCache {
  computedStyle: CSSStyleDeclaration | null;
  element: HTMLElement | null;
  cache: Map<string, string>;
  maxCacheSize: number;
}

const MAX_CSS_CACHE_SIZE = 50; // Ограничиваем размер кэша CSS переменных

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

  // Кэшируем computedStyle и результаты
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

  // Очищаем старые ключи, которых больше нет
  for (const key in resolved) {
    if (!(key in chartColors)) {
      delete resolved[key];
    }
  }

  // Обновляем только измененные значения
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
  // Use '2d' context with default settings optimized for D3.js canvas rendering
  // D3.js works best with standard 2d context for line.path() and other generators
  const ctx = canvas.getContext('2d', {
    // Optimize for frequent drawing operations
    alpha: true, // Allow transparency
    desynchronized: false, // Keep synchronized for better compatibility
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

  // Reset transform and apply device pixel ratio scaling
  // This ensures crisp rendering on high-DPI displays (D3.js best practice)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Always clear canvas before rendering to prevent artifacts
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
