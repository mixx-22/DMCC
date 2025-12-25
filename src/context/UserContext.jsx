import { createContext, useState, useCallback, useEffect } from "react";
import apiService from "../services/api";

const USER_KEY = import.meta.env.VITE_USER_KEY || "currentUser";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem("authToken");
    return savedUser && savedToken ? JSON.parse(savedUser) : null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("authToken") || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
    } else {
      localStorage.removeItem("authToken");
    }
    setIsAuthenticated(!!authToken);
  }, [authToken]);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(username, password);

      const userData = response.user || response;
      const token = response.token || response.authToken;

      if (!token) {
        throw new Error("No authentication token received");
      }

      setUser(userData);
      setAuthToken(token);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    setError(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const updateUserProfile = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      return updated;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    authToken,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUserProfile,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
