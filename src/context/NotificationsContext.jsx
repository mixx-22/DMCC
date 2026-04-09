import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import apiService from "../services/api";
import { getSocket } from "../services/socket";
import NOTIFICATION_CONFIG from "../helpers/notificationConfig";
import { NotificationsContext } from "./_contexts";
import { useUser } from "./_useContext";

const NOTIFICATIONS_ENDPOINT = "/notifications";

// Socket listener may need a few retries because the socket connection
// is initiated in UserContext and may not be ready when this effect runs.
const SOCKET_RETRY_INTERVAL_MS = 500;
const SOCKET_MAX_RETRIES = 10;

// Map notification color → toast border style
const TOAST_BORDER_COLORS = {
  red: "4px solid var(--chakra-colors-red-500)",
  orange: "4px solid var(--chakra-colors-orange-500)",
  green: "4px solid var(--chakra-colors-green-500)",
  purple: "4px solid var(--chakra-colors-purple-500)",
};

const getBorderColorForToast = (color) => TOAST_BORDER_COLORS[color] || null;

// ── Reducer ──────────────────────────────────────────────────────────
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.notifications,
        meta: action.meta,
        unreadCount: action.unreadCount ?? state.unreadCount,
        isLoading: false,
      };
    case "PREPEND_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.count };
    case "MARK_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n._id === action.id ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case "DELETE_NOTIFICATION": {
      const removed = state.notifications.find((n) => n._id === action.id);
      return {
        ...state,
        notifications: state.notifications.filter((n) => n._id !== action.id),
        unreadCount:
          removed && !removed.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.value };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "SET_PAGE":
      return { ...state, page: action.page };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  meta: { total: 0, page: 1, limit: 20, totalPages: 1 },
  isLoading: false,
  filter: "all", // "all" | "unread" | "read"
  page: 1,
};

// ── Provider ─────────────────────────────────────────────────────────
export const NotificationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, authToken } = useUser();
  const listenerAttached = useRef(false);

  // ---- Fetch notifications (paginated, filtered) --------------------
  const fetchNotifications = useCallback(
    async (page = 1, filter = "all") => {
      dispatch({ type: "SET_LOADING", value: true });
      try {
        const params = { page, limit: 20 };
        if (filter === "unread") params.read = "false";
        else if (filter === "read") params.read = "true";

        const res = await apiService.request(NOTIFICATIONS_ENDPOINT, {
          params,
        });

        dispatch({
          type: "SET_NOTIFICATIONS",
          notifications: res.data ?? [],
          meta: res.meta ?? {
            total: 0,
            page,
            limit: 20,
            totalPages: 1,
          },
          unreadCount: res.unreadCount ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        dispatch({ type: "SET_LOADING", value: false });
      }
    },
    [],
  );

  // ---- Fetch unread count only --------------------------------------
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiService.request(
        `${NOTIFICATIONS_ENDPOINT}/unread-count`,
      );
      dispatch({ type: "SET_UNREAD_COUNT", count: res.unreadCount ?? 0 });
    } catch {
      // silent
    }
  }, []);

  // ---- Mark single notification as read ----------------------------
  const markAsRead = useCallback(
    async (id) => {
      try {
        await apiService.request(`${NOTIFICATIONS_ENDPOINT}/${id}/read`, {
          method: "PATCH",
        });
        dispatch({ type: "MARK_READ", id });
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },
    [],
  );

  // ---- Mark all as read --------------------------------------------
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.request(`${NOTIFICATIONS_ENDPOINT}/read-all`, {
        method: "PATCH",
      });
      dispatch({ type: "MARK_ALL_READ" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, []);

  // ---- Delete a notification ---------------------------------------
  const deleteNotification = useCallback(async (id) => {
    try {
      await apiService.request(`${NOTIFICATIONS_ENDPOINT}/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "DELETE_NOTIFICATION", id });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  // ---- Filter / page helpers ---------------------------------------
  const setFilter = useCallback(
    (filter) => {
      dispatch({ type: "SET_FILTER", filter });
      dispatch({ type: "SET_PAGE", page: 1 });
      fetchNotifications(1, filter);
    },
    [fetchNotifications],
  );

  const setPage = useCallback(
    (page) => {
      dispatch({ type: "SET_PAGE", page });
      fetchNotifications(page, state.filter);
    },
    [fetchNotifications, state.filter],
  );

  // ---- Socket listener for real-time notifications ------------------
  useEffect(() => {
    if (!user || !authToken) {
      listenerAttached.current = false;
      return;
    }

    const attachListener = () => {
      const socket = getSocket();
      if (!socket || listenerAttached.current) return;

      const handleNotification = (notification) => {
        dispatch({ type: "PREPEND_NOTIFICATION", notification });

        // Show in-app toast via sonner
        const config = NOTIFICATION_CONFIG[notification.type] || {};
        const borderColor = getBorderColorForToast(config.color);
        toast(notification.title, {
          description: notification.message,
          duration: 6000,
          ...(borderColor ? { style: { borderLeft: borderColor } } : {}),
        });

        // Browser notification (if tab is hidden & permission granted)
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted" &&
          document.hidden
        ) {
          const browserNotif = new Notification(notification.title, {
            body: notification.message,
            tag: notification._id,
          });
          browserNotif.onclick = () => {
            window.focus();
          };
        }
      };

      socket.on("notification", handleNotification);
      listenerAttached.current = true;

      return () => {
        socket.off("notification", handleNotification);
        listenerAttached.current = false;
      };
    };

    let cleanup;
    let retries = 0;
    const interval = setInterval(() => {
      cleanup = attachListener();
      retries++;
      if (listenerAttached.current || retries >= SOCKET_MAX_RETRIES) {
        clearInterval(interval);
      }
    }, SOCKET_RETRY_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (typeof cleanup === "function") cleanup();
      listenerAttached.current = false;
    };
  }, [user, authToken]);

  // ---- Initial fetch when user logs in / provider mounts ------------
  useEffect(() => {
    if (user && authToken) {
      fetchNotifications(1, "all");
    } else {
      dispatch({ type: "RESET" });
    }
  }, [user, authToken, fetchNotifications]);

  // ---- Request browser notification permission after login ----------
  useEffect(() => {
    if (
      user &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [user]);

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setFilter,
    setPage,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
