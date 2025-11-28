import { useState, useCallback } from 'react';

/**
 * Custom hook for toggle state
 * @param {boolean} initialState - Initial state
 * @returns {[boolean, function]} [state, toggle]
 */
export const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return [state, toggle, setTrue, setFalse];
};

export default useToggle;