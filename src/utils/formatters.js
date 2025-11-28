/**
 * Formatting utility functions
 */

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Truncate text
 */
export const truncateText = (text, length, suffix = "...") => {
  if (!text) return "";
  if (text.length <= length) return text;

  return text.substring(0, length).trim() + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 */
export const capitalizeWords = (text) => {
  if (!text) return "";
  return text.split(" ").map(word => capitalizeFirst(word)).join(" ");
};

/**
 * Convert to kebab-case
 */
export const toKebabCase = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

/**
 * Convert to camelCase
 */
export const toCamelCase = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Pluralize word
 */
export const pluralize = (word, count) => {
  if (count === 1) return word;

  if (word.endsWith("y")) {
    return word.slice(0, -1) + "ies";
  }
  if (word.endsWith("s") || word.endsWith("x") || word.endsWith("ch")) {
    return word + "es";
  }
  return word + "s";
};

/**
 * Format duration in minutes
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} ${pluralize("minute", minutes)}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} ${pluralize("hour", hours)}`;
  }

  return `${hours} ${pluralize("hour", hours)} ${mins} ${pluralize("minute", mins)}`;
};

/**
 * Format list with commas and 'and'
 */
export const formatList = (items) => {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const last = items[items.length - 1];
  const rest = items.slice(0, -1);

  return `${rest.join(", ")}, and ${last}`;
};

/**
 * Strip HTML tags
 */
export const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
};

/**
 * Highlight search term
 */
export const highlightText = (text, search) => {
  if (!text || !search) return text;

  const regex = new RegExp(`(${search})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

/**
 * Format address object
 */
export const formatAddress = (address) => {
  if (!address) return "";

  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country
  ].filter(Boolean);

  return parts.join(", ");
};

/**
 * Format credit card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return "";

  const cleaned = cardNumber.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g) || [];

  return groups.join(" ");
};

/**
 * Mask sensitive text
 */
export const maskData = (text, visibleChars = 4) => {
  if (!text) return "";
  if (text.length <= visibleChars) return text;

  const masked = "*".repeat(text.length - visibleChars);
  const visible = text.slice(-visibleChars);

  return masked + visible;
};
