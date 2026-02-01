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
      if (!username || !password) {
        throw new Error("Username and password are required");
      }
      const now = Date.now();
      const expiresAt = now + 60 * 60 * 1000;
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
      const token = cookieService.getToken();

      const headers = {
        ...options.headers,
      };

      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let url = createApiUrl(endpoint);
      if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            // Handle array values - append each item separately
            if (Array.isArray(value)) {
              value.forEach((item) => {
                searchParams.append(key, item);
              });
            } else {
              searchParams.append(key, value);
            }
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url = `${url}?${queryString}`;
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
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
      return {
        filename: file.name,
        size: file.size,
        key: `mock-${Date.now()}-${file.name}`,
      };
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await this.request("/documents/upload", {
      method: "POST",
      body: formData,
    });

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
      const mockContent = `Mock file: ${fileName}\nKey: ${key}\nDownloaded at: ${new Date().toISOString()}`;
      return new Blob([mockContent], { type: "text/plain" });
    }

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

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // Response is JSON, might contain a URL
      const data = await response.json();
      if (data.url) {
        const fileResponse = await fetch(data.url);
        if (!fileResponse.ok) {
          throw new Error(
            `Failed to download file from URL: HTTP ${fileResponse.status}`,
          );
        }
        return await fileResponse.blob();
      }
      throw new Error("Invalid response format: expected file or URL");
    }

    // Response is the file itself
    return await response.blob();
  },

  /**
   * Preview a document from the server
   * @param {string} id - The document ID
   * @param {string} fileName - (Optional) The name of the file for mock mode only
   * @returns {Promise<Blob>} - The file blob for preview
   */
  async previewDocument(id, fileName = "") {
    if (!USE_API) {
      const extension = fileName.split(".").pop().toLowerCase();
      let mimeType = "application/octet-stream";
      let mockContent = `Mock preview: ${fileName}\nID: ${id}`;

      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#3182CE";
        ctx.fillRect(0, 0, 1, 1);
        return new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), mimeType);
        });
      } else if (["mp4", "webm", "ogg"].includes(extension)) {
        mimeType = `video/${extension}`;
      } else if (extension === "pdf") {
        mimeType = "application/pdf";
      }

      return new Blob([mockContent], { type: mimeType });
    }

    const token = cookieService.getToken();

    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(createApiUrl(`/documents/preview/${id}`), {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        cookieService.removeToken();
        window.location.href = "/login";
      }
      throw new Error(`Preview failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      // Response is JSON, might contain a URL
      const data = await response.json();
      if (data.url) {
        const fileResponse = await fetch(data.url);
        if (!fileResponse.ok) {
          throw new Error(
            `Failed to preview file from URL: HTTP ${fileResponse.status}`,
          );
        }
        return await fileResponse.blob();
      }
      throw new Error("Invalid response format: expected file or URL");
    }

    // Response is the file itself
    return await response.blob();
  },

  /**
   * Quality Document Lifecycle API Methods
   */

  /**
   * Submit a document for review (creates a new request)
   * @param {string} requestId - The request ID from the document
   * @returns {Promise<Object>}
   */
  async submitDocumentRequest(requestId) {
    if (!USE_API) {
      // Mock mode
      return {
        success: true,
        data: {
          requestId: `req-${Date.now()}`,
        },
      };
    }

    const response = await this.request(`/request/${requestId}?type=submit`, {
      method: "PUT",
    });

    return response;
  },

  /**
   * Discard a document request
   * @param {string} requestId - The request ID from the document
   * @returns {Promise<Object>}
   */
  async discardDocumentRequest(requestId) {
    if (!USE_API) {
      // Mock mode
      return { success: true };
    }

    const response = await this.request(`/request/${requestId}?type=discard`, {
      method: "PUT",
    });

    return response;
  },

  /**
   * Endorse a document request for publish
   * @param {string} requestId - The request ID from the document
   * @returns {Promise<Object>}
   */
  async endorseDocumentRequest(requestId) {
    if (!USE_API) {
      // Mock mode
      return { success: true };
    }

    const response = await this.request(
      `/request/${requestId}?type=approve&mode=CONTROLLER`,
      {
        method: "PUT",
      },
    );

    return response;
  },

  /**
   * Reject a document request
   * @param {string} requestId - The request ID from the document
   * @returns {Promise<Object>}
   */
  async rejectDocumentRequest(requestId) {
    if (!USE_API) {
      // Mock mode
      return { success: true };
    }

    const response = await this.request(
      `/request/${requestId}?type=reject&mode=TEAM`,
      {
        method: "PUT",
      },
    );

    return response;
  },

  /**
   * Publish a document
   * @param {string} requestId - The request ID from the document
   * @param {Object} metadata - Metadata including version, documentNumber, dates, and file
   * @returns {Promise<Object>}
   */
  async publishDocument(requestId, metadata = {}) {
    if (!USE_API) {
      // Mock mode
      return { success: true };
    }

    // Prepare form data if there's a file
    let body;
    let headers = {};

    if (metadata.finalCopyFile) {
      const formData = new FormData();
      formData.append("file", metadata.finalCopyFile);
      formData.append("version", metadata.version || "");
      formData.append("documentNumber", metadata.documentNumber || "");
      formData.append("issuedDate", metadata.issuedDate || "");
      formData.append("effectivityDate", metadata.effectivityDate || "");
      if (metadata.documentId) {
        formData.append("documentId", metadata.documentId);
      }
      body = formData;
      // Don't set Content-Type header, let browser set it with boundary
    } else {
      body = JSON.stringify({
        version: metadata.version,
        documentNumber: metadata.documentNumber,
        issuedDate: metadata.issuedDate,
        effectivityDate: metadata.effectivityDate,
        documentId: metadata.documentId,
      });
    }

    const response = await this.request(`/request/${requestId}?type=publish`, {
      method: "PUT",
      body,
      headers,
    });

    return response;
  },

  /**
   * Check out a published document (restart workflow)
   * @param {string} requestId - The request ID from the document
   * @returns {Promise<Object>}
   */
  async checkoutDocument(documentId, documentData) {
    if (!USE_API) {
      // Mock mode
      return { success: true };
    }

    const response = await this.request(
      `/request/${documentId}?type=checked-out`,
      {
        method: "PUT",
        body: JSON.stringify({
          title: documentData.title,
          documentType: documentData.type, // Send as documentType, not type
          metadata: {
            ...documentData.metadata,
            checkedOut: 1, // Ensure checkedOut is set to 1
          },
        }),
      },
    );

    return response;
  },
};

export default apiService;
