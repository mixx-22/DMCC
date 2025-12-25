const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const LOGIN_ENDPOINT = import.meta.env.VITE_API_PACKAGE_LOGIN;

const createApiUrl = (endpoint) => {
  if (!API_ENDPOINT) {
    throw new Error("VITE_API_ENDPOINT is not configured");
  }
  return `${API_ENDPOINT}${endpoint}`;
};

export const apiService = {
  async login(username, password) {
    try {
      const response = await fetch(createApiUrl(LOGIN_ENDPOINT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Login failed with status ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        error.message || "Failed to connect to authentication server"
      );
    }
  },

  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(createApiUrl(endpoint), {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        error.message || "An error occurred while making the request"
      );
    }
  },
};

export default apiService;
