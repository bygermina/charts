import { useEffect, useRef, type RefObject } from 'react';
import * as d3 from 'd3';

interface UseVisibilityCleanupConfig {
  svgRef: RefObject<SVGSVGElement | null>;
  onHidden?: () => void;
  onVisible?: () => void;
}

/**
 * Хук для очистки графика при переключении вкладки браузера
 * При скрытии вкладки полностью удаляет график и вызывает onHidden
 * При возврате на вкладку вызывает onVisible
 */
export const useVisibilityCleanup = ({
  svgRef,
  onHidden,
  onVisible,
}: UseVisibilityCleanupConfig): void => {
  const onHiddenRef = useRef(onHidden);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onHiddenRef.current = onHidden;
    onVisibleRef.current = onVisible;
  }, [onHidden, onVisible]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').interrupt();
        svg.selectAll('*').remove();

        onHiddenRef.current?.();
      } else if (!document.hidden) {
        onVisibleRef.current?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [svgRef]);
};
