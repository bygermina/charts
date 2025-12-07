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
  const renderFrameIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const renderRef = useRef(render);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    isMountedRef.current = true;

    const shouldContinue = () => isMountedRef.current && !document.hidden;

    const renderLoop = () => {
      if (!shouldContinue()) {
        renderFrameIdRef.current = null;
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        if (shouldContinue()) {
          renderFrameIdRef.current = requestAnimationFrame(renderLoop);
        }
        return;
      }

      const setupResult = setupCanvas(canvas, width, height);
      if (!setupResult) {
        if (shouldContinue()) {
          renderFrameIdRef.current = requestAnimationFrame(renderLoop);
        }
        return;
      }

      renderRef.current(setupResult.ctx, canvas);

      if (shouldContinue()) {
        renderFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (renderFrameIdRef.current !== null) {
          cancelAnimationFrame(renderFrameIdRef.current);
          renderFrameIdRef.current = null;
        }
      } else if (isMountedRef.current && renderFrameIdRef.current === null) {
        renderFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    renderFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMountedRef.current = false;
      if (renderFrameIdRef.current !== null) {
        cancelAnimationFrame(renderFrameIdRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, canvasRef, ...dependencies]);
};
