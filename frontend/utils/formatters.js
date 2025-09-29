import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return 'Not specified';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date to show relative time (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeDate(date) {
  if (!date) return 'Unknown';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Unknown';
  }
}

/**
 * Format salary range object to readable string
 * @param {Object} salaryRange - Object with min, max, and currency properties
 * @returns {string} Formatted salary string
 */
export function formatSalary(salaryRange) {
  if (!salaryRange) return 'Not specified';
  
  const { min, max, currency = 'MYR' } = salaryRange;
  
  if (!min && !max) return 'Not specified';
  
  const formatAmount = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  if (min && max) {
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  } else if (min) {
    return `From ${formatAmount(min)}`;
  } else if (max) {
    return `Up to ${formatAmount(max)}`;
  }
  
  return 'Not specified';
}

/**
 * Format duration object to readable string
 * @param {Object} duration - Object with value and unit properties
 * @returns {string} Formatted duration string
 */
export function formatDuration(duration) {
  if (!duration || !duration.value) return 'Not specified';
  
  const { value, unit = 'months' } = duration;
  
  if (value === 1) {
    return `1 ${unit.slice(0, -1)}`; // Remove 's' for singular
  }
  
  return `${value} ${unit}`;
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format phone number to a standard format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Malaysian phone numbers
  if (cleaned.startsWith('60')) {
    // International format
    const number = cleaned.substring(2);
    if (number.length === 9 || number.length === 10) {
      return `+60 ${number.substring(0, 1)}-${number.substring(1, 4)} ${number.substring(4)}`;
    }
  } else if (cleaned.startsWith('0')) {
    // Local format
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
  }
  
  return phone; // Return original if no format matches
}
