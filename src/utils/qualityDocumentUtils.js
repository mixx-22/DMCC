/**
 * Quality Document Lifecycle Utilities
 *
 * This module provides utilities for managing the lifecycle of quality documents.
 * Quality documents are identified by: document.type === "file" && document.metadata.fileType.isQualityDocument === true
 */

// Lifecycle Status Constants
export const LIFECYCLE_STATUS = {
  WORKING: -1, // Working draft
  UNDER_REVIEW: 0, // Under review
  APPROVED: 1, // Reserved - not actively used
  PUBLISHED: 2, // Published (final state)
};

// Check-out Status Constants
export const CHECKOUT_STATUS = {
  CHECKED_IN: 0, // Read-only
  CHECKED_OUT: 1, // Editable
};

// Workflow Mode Constants
export const WORKFLOW_MODE = {
  TEAM: "TEAM", // Document owner / submitting team
  CONTROLLER: "CONTROLLER", // Reviewer / approver
  NONE: null, // No active workflow
};

/**
 * Determines if a document is a quality document
 * @param {Object} document - The document to check
 * @returns {boolean} - True if document is a quality document
 */
export const isQualityDocument = (document) => {
  if (!document) return false;

  return (
    document.type === "file" &&
    document.metadata?.fileType?.isQualityDocument === true
  );
};

/**
 * Get the initial lifecycle properties for a new quality document
 * @returns {Object} - Initial lifecycle properties
 */
export const getInitialLifecycleProps = () => ({
  status: LIFECYCLE_STATUS.WORKING,
  checkedOut: CHECKOUT_STATUS.CHECKED_OUT,
  requestId: null,
  mode: WORKFLOW_MODE.NONE,
});

/**
 * Check if a document can be edited based on its lifecycle state
 * @param {Object} document - The document to check
 * @returns {boolean} - True if document can be edited
 */
export const canEditDocument = (document) => {
  if (!isQualityDocument(document)) {
    return true; // Non-quality documents follow normal editing rules
  }

  // Quality documents can only be edited when checked out
  return document.metadata?.checkedOut === CHECKOUT_STATUS.CHECKED_OUT;
};

/**
 * Check if a document can create new versions based on its lifecycle state
 * @param {Object} document - The document to check
 * @returns {boolean} - True if new versions can be created
 */
export const canCreateVersion = (document) => {
  if (!isQualityDocument(document)) {
    return true; // Non-quality documents follow normal versioning rules
  }

  // Version creation allowed only when:
  // - status === -1 (WORKING)
  // - checkedOut === 1 (CHECKED_OUT)
  return (
    document.status === LIFECYCLE_STATUS.WORKING &&
    document.checkedOut === CHECKOUT_STATUS.CHECKED_OUT
  );
};

/**
 * Validate if a lifecycle transition is allowed
 * @param {Object} document - The current document state
 * @param {string} action - The action to perform (submit, discard, endorse, reject, publish, checkout)
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validateTransition = (document, action) => {
  if (!isQualityDocument(document)) {
    return { valid: false, message: "Not a quality document" };
  }

  const { status, metadata } = document;
  const checkedOut = metadata?.checkedOut;
  const requestId = document?.requestData?.requestId || document?.requestId;
  const mode = document?.requestData?.mode || document?.mode;

  switch (action) {
    case "submit":
      // UPLOADED: (status: -1, checkedOut: 1, requestId: null) - Submit allowed
      // REJECTED: (status: -1, checkedOut: 0, requestId: !== null, mode: TEAM) - Submit allowed
      // Both states share status: -1, so we only check that condition
      if (status !== LIFECYCLE_STATUS.WORKING) {
        return {
          valid: false,
          message: "Document must be in working status to submit",
        };
      }
      // Valid from both uploaded (checkedOut: 1, requestId: null) and rejected (checkedOut: 0, requestId: !== null)
      return { valid: true, message: "" };

    case "discard":
      // Allow discard in two scenarios:
      // 1. REJECTED: (status: -1, checkedOut: 0, requestId: !== null, mode: TEAM)
      // 2. NEW WITH REJECT MODE: (status: -1, checkedOut: 1, mode: REJECT)
      if (status !== LIFECYCLE_STATUS.WORKING) {
        return {
          valid: false,
          message: "Document must be in working status to discard",
        };
      }

      // Allow discard if mode is REJECT (regardless of checkedOut status)
      if (mode === "REJECT") {
        return { valid: true, message: "" };
      }

      // Original validation for TEAM mode
      if (checkedOut !== CHECKOUT_STATUS.CHECKED_IN) {
        return {
          valid: false,
          message: "Document must be checked in to discard",
        };
      }
      if (requestId === null) {
        return { valid: false, message: "No active request to discard" };
      }
      if (mode !== WORKFLOW_MODE.TEAM) {
        return { valid: false, message: "Only team mode can discard" };
      }
      return { valid: true, message: "" };

    case "endorse":
      // SUBMITTED: (status: 0, checkedOut: 0, requestId: !== null, mode: TEAM) - Endorse (Approve) allowed
      if (status !== LIFECYCLE_STATUS.UNDER_REVIEW) {
        return {
          valid: false,
          message: "Document must be under review to endorse",
        };
      }
      if (checkedOut !== CHECKOUT_STATUS.CHECKED_IN) {
        return {
          valid: false,
          message: "Document must be checked in to endorse",
        };
      }
      if (requestId === null) {
        return { valid: false, message: "No active request to endorse" };
      }
      if (mode !== WORKFLOW_MODE.TEAM) {
        return { valid: false, message: "Only team mode can be endorsed" };
      }
      return { valid: true, message: "" };

    case "reject":
      // SUBMITTED: (status: 0, checkedOut: 0, requestId: !== null, mode: TEAM) - Reject allowed
      if (status !== LIFECYCLE_STATUS.UNDER_REVIEW) {
        return {
          valid: false,
          message: "Document must be under review to reject",
        };
      }
      if (checkedOut !== CHECKOUT_STATUS.CHECKED_IN) {
        return {
          valid: false,
          message: "Document must be checked in to reject",
        };
      }
      if (requestId === null) {
        return { valid: false, message: "No active request to reject" };
      }
      if (mode !== WORKFLOW_MODE.TEAM) {
        return { valid: false, message: "Only team mode can reject" };
      }
      return { valid: true, message: "" };

    case "publish":
      // ENDORSED: (status: 0, checkedOut: 0, requestId: !== null, mode: CONTROLLER) - Publish allowed
      if (status !== LIFECYCLE_STATUS.UNDER_REVIEW) {
        return {
          valid: false,
          message: "Document must be under review to publish",
        };
      }
      if (checkedOut !== CHECKOUT_STATUS.CHECKED_IN) {
        return {
          valid: false,
          message: "Document must be checked in to publish",
        };
      }
      if (requestId === null) {
        return { valid: false, message: "No active request to publish" };
      }
      if (mode !== WORKFLOW_MODE.CONTROLLER) {
        return { valid: false, message: "Only controller mode can publish" };
      }
      return { valid: true, message: "" };

    case "checkout":
      // PUBLISHED: (status: 2, checkedOut: 0, requestId: null) - Check Out allowed
      if (status !== LIFECYCLE_STATUS.PUBLISHED) {
        return {
          valid: false,
          message: "Only published documents can be checked out",
        };
      }
      if (checkedOut !== CHECKOUT_STATUS.CHECKED_IN) {
        return { valid: false, message: "Document is already checked out" };
      }
      if (requestId !== null) {
        return {
          valid: false,
          message: "Cannot checkout document with active request",
        };
      }
      return { valid: true, message: "" };

    default:
      return { valid: false, message: "Unknown action" };
  }
};

/**
 * Get the expected state after a lifecycle action
 * @param {string} action - The action being performed
 * @param {string} requestId - The request ID (for actions that create/use requests)
 * @returns {Object} - The expected lifecycle state
 */
export const getExpectedState = (action, requestId = null) => {
  switch (action) {
    case "submit":
      return {
        status: LIFECYCLE_STATUS.UNDER_REVIEW,
        checkedOut: CHECKOUT_STATUS.CHECKED_IN,
        requestId: requestId, // Will be set from API response
        mode: WORKFLOW_MODE.TEAM,
      };

    case "discard":
      return {
        status: LIFECYCLE_STATUS.WORKING,
        checkedOut: CHECKOUT_STATUS.CHECKED_OUT,
        requestId: null,
        mode: WORKFLOW_MODE.NONE,
      };

    case "endorse":
      return {
        status: LIFECYCLE_STATUS.UNDER_REVIEW,
        checkedOut: CHECKOUT_STATUS.CHECKED_IN,
        requestId: requestId, // Remains the same
        mode: WORKFLOW_MODE.CONTROLLER,
      };

    case "reject":
      return {
        status: LIFECYCLE_STATUS.WORKING,
        checkedOut: CHECKOUT_STATUS.CHECKED_IN,
        requestId: requestId, // Remains the same
        mode: WORKFLOW_MODE.TEAM,
      };

    case "publish":
      return {
        status: LIFECYCLE_STATUS.PUBLISHED,
        checkedOut: CHECKOUT_STATUS.CHECKED_IN,
        requestId: null,
        mode: WORKFLOW_MODE.NONE,
      };

    case "checkout":
      return {
        status: LIFECYCLE_STATUS.WORKING,
        checkedOut: CHECKOUT_STATUS.CHECKED_OUT,
        requestId: null,
        mode: WORKFLOW_MODE.NONE,
      };

    default:
      return null;
  }
};

/**
 * Get human-readable status label
 * @param {number} status - The status code
 * @returns {string} - The status label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case LIFECYCLE_STATUS.WORKING:
      return "Working";
    case LIFECYCLE_STATUS.UNDER_REVIEW:
      return "Under Review";
    case LIFECYCLE_STATUS.APPROVED:
      return "Approved";
    case LIFECYCLE_STATUS.PUBLISHED:
      return "Published";
    default:
      return "Unknown";
  }
};

/**
 * Get human-readable mode label
 * @param {string} mode - The workflow mode
 * @returns {string} - The mode label
 */
export const getModeLabel = (mode) => {
  switch (mode) {
    case WORKFLOW_MODE.TEAM:
      return "Team Review";
    case WORKFLOW_MODE.CONTROLLER:
      return "Controller Review";
    case WORKFLOW_MODE.NONE:
      return "";
    default:
      return "";
  }
};
