/**
 * UI Control Helper Functions
 * 
 * Pure functions for determining UI element states based on business rules.
 * These functions contain NO JSX and are purely functional.
 */

import { getUIControlRule } from "../config/uiControlConfig";

/**
 * Context shape definition (JSDoc for type checking in JavaScript)
 * @typedef {Object} UIControlContext
 * @property {Object} auditSchedule - The current audit schedule
 * @property {string} auditSchedule._id - Schedule ID
 * @property {number} auditSchedule.status - Schedule status (0=ONGOING, 1=CLOSED)
 * @property {Object} [organization] - The current organization (optional)
 * @property {string} [organization._id] - Organization ID
 * @property {number} [organization.status] - Organization status (0=ONGOING, 1=CLOSED)
 * @property {Object} [visit] - The current visit (optional)
 * @property {Object} [visit.date] - Visit date range
 * @property {Array} [visit.findings] - Visit findings
 * @property {string} itemType - The type of item being controlled
 */

/**
 * Determine if an item should be visible
 * @param {UIControlContext} context - The context containing schedule, org, visit, and item type
 * @returns {boolean} True if the item should be visible
 */
export function isVisible(context) {
  if (!context || !context.itemType) {
    return true; // Default to visible if no context
  }

  const rule = getUIControlRule(context.itemType);
  
  try {
    return rule.visible(context);
  } catch (error) {
    console.error("Error evaluating visibility rule:", error);
    return true; // Fail safe - show by default
  }
}

/**
 * Determine if an item should be enabled
 * @param {UIControlContext} context - The context containing schedule, org, visit, and item type
 * @returns {boolean} True if the item should be enabled
 */
export function isEnabled(context) {
  if (!context || !context.itemType) {
    return true; // Default to enabled if no context
  }

  const rule = getUIControlRule(context.itemType);
  
  try {
    return rule.enabled(context);
  } catch (error) {
    console.error("Error evaluating enabled rule:", error);
    return false; // Fail safe - disable on error
  }
}

/**
 * Determine if an item should be editable (not read-only)
 * @param {UIControlContext} context - The context containing schedule, org, visit, and item type
 * @returns {boolean} True if the item should be editable
 */
export function isEditable(context) {
  if (!context || !context.itemType) {
    return true; // Default to editable if no context
  }

  const rule = getUIControlRule(context.itemType);
  
  try {
    return rule.editable(context);
  } catch (error) {
    console.error("Error evaluating editable rule:", error);
    return false; // Fail safe - make read-only on error
  }
}

/**
 * Determine if an item should be read-only
 * @param {UIControlContext} context - The context containing schedule, org, visit, and item type
 * @returns {boolean} True if the item should be read-only
 */
export function isReadOnly(context) {
  return !isEditable(context);
}

/**
 * Get all control states at once
 * @param {UIControlContext} context - The context containing schedule, org, visit, and item type
 * @returns {Object} Object with visible, enabled, editable, and readOnly properties
 */
export function getControlStates(context) {
  return {
    visible: isVisible(context),
    enabled: isEnabled(context),
    editable: isEditable(context),
    readOnly: isReadOnly(context),
  };
}

/**
 * Build a context object from individual parameters
 * @param {Object} options - Options for building context
 * @param {Object} options.auditSchedule - The audit schedule
 * @param {Object} [options.organization] - The organization (optional)
 * @param {Object} [options.visit] - The visit (optional)
 * @param {string} options.itemType - The item type
 * @returns {UIControlContext} The context object
 */
export function buildContext({ auditSchedule, organization, visit, itemType }) {
  return {
    auditSchedule,
    organization,
    visit,
    itemType,
  };
}
