import { useState, useCallback } from "react";

/**
 * Custom hook for managing edit mode state
 * Useful for pages/components that toggle between view and edit modes
 * 
 * @param {boolean} initialMode - Initial edit mode state (default: false)
 * @returns {Object} - { isEditMode, enableEditMode, disableEditMode, toggleEditMode }
 */
export function useEditMode(initialMode = false) {
  const [isEditMode, setIsEditMode] = useState(initialMode);

  const enableEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  return {
    isEditMode,
    enableEditMode,
    disableEditMode,
    toggleEditMode,
  };
}

/**
 * Custom hook for managing form state with validation
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function that returns errors object
 * @returns {Object} - Form state and handlers
 */
export function useFormState(initialValues = {}, validateFn = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const validate = useCallback(() => {
    if (!validateFn) return true;
    
    const validationErrors = validateFn(values);
    setErrors(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  }, [validateFn, values]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
    setFieldValue,
    setFieldError,
  };
}
