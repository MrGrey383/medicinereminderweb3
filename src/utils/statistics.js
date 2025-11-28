/**
 * Statistics utility functions
 */

/**
 * Calculate average
 * @param {number[]} numbers - Array of numbers
 * @returns {number}
 */
export const average = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

/**
 * Calculate median
 * @param {number[]} numbers - Array of numbers
 * @returns {number}
 */
export const median = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/**
 * Calculate mode
 * @param {number[]} numbers - Array of numbers
 * @returns {number}
 */
export const mode = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  
  const frequency = {};
  let maxFreq = 0;
  let modeValue = numbers[0];
  
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      modeValue = num;
    }
  });
  
  return modeValue;
};

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number}
 */
export const percentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Calculate adherence rate
 * @param {number} taken - Number taken
 * @param {number} total - Total number
 * @returns {number}
 */
export const calculateAdherence = (taken, total) => {
  return percentage(taken, total);
};

/**
 * Get min value
 * @param {number[]} numbers - Array of numbers
 * @returns {number}
 */
export const min = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return Math.min(...numbers);
};

/**
 * Get max value
 * @param {number[]} numbers - Array of numbers
 * @returns {number}
 */
export const max = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return Math.max(...numbers);
};

/**
 * Calculate sum
 * @param {number[]} numbers - Array of numbers
 * @returns {number}
 */
export const sum = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((acc, num) => acc + num, 0);
};

/**
 * Calculate growth rate
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage growth
 */
export const growthRate = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};