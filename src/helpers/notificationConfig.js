/**
 * Maps notification types to UI display properties (color, label).
 * Used by both the NotificationsContext (toast styling) and the
 * Notifications page (badges).
 */
const NOTIFICATION_CONFIG = {
  SCHEDULE_CREATED: { color: "blue", label: "Schedule Created" },
  SCHEDULE_UPDATED: { color: "blue", label: "Schedule Updated" },
  SCHEDULE_CLOSED: { color: "green", label: "Schedule Closed" },
  SCHEDULE_DELETED: { color: "red", label: "Schedule Deleted" },
  ORGANIZATION_ADDED: { color: "blue", label: "Organization Added" },
  ORGANIZATION_DELETED: { color: "red", label: "Organization Removed" },
  TEAM_ADDED_AS_ORG: { color: "purple", label: "Team Added to Audit" },
  FINDING_ADDED: { color: "orange", label: "Finding Added" },
  FINDING_NC_ADDED: { color: "red", label: "Non-Compliance Finding Added" },
  VERDICT_SET: { color: "green", label: "Verdict Set" },
  AUDITOR_ASSIGNED: { color: "blue", label: "Auditor Assigned" },
  AUDITOR_REMOVED: { color: "orange", label: "Auditor Removed" },
  ACTION_PLAN_SUBMITTED: { color: "green", label: "Action Plan Submitted" },
  FINDING_VERIFIED: { color: "green", label: "Action Plan Verified" },
};

export default NOTIFICATION_CONFIG;
