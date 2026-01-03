import { createContext, useCallback, useEffect, useReducer } from "react";
import apiService from "../services/api";
import cookieService from "../services/cookieService";

const USER_KEY = import.meta.env.VITE_USER_KEY || "currentUser";

const UserContext = createContext();

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_USER":
      return {
        ...state,
        user: payload.user,
      };
    case "SET_AUTH_TOKEN":
      return {
        ...state,
        authToken: payload.authToken,
        isAuthenticated: !!payload.authToken,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: payload.value,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: payload.value,
      };
    case "UPDATE_USER_PROFILE":
      return {
        ...state,
        user: state.user ? { ...state.user, ...payload.updates } : null,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        authToken: null,
        isAuthenticated: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  user: (() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const token = cookieService.getToken();
    if (savedUser && token) {
      return JSON.parse(savedUser);
    }
    // Clean up if no token
    cookieService.removeToken();
    return null;
  })(),
  authToken: cookieService.getToken() || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!cookieService.getToken(),
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [state.user]);

  const login = useCallback(async (username, password) => {
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });
    try {
      const response = await apiService.login(username, password);

      // If the API returns { user: { ...userData, token: "..." }, ... }
      let userData = response.user || response;
      let tokenValue = response.token || response.authToken;

      // If token is inside user object, extract and remove it from userData
      if (!tokenValue && userData && userData.token) {
        tokenValue = userData.token;
        // Remove token from userData for context cleanliness
        userData = { ...userData };
        delete userData.token;
      }

      if (!tokenValue) {
        throw new Error("No authentication token received");
      }

      // Store token in cookie using JWT parsing for automatic expiry
      const success = cookieService.setJWTToken(tokenValue);
      
      if (!success) {
        console.warn("Failed to store token in cookie");
      }

      dispatch({ type: "SET_USER", user: userData });
      dispatch({ type: "SET_AUTH_TOKEN", authToken: tokenValue });

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      dispatch({ type: "SET_ERROR", value: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  const logout = useCallback(() => {
    try {
      dispatch({ type: "LOGOUT" });
      
      // Clear cookie
      cookieService.removeToken();
      
      // Clear localStorage (only user data)
      localStorage.removeItem(USER_KEY);
      
      if (typeof sessionStorage !== "undefined") sessionStorage.clear();
    } catch (error) {
      console.warn("Error during logout:", error);
    }
  }, []);

  const updateUserProfile = useCallback((updates) => {
    dispatch({ type: "UPDATE_USER_PROFILE", updates });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", value: null });
  }, []);

  // Utility to get display name from user object
  const getDisplayName = (userObj) => {
    if (!userObj) return "";
    const { firstName, middleName, lastName, name } = userObj;
    let display = firstName || "";
    if (middleName) display += ` ${middleName}`;
    if (lastName) display += ` ${lastName}`;
    if (!display.trim() && name) return name;
    return display.trim();
  };

  const displayName = getDisplayName(state.user);

  const value = {
    ...state,
    displayName,
    login,
    logout,
    updateUserProfile,
    clearError,
    dispatch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
