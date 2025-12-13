import { useEffect, useRef } from 'react';
import { timer, type Timer } from 'd3-timer';

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

    const startTimer = () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }

      lastTickRef.current = 0;

      timerRef.current = timer((elapsed) => {
        if (document.hidden) return;

        const timeSinceLastTick = elapsed - lastTickRef.current;

        if (timeSinceLastTick >= delay) {
          onTickRef.current();
          lastTickRef.current = elapsed;
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHiddenRef.current = true;
        if (timerRef.current) {
          timerRef.current.stop();
          timerRef.current = null;
        }
        onHiddenRef.current?.();
      } else if (wasHiddenRef.current && enabled) {
        wasHiddenRef.current = false;
        onVisibleRef.current?.();
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
        timerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, enabled]);
};
