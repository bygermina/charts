import { useCallback, useEffect, useRef } from 'react';

import { useLatestRef } from './use-latest-ref';
import { useVisibility } from './use-visibility';

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
  const rafIdRef = useRef<number | null>(null);
  const onTickRef = useLatestRef(onTick);
  const delayRef = useLatestRef(delay);

  const stopTimer = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    const scheduleNext = () => {
      onTickRef.current();

      timeoutIdRef.current = setTimeout(scheduleNext, delayRef.current);
    };

    timeoutIdRef.current = setTimeout(scheduleNext, delayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopTimer]);

  useVisibility({
    onHidden: () => {
      stopTimer();
      onHidden?.();
    },
    onVisible: () => {
      if (enabled) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          startTimer();
        });
      }
      onVisible?.();
    },
    enabled,
  });

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);
};
