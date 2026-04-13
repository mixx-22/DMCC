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
  SCHEDULE_CREATED: {
    color: "blue",
    icon: FaCalendarPlus,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  SCHEDULE_UPDATED: {
    color: "blue",
    icon: FaCalendarDay,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  SCHEDULE_CLOSED: {
    color: "green",
    icon: FaCalendarCheck,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  SCHEDULE_DELETED: {
    color: "red",
    icon: FaCalendarXmark,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  ORGANIZATION_ADDED: {
    color: "blue",
    icon: FaBuildingCircleCheck,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  ORGANIZATION_DELETED: {
    color: "red",
    icon: FaBuildingCircleXmark,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  TEAM_ADDED_AS_ORG: {
    color: "purple",
    icon: FaPeopleGroup,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  FINDING_ADDED: {
    color: "orange",
    icon: FaMagnifyingGlass,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  FINDING_NC_ADDED: {
    color: "red",
    icon: FaTriangleExclamation,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  VERDICT_SET: {
    color: "green",
    icon: FaScaleBalanced,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  AUDITOR_ASSIGNED: {
    color: "blue",
    icon: FaUserCheck,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  AUDITOR_REMOVED: {
    color: "orange",
    icon: FaUserMinus,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  ACTION_PLAN_SUBMITTED: {
    color: "green",
    icon: FaFileCircleCheck,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
  FINDING_VERIFIED: {
    color: "green",
    icon: FaFileCircleCheck,
    path: (data) => `/audit-schedule/${data.scheduleId}`,
  },
};

export default NOTIFICATION_CONFIG;
