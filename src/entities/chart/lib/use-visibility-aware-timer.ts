import { useCallback, useRef } from 'react';

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
  const onTickRef = useLatestRef(onTick);
  const delayRef = useLatestRef(delay);

  const startTimer = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    const scheduleNext = () => {
      onTickRef.current();

      timeoutIdRef.current = setTimeout(scheduleNext, delayRef.current);
    };

    onTickRef.current();
    timeoutIdRef.current = setTimeout(scheduleNext, delayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useVisibility({
    onHidden: () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      onHidden?.();
    },
    onVisible: () => {
      if (enabled) {
        requestAnimationFrame(() => {
          startTimer();
        });
      }
      onVisible?.();
    },
    enabled,
  });
};
