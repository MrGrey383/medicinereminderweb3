import { useState, useCallback } from 'react';

/**
 * Custom hook for random number generation
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {[number, function]} [randomNumber, generateNew]
 */
export const useRandom = (min = 0, max = 100) => {
  const [randomNumber, setRandomNumber] = useState(() => 
    Math.floor(Math.random() * (max - min + 1)) + min
  );

  const generateNew = useCallback(() => {
    setRandomNumber(Math.floor(Math.random() * (max - min + 1)) + min);
  }, [min, max]);

  return [randomNumber, generateNew];
};

export default useRandom;