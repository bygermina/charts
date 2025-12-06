export const resolveCSSVariable = (variable: string, element: HTMLElement): string => {
  if (!variable.startsWith('var(')) {
    return variable;
  }

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
  const ctx = canvas.getContext('2d');
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
  if (!needsResize) ctx.clearRect(0, 0, width, height);

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
