import type { Selection } from 'd3-selection';
import { easeLinear } from 'd3-ease';
import { scaleLinear, type ScaleLinear, type ScaleTime } from 'd3-scale';

interface ShiftAnimationConfig {
  prevTimeExtent: [number, number] | null;
  currentTimeExtent: [number, number];
  currentXScale: ScaleLinear<number, number>;
  chartWidth: number;
}

interface ShiftAnimationResult {
  shouldAnimate: boolean;
  shiftOffset: number;
}

export const calculateShiftAnimation = ({
  prevTimeExtent,
  currentTimeExtent,
  currentXScale,
  chartWidth,
}: ShiftAnimationConfig): ShiftAnimationResult => {
  if (!prevTimeExtent || prevTimeExtent[0] === null || prevTimeExtent[1] === null) {
    return { shouldAnimate: false, shiftOffset: 0 };
  }

  const [prevMinTime, prevMaxTime] = prevTimeExtent;

  const prevXScale = scaleLinear().domain(prevTimeExtent).range([0, chartWidth]);

  const [, currentMaxTime] = currentTimeExtent;

  if (currentMaxTime > prevMaxTime) {
    const oldFirstX = prevXScale(prevMinTime);
    const newFirstX = currentXScale(prevMinTime);
    const shiftOffset = oldFirstX - newFirstX;

    if (shiftOffset > 0) {
      return { shouldAnimate: true, shiftOffset };
    }
  }

  return { shouldAnimate: false, shiftOffset: 0 };
};

interface CalculateSpeedConfig {
  data: Array<{ time: number }>;
  xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
  customSpeed?: number;
  fallbackSpeed?: number;
}

export const calculateAnimationSpeed = ({
  data,
  xScale,
  customSpeed,
  fallbackSpeed,
}: CalculateSpeedConfig): number => {
  if (customSpeed && customSpeed > 0) {
    return customSpeed;
  }

  if (data.length >= 2) {
    const distances = data
      .slice(1)
      .map((d, i) => Math.abs(xScale(d.time) - xScale(data[i].time)))
      .filter((d) => d > 0);

    if (distances.length > 0) {
      return distances.reduce((sum, d) => sum + d, 0) / distances.length;
    }
  }

  return fallbackSpeed || 100;
};

interface ApplyShiftAnimationConfig<
  Datum = unknown,
  PElement extends Element | null = Element | null,
  PDatum = unknown,
> {
  element: Selection<SVGGElement, Datum, PElement, PDatum>;
  shiftOffset: number;
  speed: number;
  targetX?: number;
  targetY?: number;
}

export const applyShiftAnimation = <
  Datum = unknown,
  PElement extends Element | null = Element | null,
  PDatum = unknown,
>({
  element,
  shiftOffset,
  speed,
  targetX = 0,
  targetY = 0,
}: ApplyShiftAnimationConfig<Datum, PElement, PDatum>): void => {
  const duration = Math.abs(shiftOffset / speed) * 1000;

  const { x: currentTranslateX, y: currentTranslateY } = getCurrentTranslate(element);

  element.interrupt();

  const startTranslateX = currentTranslateX + shiftOffset;
  element.attr('transform', `translate(${startTranslateX},${currentTranslateY})`);

  element
    .transition()
    .duration(duration)
    .ease(easeLinear)
    .attr('transform', `translate(${targetX},${targetY})`);
};

interface AnimateChartElementsConfig {
  elements: Array<{
    element: Selection<SVGGElement, unknown, null, undefined>;
    targetX: number;
    targetY: number;
  }>;
  shiftOffset: number;
  speed: number;
}

export const animateChartElements = ({
  elements,
  shiftOffset,
  speed,
}: AnimateChartElementsConfig): void => {
  const duration = Math.abs(shiftOffset / speed) * 1000;

  elements.forEach(({ element, targetX, targetY }) => {
    const { x: currentTranslateX, y: currentTranslateY } = getCurrentTranslate(element);

    element.interrupt();

    const startTranslateX = currentTranslateX + shiftOffset;
    element.attr('transform', `translate(${startTranslateX},${currentTranslateY})`);

    element
      .transition()
      .duration(duration)
      .ease(easeLinear)
      .attr('transform', `translate(${targetX},${targetY})`);
  });
};

const TRANSFORM_REGEX = /translate\(([^,]+),?\s*([^)]*)\)/;

export const getCurrentTranslate = <
  Datum = unknown,
  PElement extends Element | null = Element | null,
  PDatum = unknown,
>(
  element: Selection<SVGGElement, Datum, PElement, PDatum>,
): { x: number; y: number } => {
  const currentTransform = element.attr('transform');
  if (!currentTransform) return { x: 0, y: 0 };

  const match = currentTransform.match(TRANSFORM_REGEX);
  if (match) {
    return {
      x: parseFloat(match[1]) || 0,
      y: match[2] ? parseFloat(match[2]) || 0 : 0,
    };
  }

  return { x: 0, y: 0 };
};
