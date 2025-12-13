import { useEffect, useRef, type RefObject } from 'react';

import { setupCanvas } from './utils/canvas-helpers';
import { useLatestRef } from './use-latest-ref';
import { useVisibility } from './use-visibility';

interface UseCanvasRenderLoopConfig {
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
  const renderRef = useLatestRef(render);
  const renderLoopRef = useRef<(() => void) | null>(null);

  useVisibility({
    onHidden: () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    },
    onVisible: () => {
      if (renderLoopRef.current && frameIdRef.current === null) {
        frameIdRef.current = requestAnimationFrame(renderLoopRef.current);
      }
    },
  });

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

    renderLoopRef.current = renderLoop;
    frameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, canvasRef, renderRef, ...dependencies]);
};
