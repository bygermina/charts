import { useEffect, useRef } from 'react';

export const useLatestRef = <T>(value: T): React.RefObject<T> => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
