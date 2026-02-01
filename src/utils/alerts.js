/**
 * Centralized SweetAlert2 configurations
 * Provides consistent styling and behavior across the application
 */

import Swal from "sweetalert2";
import { colors } from "../theme/colors";

// Base configuration for all alerts
const baseConfig = {
  buttonsStyling: false,
  backdrop: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
};

// Preset configurations for common alert types
export const alertPresets = {
  // Delete confirmation
  deleteConfirm: {
    ...baseConfig,
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "warning",
    },
  },

  // Generic confirmation
  confirm: {
    ...baseConfig,
    title: "Are you sure?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "info",
    },
  },

  // Success message
  success: {
    ...baseConfig,
    icon: "success",
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  },

  // Error message
  error: {
    ...baseConfig,
    icon: "error",
    confirmButtonText: "OK",
    customClass: {
      popup: "danger",
    },
  },

  // Warning message
  warning: {
    ...baseConfig,
    icon: "warning",
    confirmButtonText: "OK",
    customClass: {
      popup: "warning",
    },
  },

  // Info message
  info: {
    ...baseConfig,
    icon: "info",
    confirmButtonText: "OK",
    customClass: {
      popup: "info",
    },
  },

  // Loading/processing message
  loading: {
    ...baseConfig,
    title: "Processing...",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  },
};

// Helper functions for common alert patterns

/**
 * Show a delete confirmation dialog
 * @param {Object} options - Custom options to override preset
 * @returns {Promise<boolean>} - True if confirmed, false otherwise
 */
export async function confirmDelete(options = {}) {
  const result = await Swal.fire({
    ...alertPresets.deleteConfirm,
    ...options,
  });
  return result.isConfirmed;
}

/**
 * Show a generic confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} - True if confirmed, false otherwise
 */
export async function confirmAction(title, text = "", options = {}) {
  const result = await Swal.fire({
    ...alertPresets.confirm,
    title,
    text,
    ...options,
  });
  return result.isConfirmed;
}

/**
 * Show a success message
 * @param {string} title - Success message title
 * @param {string} text - Success message text
 * @param {Object} options - Additional options
 * @returns {Promise} - Promise that resolves when alert closes
 */
export function showSuccess(title = "Success!", text = "", options = {}) {
  return Swal.fire({
    ...alertPresets.success,
    title,
    text,
    ...options,
  });
}

/**
 * Show an error message
 * @param {string} title - Error message title
 * @param {string} text - Error message text
 * @param {Object} options - Additional options
 * @returns {Promise} - Promise that resolves when alert closes
 */
export function showError(title = "Error!", text = "", options = {}) {
  return Swal.fire({
    ...alertPresets.error,
    title,
    text,
    ...options,
  });
}

/**
 * Show a warning message
 * @param {string} title - Warning message title
 * @param {string} text - Warning message text
 * @param {Object} options - Additional options
 * @returns {Promise} - Promise that resolves when alert closes
 */
export function showWarning(title = "Warning!", text = "", options = {}) {
  return Swal.fire({
    ...alertPresets.warning,
    title,
    text,
    ...options,
  });
}

/**
 * Show an info message
 * @param {string} title - Info message title
 * @param {string} text - Info message text
 * @param {Object} options - Additional options
 * @returns {Promise} - Promise that resolves when alert closes
 */
export function showInfo(title = "Info", text = "", options = {}) {
  return Swal.fire({
    ...alertPresets.info,
    title,
    text,
    ...options,
  });
}

/**
 * Show a loading message
 * @param {string} title - Loading message title
 * @returns {void}
 */
export function showLoading(title = "Processing...") {
  Swal.fire({
    ...alertPresets.loading,
    title,
  });
}

/**
 * Close the currently displayed alert
 * @returns {void}
 */
export function closeAlert() {
  Swal.close();
}

/**
 * Show an alert with input field
 * @param {string} title - Input dialog title
 * @param {string} inputType - Type of input (text, email, password, etc.)
 * @param {Object} options - Additional options
 * @returns {Promise<string|null>} - Input value if confirmed, null if cancelled
 */
export async function showInputDialog(
  title,
  inputType = "text",
  options = {}
) {
  const result = await Swal.fire({
    ...baseConfig,
    title,
    input: inputType,
    showCancelButton: true,
    confirmButtonText: "Submit",
    cancelButtonText: "Cancel",
    inputValidator: (value) => {
      if (!value) {
        return "This field is required";
      }
      return null; // Explicitly return null for valid inputs
    },
    ...options,
  });

  return result.isConfirmed ? result.value : null;
}

export default {
  confirmDelete,
  confirmAction,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  closeAlert,
  showInputDialog,
  alertPresets,
};
