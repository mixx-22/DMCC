import { createContext, useState, useCallback, useEffect } from "react";
import apiService from "../services/api";
import cookieService from "../services/cookieService";

const USER_KEY = import.meta.env.VITE_USER_KEY || "currentUser";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const token = cookieService.getToken();
    if (savedUser && token) {
      return JSON.parse(savedUser);
    }
    // Clean up if no token
    cookieService.removeToken();
    return null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return cookieService.getToken() || null;
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
    setIsAuthenticated(!!authToken);
  }, [authToken]);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
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

      setUser(userData);
      setAuthToken(tokenValue);

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
    try {
      setUser(null);
      setAuthToken(null);
      setError(null);
      
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
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      return updated;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
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

  const displayName = getDisplayName(user);

  const value = {
    user,
    displayName,
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
