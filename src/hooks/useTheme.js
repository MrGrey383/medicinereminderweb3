import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for theme management
 * @returns {object} Theme state and methods
 */
export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [systemTheme, setSystemTheme] = useState('light');

  useEffect(() => {
    // Detect system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    const activeTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(activeTheme);
  }, [theme, systemTheme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const activeTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme,
    setTheme,
    toggleTheme,
    activeTheme,
    isDark: activeTheme === 'dark',
    isLight: activeTheme === 'light'
  };
};

export default useTheme;