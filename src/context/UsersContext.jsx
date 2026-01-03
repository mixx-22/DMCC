import { useEffect, useCallback, useReducer } from "react";
import { UsersContext } from "./_contexts";
import apiService from "../services/api";

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

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
  users: [],
  loading: false,
  error: null,
};

export const UsersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchUsers = useCallback(async () => {
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });
    if (!USE_API) {
      // Use mock data for local development
      setTimeout(() => {
        dispatch({ type: "SET_USERS", users: MOCK_USERS });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }
    try {
      // Use apiService.request which automatically includes the token from cookie
      const data = await apiService.request(USERS_ENDPOINT, {
        method: "GET",
      });
      dispatch({ type: "SET_USERS", users: data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", value: err.message || "Unknown error" });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <UsersContext.Provider value={{ ...state, dispatch, fetchUsers }}>
      {children}
    </UsersContext.Provider>
  );
};
