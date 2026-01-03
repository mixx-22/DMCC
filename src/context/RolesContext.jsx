import { useEffect, useCallback, useRef, useReducer } from "react";
import { RolesContext } from "./_contexts";
import apiService from "../services/api";

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Example mock data for local development
const MOCK_ROLES = [
  {
    id: "1",
    title: "Admin",
    description: "Full system access with all permissions",
    permissions: {
      documents: { c: 1, r: 1, u: 1, d: 1 },
      certifications: { c: 1, r: 1, u: 1, d: 1 },
      users: { c: 1, r: 1, u: 1, d: 1 },
      roles: { c: 1, r: 1, u: 1, d: 1 },
      accounts: { c: 1, r: 1, u: 1, d: 1 },
      archive: { c: 0, r: 1, u: 0, d: 1 },
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Manager",
    description: "Can manage documents and view reports",
    permissions: {
      documents: { c: 1, r: 1, u: 1, d: 0 },
      certifications: { c: 1, r: 1, u: 1, d: 0 },
      users: { c: 0, r: 1, u: 0, d: 0 },
      roles: { c: 0, r: 1, u: 0, d: 0 },
      accounts: { c: 0, r: 1, u: 0, d: 0 },
      archive: { c: 0, r: 1, u: 0, d: 0 },
    },
    createdAt: "2024-02-10T14:30:00.000Z",
    updatedAt: "2024-03-05T09:15:00.000Z",
  },
  {
    id: "3",
    title: "User",
    description: "Basic user with read-only access",
    permissions: {
      documents: { c: 0, r: 1, u: 0, d: 0 },
      certifications: { c: 0, r: 1, u: 0, d: 0 },
      users: { c: 0, r: 0, u: 0, d: 0 },
      roles: { c: 0, r: 0, u: 0, d: 0 },
      accounts: { c: 0, r: 0, u: 0, d: 0 },
      archive: { c: 0, r: 1, u: 0, d: 0 },
    },
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-01-20T08:00:00.000Z",
  },
  {
    id: "4",
    title: "Document Editor",
    description: "Can create and edit documents only",
    permissions: {
      documents: { c: 1, r: 1, u: 1, d: 0 },
      certifications: { c: 0, r: 1, u: 0, d: 0 },
      users: { c: 0, r: 0, u: 0, d: 0 },
      roles: { c: 0, r: 0, u: 0, d: 0 },
      accounts: { c: 0, r: 0, u: 0, d: 0 },
      archive: { c: 0, r: 0, u: 0, d: 0 },
    },
    createdAt: "2024-03-01T11:20:00.000Z",
    updatedAt: "2024-03-01T11:20:00.000Z",
  },
];

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_ROLES":
      return {
        ...state,
        roles: payload.roles,
        documentCount: payload.documentCount,
        page: payload.page,
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
    default:
      return state;
  }
};

const initialState = {
  roles: [],
  documentCount: 0,
  page: 1,
  loading: false,
  error: {},
};

export const RolesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetched = useRef();

  const fetchRoles = useCallback(async () => {
    if (fetched.current) return;
    fetched.current = true;
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });
    if (!USE_API) {
      setTimeout(() => {
        dispatch({
          type: "SET_ROLES",
          roles: MOCK_ROLES,
          documentCount: MOCK_ROLES.length,
          page: 1,
        });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }
    try {
      const data = await apiService.request(ROLES_ENDPOINT, {
        method: "GET",
      });
      dispatch({
        type: "SET_ROLES",
        roles: data.data,
        documentCount: data.meta.total,
        page: data.meta.page,
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", value: err.message || "Unknown error" });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <RolesContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
};
