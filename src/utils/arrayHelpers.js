/**
 * Array utility functions
 */

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to process
 * @returns {Array}
 */
export const removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {object}
 */
export const groupBy = (arr, key) => {
  return arr.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array}
 */
export const sortBy = (arr, key, order = 'asc') => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array}
 */
export const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Shuffle array
 * @param {Array} arr - Array to shuffle
 * @returns {Array}
 */
export const shuffle = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get random item from array
 * @param {Array} arr - Array
 * @returns {any}
 */
export const randomItem = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Flatten nested array
 * @param {Array} arr - Nested array
 * @returns {Array}
 */
export const flatten = (arr) => {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};

/**
 * Find item by key-value
 * @param {Array} arr - Array to search
 * @param {string} key - Key to match
 * @param {any} value - Value to match
 * @returns {any}
 */
export const findByKeyValue = (arr, key, value) => {
  return arr.find(item => item[key] === value);
};

/**
 * Filter array by search term
 * @param {Array} arr - Array to filter
 * @param {string} searchTerm - Search term
 * @param {string[]} keys - Keys to search in
 * @returns {Array}
 */
export const filterBySearch = (arr, searchTerm, keys) => {
  if (!searchTerm) return arr;
  
  const term = searchTerm.toLowerCase();
  return arr.filter(item => {
    return keys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

/**
 * Paginate array
 * @param {Array} arr - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {object} { data, totalPages, currentPage }
 */
export const paginate = (arr, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: arr.slice(startIndex, endIndex),
    totalPages: Math.ceil(arr.length / pageSize),
    currentPage: page,
    totalItems: arr.length
  };
};