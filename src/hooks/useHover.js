import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to detect hover state
 * @returns {[object, boolean]} [ref, isHovered]
 */
export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    const node = ref.current;
    
    if (node) {
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        node.removeEventListener('mouseenter', handleMouseEnter);
        node.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return [ref, isHovered];
};

export default useHover;