/**
 * Simple encryption utilities (NOT for production security)
 * For production, use proper encryption libraries
 */

/**
 * Simple Base64 encode
 * @param {string} text - Text to encode
 * @returns {string}
 */
export const encode = (text) => {
  try {
    return btoa(text);
  } catch (error) {
    console.error('Encoding error:', error);
    return text;
  }
};

/**
 * Simple Base64 decode
 * @param {string} encoded - Encoded text
 * @returns {string}
 */
export const decode = (encoded) => {
  try {
    return atob(encoded);
  } catch (error) {
    console.error('Decoding error:', error);
    return encoded;
  }
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string}
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate UUID v4
 * @returns {string}
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Hash string (simple - NOT cryptographically secure)
 * @param {string} str - String to hash
 * @returns {number}
 */
export const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};