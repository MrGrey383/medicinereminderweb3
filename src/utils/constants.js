/**
 * Application constants
 */

// Medicine Colors
export const MEDICINE_COLORS = [
  { name: 'blue', label: 'Blue', class: 'from-blue-400 to-blue-600' },
  { name: 'purple', label: 'Purple', class: 'from-purple-400 to-purple-600' },
  { name: 'pink', label: 'Pink', class: 'from-pink-400 to-pink-600' },  // fixed duplicate label
  { name: 'green', label: 'Green', class: 'from-green-400 to-green-600' },
  { name: 'orange', label: 'Orange', class: 'from-orange-400 to-orange-600' },
  { name: 'red', label: 'Red', class: 'from-red-400 to-red-600' },
  { name: 'indigo', label: 'Indigo', class: 'from-indigo-400 to-indigo-600' },
  { name: 'yellow', label: 'Yellow', class: 'from-yellow-400 to-yellow-600' }
];

// Frequencies
export const FREQUENCIES = [
  'Once Daily',
  'Twice Daily',
  'Three Times Daily',
  'Four Times Daily',
  'Every 6 Hours',
  'Every 8 Hours',
  'Every 12 Hours',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'As Needed'
];

// Time Slots
export const TIME_SLOTS = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '22:00', label: '10:00 PM' }
];

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  CAREGIVER: 'caregiver',
  ADMIN: 'admin'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  MISSED: 'missed',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info'
};

// Adherence Levels
export const ADHERENCE_LEVELS = {
  EXCELLENT: { min: 80, max: 100, label: 'Excellent', color: 'green' },
  GOOD: { min: 60, max: 79, label: 'Good', color: 'yellow' },
  FAIR: { min: 40, max: 59, label: 'Fair', color: 'orange' },
  POOR: { min: 0, max: 39, label: 'Needs Attention', color: 'red' }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'medicine_reminder_auth_token',
  USER_PREFERENCES: 'medicine_reminder_preferences',
  THEME: 'medicine_reminder_theme',
  LANGUAGE: 'medicine_reminder_language'
};

// API Endpoints  ✔ FIXED FOR VITE
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  AUTH: '/auth',
  MEDICINES: '/medicines',
  NOTIFICATIONS: '/notifications',
  USERS: '/users'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  MEDICINE_ADDED: 'Medicine added successfully!',
  MEDICINE_UPDATED: 'Medicine updated successfully!',
  MEDICINE_DELETED: 'Medicine deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  NOTIFICATION_ENABLED: 'Notifications enabled successfully!'
};

// App Config
export const APP_CONFIG = {
  NAME: 'Medicine Reminder',
  VERSION: '1.0.0',
  AUTHOR: 'Your Name',
  DESCRIPTION: 'Never miss your medicine again',
  SUPPORT_EMAIL: 'support@medicinereminder.com',
  PRIVACY_URL: '/privacy',
  TERMS_URL: '/terms'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'HH:mm',
  DATETIME: 'MM/DD/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss'
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
};

// Theme Colors
export const THEME_COLORS = {
  primary: '#6366f1',
  secondary: '#a855f7',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Z Index
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080
};

// Link Code Settings
export const LINK_CODE = {
  LENGTH: 6,
  EXPIRY_MINUTES: 15,
  CHARACTERS: '0123456789'
};

// Message Types
export const MESSAGE_TYPES = {
  REMINDER: 'reminder',
  ENCOURAGEMENT: 'encouragement',
  CONCERN: 'concern',
  GENERAL: 'general'
};
