import { useEffect, useRef, useState } from 'react';

interface ContainerSize {
  width: number;
  height: number;
}

const DEFAULT_SIZE: ContainerSize = { width: 600, height: 250 };
const DEBOUNCE_DELAY = 150;

const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  }) as T;
};

export const useContainerSize = (ref: React.RefObject<HTMLElement | null>): ContainerSize => {
  const [size, setSize] = useState<ContainerSize>(DEFAULT_SIZE);
  const observerRef = useRef<ResizeObserver | null>(null);
  const debouncedUpdateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const debouncedUpdate = debounce(updateSize, DEBOUNCE_DELAY);
    debouncedUpdateRef.current = debouncedUpdate;

    if (typeof ResizeObserver !== 'undefined') {
      observerRef.current = new ResizeObserver(() => {
        debouncedUpdate();
      });
      observerRef.current.observe(element);
    } else {
      window.addEventListener('resize', debouncedUpdate);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      } else if (debouncedUpdateRef.current) {
        window.removeEventListener('resize', debouncedUpdateRef.current);
      }
    };
  }, [ref]);

  return size;
};
