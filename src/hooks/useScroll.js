import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position
 * @returns {object} Scroll state
 */
export const useScroll = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  });
  const [scrollDirection, setScrollDirection] = useState(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrollPosition({
        x: window.scrollX,
        y: currentScrollY
      });

      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return {
    x: scrollPosition.x,
    y: scrollPosition.y,
    direction: scrollDirection,
    isScrolling: scrollPosition.y > 0,
    isAtTop: scrollPosition.y === 0
  };
};

/**
 * Hook to check if element is in viewport
 */
export const useInView = (ref, options = {}) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isInView;
};

export default useScroll;