import { useEffect, useRef, type RefObject } from 'react';

import { setupCanvas } from './utils/canvas-helpers';

export interface UseCanvasRenderLoopConfig {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  dependencies?: unknown[];
}

export const useCanvasRenderLoop = ({
  canvasRef,
  width,
  height,
  render,
  dependencies = [],
}: UseCanvasRenderLoopConfig): void => {
  const frameIdRef = useRef<number | null>(null);
  const renderRef = useRef(render);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    let isRunning = true;

    const renderLoop = () => {
      frameIdRef.current = null;
      if (!isRunning || document.hidden) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        frameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = setupCanvas(canvas, width, height);
      if (!ctx) {
        frameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      renderRef.current(ctx, canvas);
      frameIdRef.current = requestAnimationFrame(renderLoop);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current);
          frameIdRef.current = null;
        }
      } else if (isRunning && frameIdRef.current === null) {
        frameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    frameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, canvasRef, ...dependencies]);
};
