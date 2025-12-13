import { useEffect, useRef, type RefObject } from 'react';
import { select } from 'd3-selection';

interface UseVisibilityCleanupConfig {
  svgRef: RefObject<SVGSVGElement | null>;
  onHidden?: () => void;
  onVisible?: () => void;
  cleanupOnHidden?: boolean;
}

export const useVisibilityCleanup = ({
  svgRef,
  onHidden,
  onVisible,
  cleanupOnHidden = true,
}: UseVisibilityCleanupConfig): void => {
  const onHiddenRef = useRef(onHidden);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onHiddenRef.current = onHidden;
    onVisibleRef.current = onVisible;
  }, [onHidden, onVisible]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (cleanupOnHidden && svgRef.current) {
          const svg = select(svgRef.current);
          svg.selectAll('*').interrupt();
          svg.selectAll('*').remove();
        }
        onHiddenRef.current?.();
      } else {
        onVisibleRef.current?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [svgRef, cleanupOnHidden]);
};
