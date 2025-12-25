import { createContext, useState, useCallback, useEffect } from "react";
import apiService from "../services/api";

const USER_KEY = import.meta.env.VITE_USER_KEY || "currentUser";

const TOKEN_KEY = "authToken";
const getStoredToken = () => {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return { value: parsed };
    return parsed;
  } catch {
    return null;
  }
};

const isTokenValid = (tokenObj) => {
  if (!tokenObj) return false;
  if (!tokenObj.expiresAt) return true; // If no expiry, treat as valid (for legacy)
  return Date.now() < tokenObj.expiresAt;
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedToken = getStoredToken();
    if (savedUser && savedToken && isTokenValid(savedToken)) {
      return JSON.parse(savedUser);
    }
    // Clean up expired token
    localStorage.removeItem(TOKEN_KEY);
    return null;
  });

  const [authToken, setAuthToken] = useState(() => {
    const tokenObj = getStoredToken();
    if (tokenObj && isTokenValid(tokenObj)) {
      return tokenObj.value;
    }
    return null;
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
      // If already stored as object, don't overwrite
      const tokenObj = getStoredToken();
      if (!tokenObj || tokenObj.value !== authToken) {
        // Default: set expiry 1 hour from now if not present
        const expiresAt = Date.now() + 60 * 60 * 1000;
        localStorage.setItem(
          TOKEN_KEY,
          JSON.stringify({ value: authToken, expiresAt })
        );
      }
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setIsAuthenticated(!!authToken);
  }, [authToken]);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(username, password);

      const userData = response.user || response;
      let tokenObj = response.token || response.authToken;

      if (!tokenObj) {
        throw new Error("No authentication token received");
      }

      // If token is a string, wrap with expiry
      if (typeof tokenObj === "string") {
        tokenObj = { value: tokenObj, expiresAt: Date.now() + 60 * 60 * 1000 };
      }

      setUser(userData);
      setAuthToken(tokenObj.value);
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenObj));

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
