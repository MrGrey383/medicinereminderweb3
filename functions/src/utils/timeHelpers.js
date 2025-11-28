/**
 * Time Helper Functions
 */

/**
 * Get current time in HH:MM format
 * @param {Date} date - Date object
 * @returns {string} Time in HH:MM format
 */
exports.getCurrentTime = (date = new Date()) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Check if it's time to take medicine
 * @param {string} medicineTime - Medicine scheduled time (HH:MM)
 * @param {string} currentTime - Current time (HH:MM)
 * @returns {boolean}
 */
exports.isTimeToTakeMedicine = (medicineTime, currentTime) => {
  return medicineTime === currentTime;
};

/**
 * Parse time string to minutes
 * @param {string} time - Time in HH:MM format
 * @returns {number} Total minutes
 */
exports.timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if time is within range
 * @param {string} time - Time to check
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {boolean}
 */
exports.isTimeInRange = (time, startTime, endTime) => {
  const timeMinutes = exports.timeToMinutes(time);
  const startMinutes = exports.timeToMinutes(startTime);
  const endMinutes = exports.timeToMinutes(endTime);

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Get time difference in minutes
 * @param {string} time1 - First time (HH:MM)
 * @param {string} time2 - Second time (HH:MM)
 * @returns {number} Difference in minutes
 */
exports.getTimeDifference = (time1, time2) => {
  const minutes1 = exports.timeToMinutes(time1);
  const minutes2 = exports.timeToMinutes(time2);
  return Math.abs(minutes1 - minutes2);
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
exports.formatDate = (date) => {
  const options = { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
exports.isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get day of week
 * @param {Date} date - Date object
 * @returns {string} Day name
 */
exports.getDayOfWeek = (date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

/**
 * Add minutes to time
 * @param {string} time - Time in HH:MM format
 * @param {number} minutesToAdd - Minutes to add
 * @returns {string} New time in HH:MM format
 */
exports.addMinutes = (time, minutesToAdd) => {
  const totalMinutes = exports.timeToMinutes(time) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

/**
 * Check if time has passed today
 * @param {string} time - Time in HH:MM format
 * @returns {boolean}
 */
exports.hasTimePassed = (time) => {
  const now = new Date();
  const currentTime = exports.getCurrentTime(now);
  const currentMinutes = exports.timeToMinutes(currentTime);
  const targetMinutes = exports.timeToMinutes(time);
  
  return currentMinutes > targetMinutes;
};