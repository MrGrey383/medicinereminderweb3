import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook for searching/filtering data
 * @param {Array} data - Data to search
 * @param {string[]} searchKeys - Keys to search in
 * @returns {object} Search state and methods
 */
export const useSearch = (data, searchKeys) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data;

    const term = debouncedSearchTerm.toLowerCase();

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(term);
      });
    });
  }, [data, debouncedSearchTerm, searchKeys]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredData,
    resultCount: filteredData.length,
    hasResults: filteredData.length > 0
  };
};

export default useSearch;