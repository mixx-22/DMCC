/**
 * Centralized localStorage utilities with error handling and type safety
 */

/**
 * Safely get an item from localStorage and parse it as JSON
 * 
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} - Parsed value or default value
 */
export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage with JSON stringification
 * 
 * @param {string} key - The localStorage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} - True if successful, false otherwise
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * 
 * @param {string} key - The localStorage key
 * @returns {boolean} - True if successful, false otherwise
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * 
 * @returns {boolean} - True if successful, false otherwise
 */
export function clear() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * 
 * @param {string} key - The localStorage key
 * @returns {boolean} - True if key exists, false otherwise
 */
export function hasItem(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Get multiple items from localStorage
 * 
 * @param {string[]} keys - Array of localStorage keys
 * @returns {Object} - Object with keys and their values
 */
export function getItems(keys) {
  const result = {};
  keys.forEach((key) => {
    result[key] = getItem(key);
  });
  return result;
}

/**
 * Set multiple items in localStorage
 * 
 * @param {Object} items - Object with key-value pairs to store
 * @returns {boolean} - True if all successful, false if any fail
 */
export function setItems(items) {
  let allSuccessful = true;
  try {
    Object.entries(items).forEach(([key, value]) => {
      const success = setItem(key, value);
      if (!success) {
        allSuccessful = false;
      }
    });
    return allSuccessful;
  } catch (error) {
    console.error("Error setting multiple localStorage items:", error);
    return false;
  }
}

/**
 * Create a namespaced storage manager
 * Useful for grouping related localStorage keys
 * 
 * @param {string} namespace - Namespace prefix for keys
 * @returns {Object} - Storage manager with namespaced methods
 */
export function createNamespacedStorage(namespace) {
  const prefixKey = (key) => `${namespace}:${key}`;

  return {
    get: (key, defaultValue) => getItem(prefixKey(key), defaultValue),
    set: (key, value) => setItem(prefixKey(key), value),
    remove: (key) => removeItem(prefixKey(key)),
    has: (key) => hasItem(prefixKey(key)),
    clear: () => {
      // Clear only items with this namespace
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`${namespace}:`)) {
          localStorage.removeItem(key);
        }
      });
    },
  };
}
