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
  firstName: "John",
  middleName: "M",
  lastName: "Doe",
  email: "john.doe@example.com",
  role: ["1", "2"], // Role IDs (User, Manager)
  isActive: true,
  department: "Engineering",
  position: "Senior Developer",
  phone: "+639171234567",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

// Mock roles mapping for development
const MOCK_ROLES_MAP = {
  1: { id: "1", title: "Admin" },
  2: { id: "2", title: "Manager" },
  3: { id: "3", title: "User" },
  4: { id: "4", title: "Supervisor" },
  5: { id: "5", title: "Analyst" },
};

// Helper to convert role IDs to role objects with title
const convertRoleIdsToObjects = (roleIds) => {
  if (!Array.isArray(roleIds)) return [];
  return roleIds
    .map((id) => MOCK_ROLES_MAP[id] || { id, title: `Role ${id}` })
    .filter(Boolean);
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
  department: "",
  position: "",
  phone: "",
  role: [],
  isActive: true,
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

      dispatch({
        type: "SET_USER",
        user: data.user || data,
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

      if (!USE_API) {
        // Mock API call
        setTimeout(() => {
          dispatch({
            type: "SET_USER",
            user: { ...state.user, ...updates },
          });
          dispatch({ type: "SET_SAVING", value: false });
        }, 500);
        return { success: true };
      }

      try {
        const data = await apiService.request(`${USERS_ENDPOINT}/${userId}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });

        dispatch({
          type: "SET_USER",
          user: data.data || data,
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: true };
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

    if (!USE_API) {
      const newId = `user-${Date.now()}`;
      setTimeout(() => {
        dispatch({
          type: "SET_USER",
          user: {
            ...userData,
            _id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true, id: newId };
    }

    try {
      const data = await apiService.request(USERS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(userData),
      });
      console.log(userData, data);

      const newUser = data.data || data;
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
        initialUserData,
        convertRoleIdsToObjects,
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
