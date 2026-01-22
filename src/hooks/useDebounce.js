import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for debouncing a value
 * Useful for search inputs and other scenarios where you want to delay updates
 * 
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {*} - The debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing a callback function
 * Useful when you want to debounce a function call instead of a value
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500)
 * @returns {Function} - The debounced function
 */
export function useDebouncedCallback(callback, delay = 500) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}
