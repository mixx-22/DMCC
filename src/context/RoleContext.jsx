import {
  useEffect,
  useCallback,
  useReducer,
  createContext,
  useContext,
} from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock role with nested permissions for development
const MOCK_ROLE = {
  _id: "694d2b5b686103d27347104a",
  title: "User",
  description: "Full control to all",
  permissions: {
    users: {
      c: 1,
      r: 1,
      u: 1,
      d: 1,
    },
    teams: {
      c: 1,
      r: 1,
      u: 1,
      d: 1,
    },
    roles: {
      c: 1,
      r: 1,
      u: 1,
      d: 1,
    },
    document: {
      c: 1,
      r: 1,
      u: 1,
      d: 1,
      permissions: {
        archive: {
          c: 1,
          r: 1,
          u: 1,
          d: 1,
        },
        download: {
          c: 1,
          r: 1,
          u: 1,
          d: 1,
        },
      },
    },
    audit: {
      c: 1,
      r: 1,
      u: 1,
      d: 1,
    },
  },
  isSystemRole: false,
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

const RoleContext = createContext();

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_ROLE":
      return {
        ...state,
        role: payload.role,
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

const initialState = {
  role: null,
  loading: false,
  error: null,
  saving: false,
};

export const RoleProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchRole = useCallback(async (roleId) => {
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      // Mock API call
      setTimeout(() => {
        dispatch({
          type: "SET_ROLE",
          role: { ...MOCK_ROLE, _id: roleId },
        });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }

    try {
      const data = await apiService.request(`${ROLES_ENDPOINT}/${roleId}`, {
        method: "GET",
      });

      dispatch({
        type: "SET_ROLE",
        role: data.data || data,
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to fetch role",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  const updateRole = useCallback(
    async (roleId, updates) => {
      dispatch({ type: "SET_SAVING", value: true });
      dispatch({ type: "SET_ERROR", value: null });

      if (!USE_API) {
        // Mock API call
        setTimeout(() => {
          dispatch({
            type: "SET_ROLE",
            role: { ...state.role, ...updates },
          });
          dispatch({ type: "SET_SAVING", value: false });
        }, 500);
        return { success: true };
      }

      try {
        const data = await apiService.request(`${ROLES_ENDPOINT}/${roleId}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });

        dispatch({
          type: "SET_ROLE",
          role: data.data || data,
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: true };
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          value: err.message || "Failed to update role",
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: false, error: err.message };
      }
    },
    [state.role]
  );

  const createRole = useCallback(async (roleData) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      // Mock API call
      const newId = `role-${Date.now()}`;
      setTimeout(() => {
        dispatch({
          type: "SET_ROLE",
          role: {
            ...roleData,
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
      const data = await apiService.request(ROLES_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(roleData),
      });

      const newRole = data.role || data;
      dispatch({
        type: "SET_ROLE",
        role: {
          ...newRole,
          createdAt: newRole.createdAt || new Date().toISOString(),
          updatedAt: newRole.updatedAt || new Date().toISOString(),
        },
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: true, id: newRole._id || newRole.id };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to create role",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  const deleteRole = useCallback(async (roleId) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      setTimeout(() => {
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true };
    }

    try {
      await apiService.request(`${ROLES_ENDPOINT}/${roleId}`, {
        method: "DELETE",
      });

      dispatch({ type: "SET_SAVING", value: false });
      return { success: true };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to delete role",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (id && id !== "new") {
      fetchRole(id);
    }
  }, [id, fetchRole]);

  return (
    <RoleContext.Provider
      value={{
        ...state,
        dispatch,
        fetchRole,
        updateRole,
        createRole,
        deleteRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};
