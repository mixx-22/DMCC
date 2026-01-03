import Cookies from 'js-cookie';

/**
 * Cookie Service for secure token management
 * Implements best practices for storing authentication tokens in cookies
 */

// Configuration constants
const TOKEN_COOKIE_NAME = 'authToken';
const TOKEN_EXPIRY_HOURS = 1; // Default token expiry time

// Cookie options with security best practices
const getCookieOptions = (expiresInHours = TOKEN_EXPIRY_HOURS) => {
  const isProduction = import.meta.env.PROD;
  
  return {
    expires: expiresInHours / 24, // js-cookie expects days, so convert hours to days
    path: '/',
    sameSite: 'strict', // CSRF protection - prevents cookie from being sent in cross-site requests
    secure: isProduction, // Only send over HTTPS in production
    // Note: HttpOnly cannot be set from JavaScript for security reasons
    // The server should set HttpOnly cookies in the Set-Cookie header
  };
};

/**
 * Cookie Service API
 */
export const cookieService = {
  /**
   * Store authentication token in a cookie
   * @param {string} token - The authentication token
   * @param {number} expiresInHours - Token expiration time in hours (default: 1 hour)
   * @returns {boolean} Success status
   */
  setToken(token, expiresInHours = TOKEN_EXPIRY_HOURS) {
    try {
      if (!token) {
        console.error('Token is required');
        return false;
      }

      const options = getCookieOptions(expiresInHours);
      Cookies.set(TOKEN_COOKIE_NAME, token, options);
      
      return true;
    } catch (error) {
      console.error('Error setting token cookie:', error);
      return false;
    }
  },

  /**
   * Retrieve authentication token from cookie
   * @returns {string|null} The token or null if not found
   */
  getToken() {
    try {
      return Cookies.get(TOKEN_COOKIE_NAME) || null;
    } catch (error) {
      console.error('Error getting token cookie:', error);
      return null;
    }
  },

  /**
   * Remove authentication token cookie
   * @returns {boolean} Success status
   */
  removeToken() {
    try {
      Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
      return true;
    } catch (error) {
      console.error('Error removing token cookie:', error);
      return false;
    }
  },

  /**
   * Check if authentication token exists
   * @returns {boolean} True if token exists, false otherwise
   */
  hasToken() {
    return !!this.getToken();
  },

  /**
   * Store token with custom expiry time based on JWT expiration
   * @param {string} token - The JWT token
   * @param {number} expiresAt - Unix timestamp (milliseconds) when token expires
   * @returns {boolean} Success status
   */
  setTokenWithExpiry(token, expiresAt) {
    try {
      if (!token) {
        console.error('Token is required');
        return false;
      }

      // Calculate hours until expiry
      const now = Date.now();
      const expiresInMs = expiresAt - now;
      
      // If token is already expired or will expire in less than 6 minutes, don't store it
      if (expiresInMs <= 0) {
        console.warn('Token is already expired');
        return false;
      }
      
      const expiresInHours = Math.max(expiresInMs / (1000 * 60 * 60), 0.1); // Minimum 6 minutes

      return this.setToken(token, expiresInHours);
    } catch (error) {
      console.error('Error setting token with expiry:', error);
      return false;
    }
  },

  /**
   * Parse JWT token to extract expiration time
   * @param {string} token - The JWT token
   * @returns {object|null} Decoded token payload or null if invalid
   */
  parseJWT(token) {
    try {
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  },

  /**
   * Store JWT token and automatically set expiry based on token's exp claim
   * @param {string} token - The JWT token
   * @returns {boolean} Success status
   */
  setJWTToken(token) {
    try {
      const payload = this.parseJWT(token);
      
      if (payload && payload.exp) {
        // JWT exp is in seconds, convert to milliseconds
        const expiresAt = payload.exp * 1000;
        return this.setTokenWithExpiry(token, expiresAt);
      }
      
      // Fallback to default expiry if no exp claim
      return this.setToken(token);
    } catch (error) {
      console.error('Error setting JWT token:', error);
      return false;
    }
  },
};

export default cookieService;
