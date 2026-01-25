import { useState, useRef, useCallback } from "react";
import apiService from "../services/api";
import { DocumentsContext } from "./_contexts";
import { useUser } from "./_useContext";
import { uploadFileToServer } from "../utils/fileUpload";

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";
const DEFAULT_FILE_VERSION = "0.0";

const rootFolder = {
  id: null,
  title: "All Documents",
  parentId: null,
};

export const DocumentsProvider = ({ children }) => {
  const { user: currentUser } = useUser();

  // Core documents state with new data structure
  const [folder, setFolder] = useState(rootFolder);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Current folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(null);

  // Selected document for drawer
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Refs to prevent duplicate fetch requests
  const fetchingRef = useRef(false);
  const lastFetchedFolderIdRef = useRef(null);

  // Fetch documents from API
  const fetchDocuments = useCallback(async (folderId = null) => {
    // Prevent duplicate requests
    if (fetchingRef.current && lastFetchedFolderIdRef.current === folderId) {
      return;
    }

    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documents");
      setDocuments(saved ? JSON.parse(saved) : []);
      return;
    }

    fetchingRef.current = true;
    lastFetchedFolderIdRef.current = folderId;
    setLoading(true);
    setError(null);

    try {
      const params = folderId ? { folder: folderId } : {};
      const response = await apiService.request(DOCUMENTS_ENDPOINT, {
        method: "GET",
        params,
      });
      const { success = false, data = { folder: {}, documents: [] } } =
        response;
      if (success) {
        setFolder(data.folder || rootFolder);
        setDocuments(data.documents || []);
      } else {
        throw "Failed to fetch documents";
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError(err.message || "Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Fetch single document by ID
  const fetchDocumentById = async (documentId) => {
    if (!USE_API) {
      // Mock mode: find in localStorage
      const saved = localStorage.getItem("documents");
      const docs = saved ? JSON.parse(saved) : [];
      return docs.find((doc) => doc.id === documentId);
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.request(
        `${DOCUMENTS_ENDPOINT}/${documentId}`,
        {
          method: "GET",
        },
      );

      return data.data || data.document || data;
    } catch (err) {
      console.error("Failed to fetch document:", err);
      setError(err.message || "Failed to load document");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Note: fetchDocuments is no longer called automatically here.
  // Pages that need documents (like /documents) should call fetchDocuments explicitly.

  // Generate unique ID
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create a new document (file/folder/auditSchedule)
  const createDocument = async (documentData) => {
    const newDocument = {
      title: documentData.title || "",
      description: documentData.description || "",
      type: documentData.type, // "file", "folder", "auditSchedule"
      status: documentData.status ?? -1, // -1: draft, 0: under review, 1: approved, 2: archived, 3: expired
      parentId: documentData.parentId || currentFolderId,
      path: documentData.path || currentFolderId,
      privacy: {
        users: documentData.privacy?.users || [],
        teams: documentData.privacy?.teams || [],
        roles: documentData.privacy?.roles || [],
      },
      permissionOverrides: {
        readOnly: documentData.permissionOverrides?.readOnly ?? 1,
        restricted: documentData.permissionOverrides?.restricted ?? 1,
      },
      author: {
        type: currentUser?.userType || "",
        id: currentUser?.id || "",
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
        team: currentUser?.team || currentUser?.department || "",
      },
      metadata: documentData.metadata || {},
    };

    // Set default metadata based on type
    if (documentData.type === "file" && !documentData.metadata) {
      newDocument.metadata = {
        filename: documentData.filename || "",
        size: documentData.size || "",
        version: DEFAULT_FILE_VERSION,
        key: "",
      };
    } else if (documentData.type === "folder" && !documentData.metadata) {
      newDocument.metadata = {
        allowInheritance: documentData.allowInheritance ?? 0,
      };
    } else if (
      documentData.type === "auditSchedule" &&
      !documentData.metadata
    ) {
      newDocument.metadata = {
        code: documentData.code || "",
        type: documentData.auditType || "",
        standard: documentData.standard || "",
        status: 0,
        auditors: [],
        organization: {},
      };
    }

    if (!USE_API) {
      // Mock mode: use localStorage
      const docWithId = {
        ...newDocument,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const saved = localStorage.getItem("documents");
      const docs = saved ? JSON.parse(saved) : [];
      const updated = [...docs, docWithId];
      localStorage.setItem("documents", JSON.stringify(updated));
      setDocuments(updated);
      return docWithId;
    }

    // API mode: Two-step process for files, JSON for others
    try {
      let response;

      if (documentData.type === "file") {
        // Step 1: Upload file to get metadata (filename, size, key)
        if (documentData.metadata?.file) {
          const uploadResult = await uploadFileToServer(
            documentData.metadata.file,
            apiService,
          );

          // Step 2: Create document with file metadata
          newDocument.metadata = {
            filename: uploadResult.filename,
            size: uploadResult.size,
            key: uploadResult.key,
            version: DEFAULT_FILE_VERSION,
          };
        } else {
          throw new Error("File is required for document type 'file'");
        }

        // Send JSON request with file metadata
        response = await apiService.request(DOCUMENTS_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(newDocument),
        });
      } else {
        // Use JSON for folders and audit schedules
        response = await apiService.request(DOCUMENTS_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(newDocument),
        });
      }

      if (response.success) {
        const createdDoc = response.data || response.document || response;

        // Optimize: Add new document to existing array instead of re-fetching
        // Only add if it belongs to the current folder
        if ((createdDoc.parentId || null) === currentFolderId) {
          setDocuments((prevDocs) => [...prevDocs, createdDoc]);
        }

        return createdDoc;
      } else {
        throw new Error(
          response.message || "Unknown error occurred while creating document",
        );
      }
    } catch (err) {
      console.error("Failed to create document:", err);
      throw new Error(err.message || "Failed to create document");
    }
  };

  // Helper function to extract IDs from objects
  const extractIds = (items) => {
    // Handle null/undefined by returning empty array
    if (!items) return [];
    // If not an array, return as-is
    if (!Array.isArray(items)) return items;
    
    return items.map((item) => {
      // If item is already a string (just an ID), return it
      if (typeof item === "string") return item;
      // Otherwise extract the ID from the object
      return item?.id || item?._id;
    });
  };

  // Helper function to format updates for API
  // Returns both the API payload and consolidated data for UI display
  const formatUpdatesForAPI = (updates) => {
    const payload = { ...updates };
    const consolidatedData = { ...updates };

    // Format privacy settings
    if (updates.privacy) {
      // For API payload: extract IDs from user/team/role objects
      payload.privacy = {
        ...updates.privacy,
        users: extractIds(updates.privacy.users),
        teams: extractIds(updates.privacy.teams),
        roles: extractIds(updates.privacy.roles),
      };
      
      // For consolidated data: keep the full objects as-is for UI display
      consolidatedData.privacy = {
        ...updates.privacy,
        users: updates.privacy.users || [],
        teams: updates.privacy.teams || [],
        roles: updates.privacy.roles || [],
      };
    }

    // Format metadata
    if (updates.metadata) {
      const payloadMeta = { ...updates.metadata };
      const consolidatedMeta = { ...updates.metadata };
      
      // Trim document number for both payload and consolidated data
      if (typeof updates.metadata.documentNumber === 'string') {
        const trimmedDocNumber = updates.metadata.documentNumber.trim() || undefined;
        payloadMeta.documentNumber = trimmedDocNumber;
        consolidatedMeta.documentNumber = trimmedDocNumber;
      }
      
      // For API payload: extract fileType ID if it's an object
      if (payloadMeta.fileType && typeof payloadMeta.fileType === 'object') {
        payloadMeta.fileType = payloadMeta.fileType.id || payloadMeta.fileType._id || null;
      }
      // For consolidated data: fileType remains as the full object for UI display
      // (consolidatedMeta.fileType is already the full object from ...updates.metadata)
      
      payload.metadata = payloadMeta;
      consolidatedData.metadata = consolidatedMeta;
    }

    return { payload, consolidatedData };
  };

  // Update a document
  const updateDocument = async (id, updates) => {
    // Format updates for API (extract IDs, trim strings, etc.)
    // Returns { payload, consolidatedData }
    const { payload, consolidatedData } = formatUpdatesForAPI(updates);

    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documents");
      const docs = saved ? JSON.parse(saved) : [];
      const updatedDoc = {
        id,
        updatedAt: new Date().toISOString(),
      };
      
      const updated = docs.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...consolidatedData, // Use consolidatedData instead of payload for consistency
              ...updatedDoc,
            }
          : doc,
      );
      
      // Find and return the updated document
      const result = updated.find((doc) => doc.id === id);
      
      localStorage.setItem("documents", JSON.stringify(updated));
      setDocuments(updated);
      return result;
    }

    // API mode: PUT /documents/:id
    try {
      const response = await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload), // Send payload to API
      });

      // Optimize: Update document in existing array instead of re-fetching
      // Use API response if available, otherwise construct from consolidatedData
      let updatedDoc = response.data || response.document;
      
      // If no response data, construct fallback from consolidatedData with explicit overrides
      if (!updatedDoc) {
        updatedDoc = {
          id,
          updatedAt: new Date().toISOString(),
          ...consolidatedData, // Spread consolidatedData after explicit fields
        };
      }

      // Check if document is being moved to a different folder
      const isMoving = "parentId" in updates;
      const newParentId = updates.parentId;

      if (isMoving && newParentId !== currentFolderId) {
        // Document moved out of current folder - remove from list
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.id !== id && doc._id !== id),
        );
      } else {
        // Document updated in current folder - update in list
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === id || doc._id === id ? { ...doc, ...updatedDoc } : doc,
          ),
        );
      }

      return updatedDoc;
    } catch (err) {
      console.error("Failed to update document:", err);
      throw new Error(err.message || "Failed to update document");
    }
  };

  // Delete a document
  const deleteDocument = async (id) => {
    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documents");
      const docs = saved ? JSON.parse(saved) : [];
      // Also delete all children if it's a folder
      const doc = docs.find((d) => d._id === id);
      let idsToDelete = [id];
      if (doc && doc.type === "folder") {
        const childIds = docs
          .filter((d) => d.parentId === id)
          .map((d) => d._id);
        idsToDelete = [...idsToDelete, ...childIds];
      }
      const updated = docs.filter((doc) => !idsToDelete.includes(doc._id));
      localStorage.setItem("documents", JSON.stringify(updated));
      setDocuments(updated);
      return;
    }

    // API mode: DELETE /documents/:id
    try {
      await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "DELETE",
      });

      // Optimize: Remove document from existing array instead of re-fetching
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== id && doc._id !== id),
      );
    } catch (err) {
      console.error("Failed to delete document:", err);
      throw new Error(err.message || "Failed to delete document");
    }
  };

  // Move document to a different parent
  const moveDocument = async (id, newParentId) => {
    return updateDocument(id, { parentId: newParentId });
  };

  // Navigate to folder
  const navigateToFolder = (folderId) => {
    setCurrentFolderId(folderId);
    setSelectedDocument(null);
  };

  // Check if user can view document based on privacy settings
  const canViewDocument = (doc) => {
    if (!currentUser) return false;

    // Owner can always view
    if (doc.owner.id === currentUser.id) return true;

    // Check privacy settings
    const { users, teams, roles } = doc.privacy;

    // If no privacy settings, document is public
    if (users.length === 0 && teams.length === 0 && roles.length === 0) {
      return true;
    }

    // Check if user is in allowed users
    if (users.some((u) => u.id === currentUser.id || u === currentUser.id)) {
      return true;
    }

    // Check if user's team is in allowed teams
    const userTeam = currentUser.team || currentUser.department;
    if (teams.some((t) => t.id === userTeam || t === userTeam)) {
      return true;
    }

    // Check if user's role is in allowed roles
    const userRole = currentUser.userType;
    if (roles.some((r) => r.id === userRole || r === userRole)) {
      return true;
    }

    return false;
  };

  // Get visible documents (filtered by privacy)
  const getVisibleDocuments = () => {
    return documents.filter(canViewDocument);
  };

  const value = {
    folder,
    documents,
    currentFolderId,
    selectedDocument,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    moveDocument,
    navigateToFolder,
    setSelectedDocument,
    canViewDocument,
    getVisibleDocuments,
    fetchDocuments,
    fetchDocumentById,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};
