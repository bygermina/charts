import { useEffect, useRef, type RefObject } from 'react';
import * as d3 from 'd3';

interface UseVisibilityCleanupConfig {
  svgRef: RefObject<SVGSVGElement | null>;
  onHidden?: () => void;
  onVisible?: () => void;
}

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
