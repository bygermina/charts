import { timer, type Timer } from 'd3-timer';
import { useEffect, useRef } from 'react';

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
  const timerRef = useRef<Timer | null>(null);
  const lastTickRef = useRef<number>(0);
  const onTickRef = useLatestRef(onTick);
  const delayRef = useLatestRef(delay);
  const startTimerRef = useRef<(() => void) | null>(null);

  const startTimer = () => {
    if (timerRef.current) {
      timerRef.current.stop();
    }

    lastTickRef.current = 0;

    timerRef.current = timer((elapsed) => {
      if (document.hidden) return;

      const timeSinceLastTick = elapsed - lastTickRef.current;

      if (timeSinceLastTick >= delayRef.current) {
        onTickRef.current();
        lastTickRef.current = elapsed;
      }
    });
  };

  startTimerRef.current = startTimer;

  useVisibility({
    onHidden: () => {
      if (timerRef.current) {
        timerRef.current.stop();
        timerRef.current = null;
      }
      onHidden?.();
    },
    onVisible: () => {
      if (enabled && startTimerRef.current) {
        startTimerRef.current();
      }
      onVisible?.();
    },
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    startTimer();

    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
        timerRef.current = null;
      }
    };
  }, [delay, enabled]);
};
