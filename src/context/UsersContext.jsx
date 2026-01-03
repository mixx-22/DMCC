import { useEffect, useCallback, useReducer, useRef } from "react";
import { UsersContext } from "./_contexts";
import apiService from "../services/api";

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const USE_API = import.meta.env.VITE_USE_API !== "false";
const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LIMIT) || 10;

// Example mock data for local development
const MOCK_USERS = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane@example.com",
    department: "Engineering",
    userType: "Admin",
    avatar: "",
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@example.com",
    department: "HR",
    userType: "User",
    avatar: "",
  },
];

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_USERS":
      return {
        ...state,
        users: payload.users,
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
  users: [],
  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  search: "",
  lastPage: 1,
};

export const UsersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const searchTimeoutRef = useRef(null);

  const fetchUsers = useCallback(async (page = state.page, search = state.search) => {
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });
    
    if (!USE_API) {
      // Use mock data for local development
      setTimeout(() => {
        let filteredUsers = MOCK_USERS;
        
        // Apply search filter if search term is provided
        if (search && search.length >= 2) {
          const searchLower = search.toLowerCase();
          filteredUsers = MOCK_USERS.filter((user) => {
            const fullName = `${user.name || ""}`.toLowerCase();
            const email = (user.email || "").toLowerCase();
            return fullName.includes(searchLower) || email.includes(searchLower);
          });
        }
        
        // Simulate pagination
        const start = (page - 1) * state.limit;
        const end = start + state.limit;
        const paginatedUsers = filteredUsers.slice(start, end);
        
        dispatch({ 
          type: "SET_USERS", 
          users: { data: paginatedUsers },
          total: filteredUsers.length 
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
      
      const data = await apiService.request(USERS_ENDPOINT, {
        method: "GET",
        params,
      });
      
      dispatch({ 
        type: "SET_USERS", 
        users: data,
        total: data.meta?.total || data.total || 0
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
    fetchUsers(page, state.search);
  }, [fetchUsers, state.search]);

  const setSearch = useCallback((search) => {
    dispatch({ type: "SET_SEARCH", value: search });
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search is cleared, return to last page
    if (!search || search.length === 0) {
      dispatch({ type: "SET_PAGE", value: state.lastPage });
      fetchUsers(state.lastPage, "");
      return;
    }
    
    // Only search if at least 2 characters
    if (search.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        dispatch({ type: "SET_PAGE", value: 1 }); // Reset to page 1 on search
        fetchUsers(1, search);
      }, 500); // 500ms debounce
    }
  }, [fetchUsers, state.lastPage]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UsersContext.Provider value={{ 
      ...state, 
      dispatch, 
      fetchUsers,
      setPage,
      setSearch,
    }}>
      {children}
    </UsersContext.Provider>
  );
};
