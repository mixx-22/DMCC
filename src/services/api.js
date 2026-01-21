import cookieService from "./cookieService";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const LOGIN_ENDPOINT = import.meta.env.VITE_API_PACKAGE_LOGIN;
const USE_API = import.meta.env.VITE_USE_API !== "false";

const createApiUrl = (endpoint) => {
  if (!API_ENDPOINT) {
    throw new Error("VITE_API_ENDPOINT is not configured");
  }
  return `${API_ENDPOINT}${endpoint}`;
};

export const apiService = {
  async login(username, password) {
    if (!USE_API) {
      // Mock login: accept any username/password, return a mock user and token
      if (!username || !password) {
        throw new Error("Username and password are required");
      }
      // You can customize this mock user as needed
      // Mock a JWT token with expiry 1 hour from now
      const now = Date.now();
      const expiresAt = now + 60 * 60 * 1000; // 1 hour
      const mockToken = {
        value: "mock-token-123",
        expiresAt,
      };
      return {
        user: {
          id: "mock-1",
          name: username,
          email: `${username}@mock.local`,
          department: "Engineering",
          userType: username === "admin" ? "Admin" : "User",
          avatar: "",
        },
        token: mockToken,
      };
    }
    try {
      const response = await fetch(createApiUrl(LOGIN_ENDPOINT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Login failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        error.message || "Failed to connect to authentication server",
      );
    }
  },

  async request(endpoint, options = {}) {
    try {
      // Get token from cookie only
      const token = cookieService.getToken();

      const headers = {
        ...options.headers,
      };

      // Only set Content-Type for non-FormData requests
      // FormData will set its own Content-Type with boundary
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Build URL with query parameters if provided
      let url = createApiUrl(endpoint);
      if (options.params) {
        const queryString = new URLSearchParams(
          Object.entries(options.params).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              acc[key] = value;
            }
            return acc;
          }, {}),
        ).toString();
        if (queryString) {
          url = `${url}?${queryString}`;
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include cookies in requests for server-set HttpOnly cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear cookie on authentication failure
          cookieService.removeToken();
          window.location.href = "/login";
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        error.message || "An error occurred while making the request",
      );
    }
  },

  /**
   * Upload a file to the server
   * @param {File} file - The file to upload
   * @returns {Promise<{filename: string, size: number, key: string}>}
   */
  async uploadFile(file) {
    if (!USE_API) {
      // Mock mode: simulate upload and return mock data
      return {
        filename: file.name,
        size: file.size,
        key: `mock-${Date.now()}-${file.name}`,
      };
    }

    const formData = new FormData();
    // Note: 'file' is the expected field name by the POST /upload endpoint
    formData.append("file", file);

    const response = await this.request("/documents/upload", {
      method: "POST",
      body: formData,
    });

    // Extract the data from response
    // Note: API returns 'fileName' (camelCase) not 'filename'
    const data = response.data || response;
    return {
      filename: data.fileName,
      size: data.size,
      key: data.key,
    };
  },

  /**
   * Download a document from the server
   * @param {string} fileName - The name of the file to download
   * @param {string} key - The unique key/identifier for the file
   * @returns {Promise<Blob>} - The file blob for download
   */
  async downloadDocument(fileName, key) {
    if (!USE_API) {
      // Mock mode: create a simple text file blob
      const mockContent = `Mock file: ${fileName}\nKey: ${key}\nDownloaded at: ${new Date().toISOString()}`;
      return new Blob([mockContent], { type: 'text/plain' });
    }

    // Get token from cookie
    const token = cookieService.getToken();

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(createApiUrl("/documents/download"), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ fileName, key }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        cookieService.removeToken();
        window.location.href = "/login";
      }
      throw new Error(`Download failed with status ${response.status}`);
    }

    // Check content type to determine if it's a blob or JSON
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      // Response is JSON, might contain a URL
      const data = await response.json();
      if (data.url) {
        const fileResponse = await fetch(data.url);
        if (!fileResponse.ok) {
          throw new Error(`Failed to download file from URL: HTTP ${fileResponse.status}`);
        }
        return await fileResponse.blob();
      }
      throw new Error("Invalid response format: expected file or URL");
    }
    
    // Response is the file itself
    return await response.blob();
  },
};

export default apiService;
