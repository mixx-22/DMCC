import { useCallback } from "react";
import Swal from "sweetalert2";

/**
 * Custom hook for showing delete confirmation dialogs
 * Provides a consistent interface for delete operations across the app
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dialog title (default: "Are you sure?")
 * @param {string} options.text - Dialog text
 * @param {string} options.confirmButtonText - Confirm button text (default: "Yes, delete it!")
 * @param {string} options.cancelButtonText - Cancel button text (default: "Cancel")
 * @param {Function} options.onConfirm - Callback when user confirms
 * @param {Function} options.onCancel - Callback when user cancels (optional)
 * 
 * @returns {Function} - Function to show the confirmation dialog
 */
export function useDeleteConfirmation({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmButtonText = "Yes, delete it!",
  cancelButtonText = "Cancel",
  onConfirm,
  onCancel,
} = {}) {
  const showConfirmation = useCallback(
    async (customOptions = {}) => {
      const result = await Swal.fire({
        title: customOptions.title || title,
        text: customOptions.text || text,
        icon: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonText: customOptions.confirmButtonText || confirmButtonText,
        cancelButtonText: customOptions.cancelButtonText || cancelButtonText,
        customClass: {
          popup: "warning",
        },
        ...customOptions,
      });

      if (result.isConfirmed) {
        if (onConfirm) {
          await onConfirm();
        }
        return true;
      } else if (result.isDismissed && onCancel) {
        onCancel();
      }
      
      return false;
    },
    [title, text, confirmButtonText, cancelButtonText, onConfirm, onCancel]
  );

  return showConfirmation;
}

/**
 * Custom hook for showing generic confirmation dialogs
 * More flexible than useDeleteConfirmation for various confirmation scenarios
 * 
 * @returns {Function} - Function to show confirmation dialog with custom options
 */
export function useConfirmation() {
  const showConfirmation = useCallback(async (options = {}) => {
    const {
      title = "Are you sure?",
      text = "",
      icon = "question",
      confirmButtonText = "Confirm",
      cancelButtonText = "Cancel",
      ...rest
    } = options;

    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText,
      cancelButtonText,
      customClass: {
        popup: "info",
      },
      ...rest,
    });

    return result.isConfirmed;
  }, []);

  return showConfirmation;
}

/**
 * Custom hook for showing success messages
 * 
 * @returns {Function} - Function to show success message
 */
export function useSuccessMessage() {
  const showSuccess = useCallback((title = "Success!", text = "", options = {}) => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      buttonsStyling: false,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      ...options,
    });
  }, []);

  return showSuccess;
}

/**
 * Custom hook for showing error messages
 * 
 * @returns {Function} - Function to show error message
 */
export function useErrorMessage() {
  const showError = useCallback((title = "Error!", text = "", options = {}) => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      buttonsStyling: false,
      confirmButtonText: "OK",
      customClass: {
        popup: "danger",
      },
      ...options,
    });
  }, []);

  return showError;
}
