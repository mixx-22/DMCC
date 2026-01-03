import { createContext, useState, useCallback, useEffect } from "react";
import apiService from "../services/api";
import cookieService from "../services/cookieService";

const USER_KEY = import.meta.env.VITE_USER_KEY || "currentUser";

const TOKEN_KEY = "authToken";

// Helper function to get token from cookie first, then localStorage
const getStoredToken = () => {
  // Priority 1: Check cookie
  const cookieToken = cookieService.getToken();
  if (cookieToken) {
    return { value: cookieToken, source: 'cookie' };
  }

  // Priority 2: Check localStorage (for backward compatibility)
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return { value: parsed, source: 'localStorage' };
    return { ...parsed, source: 'localStorage' };
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
    // Clean up expired token from both sources
    cookieService.removeToken();
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
      // Store token in cookie (primary storage)
      const tokenObj = getStoredToken();
      
      if (!tokenObj || tokenObj.value !== authToken) {
        // Default: set expiry 1 hour from now if not present
        const expiresAt = Date.now() + 60 * 60 * 1000;
        
        // Store in cookie with expiry
        cookieService.setTokenWithExpiry(authToken, expiresAt);
        
        // Also store in localStorage for backward compatibility
        localStorage.setItem(
          TOKEN_KEY,
          JSON.stringify({ value: authToken, expiresAt })
        );
      }
    } else {
      // Clear both cookie and localStorage
      cookieService.removeToken();
      localStorage.removeItem(TOKEN_KEY);
    }
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
      cookieService.setJWTToken(tokenValue);

      // Also store in localStorage for backward compatibility
      const payload = cookieService.parseJWT(tokenValue);
      const expiresAt = payload && payload.exp 
        ? payload.exp * 1000 
        : Date.now() + 60 * 60 * 1000;
      
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ value: tokenValue, expiresAt }));

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
      
      // Clear localStorage items
      [TOKEN_KEY, USER_KEY].forEach((key) => localStorage.removeItem(key));
      
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
