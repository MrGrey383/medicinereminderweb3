import { useState } from 'react';

/**
 * Custom hook for clipboard operations
 * @param {number} resetDelay - Time to reset copied state (ms)
 * @returns {object} Clipboard state and methods
 */
export const useClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setError(null);

      // Reset copied state after delay
      setTimeout(() => {
        setCopied(false);
      }, resetDelay);

      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      setError(err.message);
      setCopied(false);
      return false;
    }
  };

  const readFromClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        return text;
      }
      return null;
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError(err.message);
      return null;
    }
  };

  return {
    copied,
    error,
    copyToClipboard,
    readFromClipboard
  };
};

export default useClipboard;