import { useEffect, useCallback, useRef, useReducer } from "react";
import { RolesContext } from "./_contexts";
import apiService from "../services/api";

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;
const USE_API = import.meta.env.VITE_USE_API !== "false";
const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LIMIT) || 10;

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
        total: payload.total !== undefined ? payload.total : state.total,
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
    case "SET_PAGE":
      return {
        ...state,
        page: payload.value,
      };
    case "SET_SEARCH":
      return {
        ...state,
        search: payload.value,
      };
    case "SET_LAST_PAGE":
      return {
        ...state,
        lastPage: payload.value,
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
  limit: DEFAULT_LIMIT,
  total: 0,
  search: "",
  lastPage: 1,
};

export const RolesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetched = useRef();
  const searchTimeoutRef = useRef(null);

  const fetchRoles = useCallback(async (page = state.page, search = state.search) => {
    if (fetched.current) {
      fetched.current = false; // Allow refetch
    }
    fetched.current = true;
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });
    
    if (!USE_API) {
      setTimeout(() => {
        let filteredRoles = MOCK_ROLES;
        
        // Apply search filter if search term is provided
        if (search && search.length >= 2) {
          const searchLower = search.toLowerCase();
          filteredRoles = MOCK_ROLES.filter((role) => {
            return (
              role.title.toLowerCase().includes(searchLower) ||
              role.description.toLowerCase().includes(searchLower)
            );
          });
        }
        
        // Simulate pagination
        const start = (page - 1) * state.limit;
        const end = start + state.limit;
        const paginatedRoles = filteredRoles.slice(start, end);
        
        dispatch({
          type: "SET_ROLES",
          roles: paginatedRoles,
          documentCount: filteredRoles.length,
          page: page,
          total: filteredRoles.length,
        });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }
    
    try {
      const params = {
        page,
        limit: state.limit,
      };
      
      // Only add search param if it's at least 2 characters
      if (search && search.length >= 2) {
        params.search = search;
      }
      
      const data = await apiService.request(ROLES_ENDPOINT, {
        method: "GET",
        params,
      });
      
      dispatch({
        type: "SET_ROLES",
        roles: data.data,
        documentCount: data.meta.total,
        page: data.meta.page,
        total: data.meta?.total || data.total || 0,
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", value: err.message || "Unknown error" });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, [state.page, state.search, state.limit]);

  const setPage = useCallback((page) => {
    dispatch({ type: "SET_PAGE", value: page });
    dispatch({ type: "SET_LAST_PAGE", value: page });
    fetched.current = false;
    fetchRoles(page, state.search);
  }, [fetchRoles, state.search]);

  const setSearch = useCallback((search) => {
    dispatch({ type: "SET_SEARCH", value: search });
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search is cleared, return to last page
    if (!search || search.length === 0) {
      dispatch({ type: "SET_PAGE", value: state.lastPage });
      fetched.current = false;
      fetchRoles(state.lastPage, "");
      return;
    }
    
    // Only search if at least 2 characters
    if (search.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_PAGE", value: 1 }); // Reset to page 1 on search
        fetched.current = false;
        fetchRoles(1, search);
      }, 500); // 500ms debounce
    }
  }, [fetchRoles, state.lastPage]);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RolesContext.Provider
      value={{
        ...state,
        dispatch,
        fetchRoles,
        setPage,
        setSearch,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
};
