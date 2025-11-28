import { useEffect, useRef } from 'react';

/**
 * Custom hook that runs effect only on updates (not on mount)
 * @param {function} effect - Effect function
 * @param {Array} deps - Dependencies
 */
export const useUpdateEffect = (effect, deps) => {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
};

export default useUpdateEffect;