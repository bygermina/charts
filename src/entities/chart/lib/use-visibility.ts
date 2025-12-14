import { useEffect, useRef } from 'react';

import { useLatestRef } from './use-latest-ref';

interface UseVisibilityConfig {
  onHidden?: () => void;
  onVisible?: () => void;
  enabled?: boolean;
}

export const useVisibility = ({
  onHidden,
  onVisible,
  enabled = true,
}: UseVisibilityConfig = {}): void => {
  const onHiddenRef = useLatestRef(onHidden);
  const onVisibleRef = useLatestRef(onVisible);
  const wasHiddenRef = useRef(document.hidden);

  useEffect(() => {
    if (!enabled) return;

    if (!document.hidden) {
      onVisibleRef.current?.();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        onHiddenRef.current?.();
      } else if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        onVisibleRef.current?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
};
