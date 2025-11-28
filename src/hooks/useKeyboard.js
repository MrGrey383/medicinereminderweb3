import { useEffect } from 'react';

/**
 * Custom hook to handle keyboard events
 * @param {string} key - Key to listen for
 * @param {function} callback - Function to call when key is pressed
 * @param {object} options - Options { ctrl, shift, alt }
 */
export const useKeyboard = (key, callback, options = {}) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { ctrl = false, shift = false, alt = false } = options;

      const isModifierMatch =
        (!ctrl || event.ctrlKey || event.metaKey) &&
        (!shift || event.shiftKey) &&
        (!alt || event.altKey);

      if (event.key === key && isModifierMatch) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [key, callback, options]);
};

/**
 * Hook for Escape key
 */
export const useEscapeKey = (callback) => {
  useKeyboard('Escape', callback);
};

/**
 * Hook for Enter key
 */
export const useEnterKey = (callback) => {
  useKeyboard('Enter', callback);
};

export default useKeyboard;