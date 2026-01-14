import {
  useEffect,
  useCallback,
  useReducer,
  createContext,
  useContext,
} from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock user for development
const MOCK_USER = {
  _id: "user-mock-1",
  userId: "EMP001",
  employeeId: "EMP001",
  username: "johndoe-EMP001",
  firstName: "John",
  middleName: "M",
  lastName: "Doe",
  email: "john.doe@example.com",
  role: [
    { id: "1", title: "Admin" },
    { id: "2", title: "Manager" },
  ],
  isActive: true,
  department: "Engineering",
  position: "Senior Developer",
  contactNumber: "+639171234567",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

// Helper to normalize roles - handles both array of objects and array of IDs
const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];

  if (roles.length === 0) return [];

  if (typeof roles[0] === "object" && roles[0] !== null && "id" in roles[0]) {
    return roles;
  }

  const MOCK_ROLES_MAP = {
    1: { id: "1", title: "Admin" },
    2: { id: "2", title: "Manager" },
    3: { id: "3", title: "User" },
    4: { id: "4", title: "Supervisor" },
    5: { id: "5", title: "Analyst" },
  };

  return roles
    .map((id) => MOCK_ROLES_MAP[id] || { id, title: `${id}` })
    .filter(Boolean);
};

// Helper to extract only role IDs from role objects for API submission
const extractRoleIds = (roles) => {
  if (!Array.isArray(roles)) return [];

  if (roles.length === 0) return [];

  if (typeof roles[0] === "object" && roles[0] !== null && "id" in roles[0]) {
    return roles.map((role) => role.id);
  }

  return roles;
};

const UserProfileContext = createContext();

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_USER":
      return {
        ...state,
        user: payload.user,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: payload.value,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: payload.value,
      };
    case "SET_SAVING":
      return {
        ...state,
        saving: payload.value,
      };
    default:
      return state;
  }
};

const initialUserData = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  employeeId: "",
  username: "",
  department: "",
  position: "",
  contactNumber: "",
  role: [],
  isActive: true,
  profilePicture: "",
  createdAt: null,
  updatedAt: null,
};

const initialState = {
  user: initialUserData,
  loading: false,
  error: null,
  saving: false,
};

export const UserProfileProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchUser = useCallback(async (userId) => {
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      setTimeout(() => {
        dispatch({
          type: "SET_USER",
          user: { ...MOCK_USER, _id: userId },
        });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }

    try {
      const data = await apiService.request(`${USERS_ENDPOINT}/${userId}`, {
        method: "GET",
      });

      const fetchedUser = data.user || data;
      if (fetchedUser.role) {
        fetchedUser.role = normalizeRoles(fetchedUser.role);
      }

      dispatch({
        type: "SET_USER",
        user: fetchedUser,
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to fetch user",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  const updateUser = useCallback(
    async (userId, updates) => {
      dispatch({ type: "SET_SAVING", value: true });
      dispatch({ type: "SET_ERROR", value: null });

      const payload = { ...updates };
      if (payload.role) {
        payload.role = extractRoleIds(payload.role);
      }

      if (!USE_API) {
        setTimeout(() => {
          const updatedUser = { ...state.user, ...updates };
          if (updatedUser.role) {
            updatedUser.role = normalizeRoles(updatedUser.role);
          }
          dispatch({
            type: "SET_USER",
            user: updatedUser,
          });
          dispatch({ type: "SET_SAVING", value: false });
        }, 500);
        return { success: true };
      }

      try {
        const data = await apiService.request(`${USERS_ENDPOINT}/${userId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        let success = false;
        if (data.user) {
          success = true;
          const updatedUser = {
            ...state.user,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          dispatch({
            type: "SET_USER",
            user: updatedUser,
          });
        }
        dispatch({ type: "SET_SAVING", value: false });
        return { success };
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          value: err.message || "Failed to update user",
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: false, error: err.message };
      }
    },
    [state.user]
  );

  const createUser = useCallback(async (userData) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    const payload = { ...userData };
    if (payload.role) {
      payload.role = extractRoleIds(payload.role);
    }

    if (!USE_API) {
      const newId = `user-${Date.now()}`;
      setTimeout(() => {
        const newUser = {
          ...userData,
          _id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (newUser.role) {
          newUser.role = normalizeRoles(newUser.role);
        }
        dispatch({
          type: "SET_USER",
          user: newUser,
        });
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true, id: newId };
    }

    try {
      const data = await apiService.request(USERS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newUser = data.data || data;
      if (newUser.role) {
        newUser.role = normalizeRoles(newUser.role);
      }

      dispatch({
        type: "SET_USER",
        user: newUser,
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: true, id: newUser._id || newUser.id };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to create user",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      setTimeout(() => {
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true };
    }

    try {
      await apiService.request(`${USERS_ENDPOINT}/${userId}`, {
        method: "DELETE",
      });

      dispatch({ type: "SET_SAVING", value: false });
      return { success: true };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to delete user",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  const resetPassword = useCallback(async (userId) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      // Mock response for development
      setTimeout(() => {
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return {
        success: true,
        data: {
          email: state.user?.email || "mock@example.com",
          username: state.user?.username || "mockuser",
          password: "MockPassword123!",
        },
      };
    }

    try {
      const data = await apiService.request(`/reset-password/${userId}`, {
        method: "POST",
      });

      dispatch({ type: "SET_SAVING", value: false });
      return {
        success: true,
        data: data,
      };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to reset password",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, [state.user]);

  useEffect(() => {
    if (id && id !== "new") {
      fetchUser(id);
    }
  }, [id, fetchUser]);

  return (
    <UserProfileContext.Provider
      value={{
        ...state,
        dispatch,
        fetchUser,
        updateUser,
        createUser,
        deleteUser,
        resetPassword,
        initialUserData,
        normalizeRoles,
        extractRoleIds,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
};
