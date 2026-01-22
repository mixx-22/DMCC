/**
 * Validation utilities for login system
 */

/**
 * Validates if a string is in a valid email format
 * A valid email contains an "@" symbol and a domain
 * @param {string} email - The email string to validate
 * @returns {boolean} - True if valid email format, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Basic email validation: must contain @ and a domain after @
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates if a string is in a valid username format
 * A valid username consists of alphanumeric characters, optionally containing underscores ("_")
 * @param {string} username - The username string to validate
 * @returns {boolean} - True if valid username format, false otherwise
 */
export const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  
  // Username can only contain alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username.trim());
};

/**
 * Detects the input type (email or username) and validates it
 * @param {string} input - The input string to validate
 * @returns {object} - Object with validation result { isValid, type, error }
 */
export const validateLoginInput = (input) => {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      type: null,
      error: 'Input is required'
    };
  }
  
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    return {
      isValid: false,
      type: null,
      error: 'Input cannot be empty'
    };
  }
  
  // Check if it looks like an email (contains @)
  if (trimmedInput.includes('@')) {
    if (isValidEmail(trimmedInput)) {
      return {
        isValid: true,
        type: 'email',
        error: null
      };
    } else {
      return {
        isValid: false,
        type: 'email',
        error: 'Invalid email format. Please enter a valid email address (e.g., example@mail.com)'
      };
    }
  }
  
  // Otherwise, treat it as a username
  if (isValidUsername(trimmedInput)) {
    return {
      isValid: true,
      type: 'username',
      error: null
    };
  } else {
    return {
      isValid: false,
      type: 'username',
      error: 'Invalid username format. Username can only contain letters, numbers, and underscores (e.g., user_name123)'
    };
  }
};

/**
 * Common validation utilities
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if a string is a valid phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Matches formats like: +639123456789, 09123456789, 9123456789
  const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * Check if a string meets minimum length requirement
 * @param {string} value - String to check
 * @param {number} minLength - Minimum length required
 * @returns {boolean} - True if meets requirement
 */
export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Check if a string meets maximum length requirement
 * @param {string} value - String to check
 * @param {number} maxLength - Maximum length allowed
 * @returns {boolean} - True if meets requirement
 */
export const hasMaxLength = (value, maxLength) => {
  return !value || value.length <= maxLength;
};

/**
 * Check if a value is within a numeric range
 * @param {number} value - Number to check
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} - True if within range
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate a required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
  return isEmpty(value) ? `${fieldName} is required` : null;
};

/**
 * Validate an email field
 * @param {string} email - Email to validate
 * @param {boolean} required - Whether the field is required
 * @returns {string|null} - Error message or null if valid
 */
export const validateEmail = (email, required = true) => {
  if (!email || email.trim() === '') {
    return required ? 'Email is required' : null;
  }
  return isValidEmail(email) ? null : 'Invalid email format';
};

/**
 * Validate a phone number field
 * @param {string} phone - Phone to validate
 * @param {boolean} required - Whether the field is required
 * @returns {string|null} - Error message or null if valid
 */
export const validatePhone = (phone, required = true) => {
  if (!phone || phone.trim() === '') {
    return required ? 'Phone number is required' : null;
  }
  return isValidPhone(phone) ? null : 'Invalid phone number format';
};

/**
 * Create a validation function for a specific field
 * @param {Array} rules - Array of validation rule functions
 * @returns {Function} - Validation function that returns first error or null
 */
export const createFieldValidator = (rules) => {
  return (value) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };
};

/**
 * Validate multiple fields at once
 * @param {Object} values - Object with field values
 * @param {Object} validators - Object with field validators
 * @returns {Object} - Object with field errors
 */
export const validateFields = (values, validators) => {
  const errors = {};
  Object.keys(validators).forEach((field) => {
    const validator = validators[field];
    const error = validator(values[field]);
    if (error) {
      errors[field] = error;
    }
  });
  return errors;
};
