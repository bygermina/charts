import * as d3 from 'd3';

export interface ShiftAnimationConfig {
  prevTimeExtent: [number, number] | null;
  currentTimeExtent: [number, number];
  chartWidth: number;
}

export interface ShiftAnimationResult {
  shouldAnimate: boolean;
  shiftOffset: number;
}

export const calculateShiftAnimation = ({
  prevTimeExtent,
  currentTimeExtent,
  chartWidth,
}: ShiftAnimationConfig): ShiftAnimationResult => {
  if (!prevTimeExtent || prevTimeExtent[0] === null || prevTimeExtent[1] === null) {
    return { shouldAnimate: false, shiftOffset: 0 };
  }

  const prevXScale = d3.scaleLinear<number, number>().domain(prevTimeExtent).range([0, chartWidth]);
  const currentXScale = d3
    .scaleLinear<number, number>()
    .domain(currentTimeExtent)
    .range([0, chartWidth]);

  if (currentTimeExtent[1] > prevTimeExtent[1]) {
    const oldFirstX = prevXScale(prevTimeExtent[0]);
    const newFirstX = currentXScale(prevTimeExtent[0]);
    const shiftOffset = oldFirstX - newFirstX;

    if (shiftOffset > 0) {
      return { shouldAnimate: true, shiftOffset };
    }
  }

  return { shouldAnimate: false, shiftOffset: 0 };
};

export interface CalculateSpeedConfig {
  data: Array<{ time: number }>;
  xScale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
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
    const distances: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const prevX = xScale(data[i - 1].time);
      const currX = xScale(data[i].time);
      const distance = Math.abs(currX - prevX);
      if (distance > 0) {
        distances.push(distance);
      }
    }

    if (distances.length > 0) {
      const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      return avgDistance;
    }
  }

  return fallbackSpeed || 100;
};

export interface ApplyShiftAnimationConfig {
  element: d3.Selection<SVGGElement, unknown, null, undefined>;
  shiftOffset: number;
  speed: number;
  targetX?: number;
  targetY?: number;
}

export const applyShiftAnimation = ({
  element,
  shiftOffset,
  speed,
  targetX = 0,
  targetY = 0,
}: ApplyShiftAnimationConfig): void => {
  const duration = Math.abs(shiftOffset / speed) * 1000;

  const { x: currentTranslateX, y: currentTranslateY } = getCurrentTranslate(element);

  element.interrupt();

  const startTranslateX = currentTranslateX + shiftOffset;
  element.attr('transform', `translate(${startTranslateX}, ${currentTranslateY})`);

  element
    .transition()
    .duration(duration)
    .ease(d3.easeLinear)
    .attr('transform', `translate(${targetX}, ${targetY})`);
};

export const getCurrentTranslate = (
  element: d3.Selection<SVGGElement, unknown, null, undefined>,
): { x: number; y: number } => {
  const currentTransform = element.attr('transform') || 'translate(0, 0)';
  const match = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
  if (match) {
    return {
      x: parseFloat(match[1]) || 0,
      y: parseFloat(match[2]) || 0,
    };
  }
  return { x: 0, y: 0 };
};
