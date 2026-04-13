import {
  FaCalendarPlus,
  FaCalendarDay,
  FaCalendarCheck,
  FaCalendarXmark,
  FaBuildingCircleCheck,
  FaBuildingCircleXmark,
  FaPeopleGroup,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaScaleBalanced,
  FaUserCheck,
  FaUserMinus,
  FaFileCircleCheck,
} from "react-icons/fa6";

/**
 * Maps notification types to UI display properties (color, icon).
 * Used by both the NotificationsContext (toast styling) and the
 * Notifications page (icon badges).
 */
const NOTIFICATION_CONFIG = {
  SCHEDULE_CREATED: { color: "blue", icon: FaCalendarPlus },
  SCHEDULE_UPDATED: { color: "blue", icon: FaCalendarDay },
  SCHEDULE_CLOSED: { color: "green", icon: FaCalendarCheck },
  SCHEDULE_DELETED: { color: "red", icon: FaCalendarXmark },
  ORGANIZATION_ADDED: { color: "blue", icon: FaBuildingCircleCheck },
  ORGANIZATION_DELETED: { color: "red", icon: FaBuildingCircleXmark },
  TEAM_ADDED_AS_ORG: { color: "purple", icon: FaPeopleGroup },
  FINDING_ADDED: { color: "orange", icon: FaMagnifyingGlass },
  FINDING_NC_ADDED: { color: "red", icon: FaTriangleExclamation },
  VERDICT_SET: { color: "green", icon: FaScaleBalanced },
  AUDITOR_ASSIGNED: { color: "blue", icon: FaUserCheck },
  AUDITOR_REMOVED: { color: "orange", icon: FaUserMinus },
  ACTION_PLAN_SUBMITTED: { color: "green", icon: FaFileCircleCheck },
  FINDING_VERIFIED: { color: "green", icon: FaFileCircleCheck },
};

export default NOTIFICATION_CONFIG;
