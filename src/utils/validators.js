/**
 * Validation utility functions
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate password strength
 * @param {string} password - Password to check
 * @returns {number} Strength score (0-100)
 */
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length
  if (password.length >= 6) strength += 20;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // Complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
};

/**
 * Validate medicine name
 * @param {string} name - Medicine name
 * @returns {object} { isValid, error }
 */
export const validateMedicineName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Medicine name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Medicine name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Medicine name must be less than 100 characters' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate dosage
 * @param {string} dosage - Dosage
 * @returns {object} { isValid, error }
 */
export const validateDosage = (dosage) => {
  if (!dosage || !dosage.trim()) {
    return { isValid: false, error: 'Dosage is required' };
  }
  
  if (dosage.trim().length > 50) {
    return { isValid: false, error: 'Dosage must be less than 50 characters' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string
 * @returns {object} { isValid, error }
 */
export const validateTime = (time) => {
  if (!time) {
    return { isValid: false, error: 'Time is required' };
  }
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Invalid time format (use HH:MM)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const validateURL = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of field
 * @returns {object} { isValid, error }
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} { isValid, error }
 */
export const validateRange = (value, min, max) => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' };
  }
  
  if (num < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }
  
  if (num > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

/**
 * Validate form data
 * @param {object} data - Form data
 * @param {object} rules - Validation rules
 * @returns {object} { isValid, errors }
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !value) {
      errors[field] = `${rule.label || field} is required`;
      return;
    }
    
    if (rule.email && !validateEmail(value)) {
      errors[field] = 'Invalid email address';
      return;
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Must be at least ${rule.minLength} characters`;
      return;
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `Must be less than ${rule.maxLength} characters`;
      return;
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || 'Invalid format';
      return;
    }
    
    if (rule.custom && !rule.custom(value)) {
      errors[field] = rule.message || 'Invalid value';
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};