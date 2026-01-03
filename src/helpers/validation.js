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
