import { useState, useEffect } from 'react';

/**
 * Custom hook for mount/unmount animations
 * @param {boolean} isVisible - Visibility state
 * @param {number} duration - Animation duration in ms
 * @returns {object} Animation state
 */
export const useAnimation = (isVisible, duration = 300) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  return {
    shouldRender,
    isAnimating,
    animationClass: isAnimating ? 'animate-in' : 'animate-out'
  };
};

export default useAnimation;