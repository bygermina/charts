import { type RefObject } from 'react';

import { cleanupSVGElement } from './utils/svg-helpers';
import { useVisibility } from './use-visibility';

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
  useVisibility({
    onHidden: () => {
      if (cleanupOnHidden) {
        cleanupSVGElement(svgRef.current);
      }
      onHidden?.();
    },
    onVisible,
  });
};
