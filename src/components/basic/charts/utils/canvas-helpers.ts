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

