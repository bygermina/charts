import { type LineSeries } from '../multi-line-chart/types';

interface ChartCacheData {
  resolvedColors?: Record<string, string>;
  prevData?: LineSeries[]; // Used for data change detection
  prevMetadata?: {
    timeExtent: [number, number] | null;
    timeStep: number;
  };
  cachedLines?: LineSeries[];
  cachedLinesHash?: string;
}

const canvasCache = new WeakMap<HTMLCanvasElement, ChartCacheData>();

export const getCanvasCache = (canvas: HTMLCanvasElement): ChartCacheData => {
  let cache = canvasCache.get(canvas);
  if (!cache) {
    cache = {};
    canvasCache.set(canvas, cache);
  }
  return cache;
};

export const getCachedOrCompute = <K extends keyof ChartCacheData, T extends ChartCacheData[K]>(
  cache: ChartCacheData,
  key: K,
  compute: () => T,
): T => {
  if (cache[key] === undefined) {
    cache[key] = compute();
  }
  return cache[key] as T;
};
