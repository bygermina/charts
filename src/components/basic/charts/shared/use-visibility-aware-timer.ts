import { useEffect, useRef } from 'react';

interface UseVisibilityAwareTimerConfig {
  delay: number;
  onTick: () => void;
  onHidden?: () => void;
  onVisible?: () => void;
  enabled?: boolean;
}

export const useVisibilityAwareTimer = ({
  delay,
  onTick,
  onHidden,
  onVisible,
  enabled = true,
}: UseVisibilityAwareTimerConfig): void => {
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasHiddenRef = useRef(document.hidden);
  const onTickRef = useRef(onTick);
  const onHiddenRef = useRef(onHidden);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onTickRef.current = onTick;
    onHiddenRef.current = onHidden;
    onVisibleRef.current = onVisible;
  }, [onTick, onHidden, onVisible]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.hidden) return;

      onTickRef.current();
      timeoutIdRef.current = setTimeout(tick, delay);
    };

    const startTick = () => {
      if (!document.hidden && enabled) {
        timeoutIdRef.current = setTimeout(tick, delay);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        if (timeoutIdRef.current !== null) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        onHiddenRef.current?.();
      } else if (wasHiddenRef.current && enabled) {
        wasHiddenRef.current = false;
        onVisibleRef.current?.();
        startTick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTick();

    return () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, enabled]);
};

