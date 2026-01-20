/**
 * Reusable file upload utility functions
 * Best practice implementation for handling file uploads with FormData
 */

/**
 * Convert a File object or blob URL to a Blob
 * @param {File|string} fileOrUrl - File object or blob URL
 * @returns {Promise<{blob: Blob, filename: string}>}
 */
export const getFileBlob = async (fileOrUrl) => {
  if (fileOrUrl instanceof File) {
    // Already a File object, convert to Blob
    return {
      blob: new Blob([fileOrUrl], { type: fileOrUrl.type }),
      filename: fileOrUrl.name,
    };
  }

  if (typeof fileOrUrl === "string" && fileOrUrl.startsWith("blob:")) {
    // Fetch blob from blob URL
    const response = await fetch(fileOrUrl);
    const blob = await response.blob();
    
    // Extract filename from URL or use default
    const urlParts = fileOrUrl.split("/");
    const filename = urlParts[urlParts.length - 1] || "file";
    
    return { blob, filename };
  }

  throw new Error("Invalid file input. Expected File object or blob URL.");
};

/**
 * Create FormData for document upload
 * @param {Object} documentData - Document data including file
 * @returns {Promise<FormData>}
 */
export const createDocumentFormData = async (documentData) => {
  const formData = new FormData();

  // Handle file upload
  if (documentData.type === "file" && documentData.metadata?.file) {
    const { blob, filename } = await getFileBlob(documentData.metadata.file);
    
    // Append the file with the correct filename
    formData.append("file", blob, documentData.metadata.filename || filename);
    
    // Remove the file object from metadata before adding other fields
    const { file, ...metadataWithoutFile } = documentData.metadata;
    
    // Append metadata as JSON string (only filename and size)
    formData.append("metadata", JSON.stringify({
      filename: documentData.metadata.filename,
      size: documentData.metadata.size,
    }));
  } else {
    // For folders and audit schedules, add metadata as JSON
    formData.append("metadata", JSON.stringify(documentData.metadata || {}));
  }

  // Append all other document fields
  formData.append("title", documentData.title || "");
  formData.append("description", documentData.description || "");
  formData.append("type", documentData.type);
  formData.append("status", documentData.status ?? 0);
  formData.append("parentId", documentData.parentId || "");
  formData.append("path", documentData.path || "/");
  
  // Append complex objects as JSON strings
  formData.append("privacy", JSON.stringify(documentData.privacy || {
    users: [],
    teams: [],
    roles: [],
  }));
  
  formData.append("permissionOverrides", JSON.stringify(documentData.permissionOverrides || {
    readOnly: 1,
    restricted: 1,
  }));
  
  formData.append("author", JSON.stringify(documentData.author || {}));

  return formData;
};

/**
 * Upload document with file using FormData
 * Reusable function that can be called from any component
 * 
 * @param {string} endpoint - API endpoint URL
 * @param {Object} documentData - Document data including file
 * @param {Object} apiService - API service instance with request method
 * @returns {Promise<Object>} - Upload response
 */
export const uploadDocumentWithFile = async (endpoint, documentData, apiService) => {
  try {
    // Create FormData from document data
    const formData = await createDocumentFormData(documentData);

    // Send FormData to backend
    // Note: apiService.request should handle FormData and set appropriate headers
    const response = await apiService.request(endpoint, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    return response;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = [], // Empty array means all types allowed
  } = options;

  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`,
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true, error: null };
};
