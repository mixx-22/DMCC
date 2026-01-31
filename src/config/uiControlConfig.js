/**
 * UI Control Configuration
 * 
 * This file contains the declarative configuration for controlling UI element states
 * based on audit schedule status, organization, visit, and item type.
 * 
 * Status Values:
 * - AuditSchedule.status: 0 = ONGOING, 1 = CLOSED
 * - Organization.status: 0 = ONGOING, 1 = CLOSED
 */

// Audit Schedule Status Constants
export const AUDIT_STATUS = {
  ONGOING: 0,
  CLOSED: 1,
};

// Organization Status Constants
export const ORG_STATUS = {
  ONGOING: 0,
  CLOSED: 1,
};

// Item Types - Define all possible item types in the system
export const ITEM_TYPES = {
  SCHEDULE_DETAILS: "schedule_details",
  ORGANIZATION_DETAILS: "organization_details",
  VISIT_DETAILS: "visit_details",
  FINDING_DETAILS: "finding_details",
  DOCUMENT_UPLOAD: "document_upload",
  VERDICT: "verdict",
  AUDIT_ACTIONS: "audit_actions",
  GENERAL: "general",
};

/**
 * Declarative Configuration Rules
 * 
 * Each rule defines conditions for visibility, enabled, and editable states
 * Format:
 * {
 *   itemType: string,
 *   rules: {
 *     visible: (context) => boolean,
 *     enabled: (context) => boolean,
 *     editable: (context) => boolean,
 *   }
 * }
 * 
 * Context shape:
 * {
 *   auditSchedule: { _id, status, organizations, ... },
 *   organization: { _id, status, team, visits, ... },
 *   visit: { date: {start, end}, findings, ... },
 *   itemType: string
 * }
 */
export const UI_CONTROL_RULES = {
  // Schedule details can be edited only when schedule is ONGOING
  [ITEM_TYPES.SCHEDULE_DETAILS]: {
    visible: () => true,
    enabled: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
    editable: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
  },

  // Organization details editable when both schedule and org are ONGOING
  [ITEM_TYPES.ORGANIZATION_DETAILS]: {
    visible: () => true,
    enabled: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
    editable: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
  },

  // Visit details editable when schedule and org are ONGOING
  [ITEM_TYPES.VISIT_DETAILS]: {
    visible: () => true,
    enabled: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
    editable: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
  },

  // Finding details editable when schedule and org are ONGOING
  [ITEM_TYPES.FINDING_DETAILS]: {
    visible: () => true,
    enabled: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
    editable: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
  },

  // Document upload only available when schedule and org are ONGOING
  [ITEM_TYPES.DOCUMENT_UPLOAD]: {
    visible: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING ||
      ctx.organization?.status === ORG_STATUS.ONGOING,
    enabled: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
    editable: (ctx) =>
      ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING &&
      ctx.organization?.status === ORG_STATUS.ONGOING,
  },

  // Verdict can only be set when schedule is ONGOING but can be viewed when CLOSED
  [ITEM_TYPES.VERDICT]: {
    visible: () => true,
    enabled: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
    editable: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
  },

  // Audit actions (close, reopen, etc.) based on schedule status
  [ITEM_TYPES.AUDIT_ACTIONS]: {
    visible: () => true,
    enabled: () => true, // Actions always enabled, but which actions depend on status
    editable: () => true,
  },

  // Default/General items - always visible and enabled unless schedule is closed
  [ITEM_TYPES.GENERAL]: {
    visible: () => true,
    enabled: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
    editable: (ctx) => ctx.auditSchedule?.status === AUDIT_STATUS.ONGOING,
  },
};

/**
 * Get the configuration rule for a specific item type
 * @param {string} itemType - The type of item
 * @returns {object} The rule configuration or default rule
 */
export function getUIControlRule(itemType) {
  return UI_CONTROL_RULES[itemType] || UI_CONTROL_RULES[ITEM_TYPES.GENERAL];
}
