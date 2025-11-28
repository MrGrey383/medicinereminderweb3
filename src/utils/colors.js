/**
 * Color utility functions
 */

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color code
 * @returns {object} { r, g, b }
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @returns {string}
 */
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Lighten color
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string}
 */
export const lightenColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = 1 + (percent / 100);
  const r = Math.min(255, Math.round(rgb.r * factor));
  const g = Math.min(255, Math.round(rgb.g * factor));
  const b = Math.min(255, Math.round(rgb.b * factor));
  
  return rgbToHex(r, g, b);
};

/**
 * Darken color
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string}
 */
export const darkenColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = 1 - (percent / 100);
  const r = Math.max(0, Math.round(rgb.r * factor));
  const g = Math.max(0, Math.round(rgb.g * factor));
  const b = Math.max(0, Math.round(rgb.b * factor));
  
  return rgbToHex(r, g, b);
};

/**
 * Get contrast color (black or white)
 * @param {string} hex - Hex color code
 * @returns {string}
 */
export const getContrastColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Generate random color
 * @returns {string}
 */
export const randomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Get color palette
 * @param {string} baseColor - Base hex color
 * @param {number} count - Number of colors
 * @returns {string[]}
 */
export const getColorPalette = (baseColor, count = 5) => {
  const colors = [];
  const step = 100 / (count - 1);
  
  for (let i = 0; i < count; i++) {
    if (i < count / 2) {
      colors.push(lightenColor(baseColor, step * (count / 2 - i)));
    } else if (i === Math.floor(count / 2)) {
      colors.push(baseColor);
    } else {
      colors.push(darkenColor(baseColor, step * (i - count / 2)));
    }
  }
  
  return colors;
};