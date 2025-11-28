/**
 * Date utility functions for the Medicine Reminder app
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is yesterday
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isYesterday = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Check if date is tomorrow
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isTomorrow = (date) => {
  if (!date) return false;
  
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Get relative time string (e.g., "5 mins ago", "in 2 hours")
 * @param {Date|string} date - Date to compare
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  return formatDate(date, 'short');
};

/**
 * Get time until date (e.g., "in 5 mins", "in 2 hours")
 * @param {Date|string} date - Future date
 * @returns {string}
 */
export const getTimeUntil = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((d - now) / 1000);
  
  if (diffInSeconds < 0) {
    return 'passed';
  }
  
  if (diffInSeconds < 60) {
    return 'less than a minute';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `in ${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `in ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `in ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
};

/**
 * Get next occurrence of a specific time today or tomorrow
 * @param {string} time - Time in HH:MM format
 * @returns {Date}
 */
export const getNextOccurrence = (time) => {
  if (!time) return new Date();
  
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  
  next.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, set to tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
};

/**
 * Check if a time has passed today
 * @param {string} time - Time in HH:MM format
 * @returns {boolean}
 */
export const hasTimePassed = (time) => {
  if (!time) return false;
  
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const targetTime = new Date();
  
  targetTime.setHours(hours, minutes, 0, 0);
  
  return now > targetTime;
};

/**
 * Get day of week
 * @param {Date|string} date - Date to check
 * @returns {string} Day name
 */
export const getDayOfWeek = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return days[d.getDay()];
};

/**
 * Get short day of week
 * @param {Date|string} date - Date to check
 * @returns {string} Short day name
 */
export const getShortDayOfWeek = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return days[d.getDay()];
};

/**
 * Get month name
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month name
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[monthIndex] || '';
};

/**
 * Get dates in current week
 * @returns {Date[]} Array of dates
 */
export const getCurrentWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const dates = [];
  
  // Start from Sunday
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + i);
    dates.push(date);
  }
  
  return dates;
};

/**
 * Get dates in current month
 * @returns {Date[]} Array of dates
 */
export const getCurrentMonthDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day));
  }
  
  return dates;
};

/**
 * Parse time string to minutes
 * @param {string} time - Time in HH:MM format
 * @returns {number} Total minutes
 */
export const timeToMinutes = (time) => {
  if (!time) return 0;
  
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 * @param {number} minutes - Total minutes
 * @returns {string} Time in HH:MM format
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Add days to date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to subtract
 * @returns {Date}
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Get greeting based on time of day
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};