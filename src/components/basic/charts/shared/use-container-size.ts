import { useEffect, useRef, useState } from 'react';

import { DEBOUNCE_DELAY, DEFAULT_CHART_SIZE } from './constants';

interface ContainerSize {
  width: number;
  height: number;
}

interface DebouncedFunction<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): DebouncedFunction<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as DebouncedFunction<T>;

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
};

export const useContainerSize = (ref: React.RefObject<HTMLElement | null>): ContainerSize => {
  const [size, setSize] = useState<ContainerSize>(DEFAULT_CHART_SIZE);
  const observerRef = useRef<ResizeObserver | null>(null);
  const debouncedUpdateRef = useRef<DebouncedFunction<() => void> | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    elementRef.current = element;

    const updateSize = () => {
      const currentElement = elementRef.current;
      if (!currentElement) return;
      const rect = currentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const debouncedUpdate = debounce(updateSize, DEBOUNCE_DELAY);
    debouncedUpdateRef.current = debouncedUpdate;

    if (typeof ResizeObserver !== 'undefined') {
      observerRef.current?.disconnect();
      observerRef.current = new ResizeObserver(() => {
        debouncedUpdate();
      });
      observerRef.current.observe(element);
    } else {
      window.addEventListener('resize', debouncedUpdate);
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      window.removeEventListener('resize', debouncedUpdate);
      debouncedUpdateRef.current?.cancel();
      debouncedUpdateRef.current = null;
      elementRef.current = null;
    };
  }, [ref]);

  return size;
};
