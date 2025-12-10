import { useEffect, type RefObject } from 'react';
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
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').interrupt();
        svg.selectAll('*').remove();
        onHidden?.();
      } else if (!document.hidden) {
        onVisible?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [svgRef, onHidden, onVisible]);
};
