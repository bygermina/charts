import { useEffect, useRef } from 'react';

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
  const onHiddenRef = useRef(onHidden);
  const onVisibleRef = useRef(onVisible);
  const wasHiddenRef = useRef(document.hidden);

  useEffect(() => {
    onHiddenRef.current = onHidden;
    onVisibleRef.current = onVisible;
  }, [onHidden, onVisible]);

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);
};
