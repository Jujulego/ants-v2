import { useEffect, useRef, useState } from 'react';

// Hook
/**
 * Stabilize media query value on the 2 first render (renders twice in strict mode)
 *
 * @example
 * let value = useMediaQuery('...');
 *
 * if (process.env.NODE_ENV === 'development') { // <= ensure this code will be removed in production
 *   // eslint-disable-next-line react-hooks/rules-of-hooks
 *   value = useStabilizeMediaQuery(value);
 * }
 *
 * @param value result from useMediaQuery
 */
export function useStabilizeMediaQuery(value: boolean): boolean {
  const count = useRef(0);
  const previous = useRef(value);
  const [rerender, setRerender] = useState(false);

  if (count.current === 0) {
    previous.current = value;
  } else if (count.current === 1) {
    const tmp = value;
    value = previous.current;
    previous.current = tmp;
  } else if (count.current === 2 && rerender) {
    value = previous.current;
  }

  count.current++;

  useEffect(() => {
    if (count.current === 2 && value !== previous.current) {
      setRerender(true);
    }
  }, [value]);

  return value;
}
