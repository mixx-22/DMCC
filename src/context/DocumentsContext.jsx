import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useUser } from "./useUser";
import apiService from "../services/api";

const DocumentsContext = createContext();

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error("useDocuments must be used within DocumentsProvider");
  }
  return context;
};

export const DocumentsProvider = ({ children }) => {
  const { user: currentUser } = useUser();

  // Core documents state with new data structure
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // View preferences
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("documentsViewMode");
    return saved || "grid"; // "grid" or "list"
  });

  // Current folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(null);

  // Selected document for drawer
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Refs to prevent duplicate fetch requests
  const fetchingRef = useRef(false);
  const lastFetchedFolderIdRef = useRef(null);

  // Persist view mode to localStorage only
  useEffect(() => {
    localStorage.setItem("documentsViewMode", viewMode);
  }, [viewMode]);

  // Fetch documents from API
  const fetchDocuments = async (folderId = null) => {
    // Prevent duplicate requests
    if (fetchingRef.current && lastFetchedFolderIdRef.current === folderId) {
      return;
    }

    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documentsV2");
      setDocuments(saved ? JSON.parse(saved) : []);
      return;
    }

    fetchingRef.current = true;
    lastFetchedFolderIdRef.current = folderId;
    setLoading(true);
    setError(null);

    try {
      const params = folderId ? { folder: folderId } : {};
      const data = await apiService.request(DOCUMENTS_ENDPOINT, {
        method: "GET",
        params,
      });

      setDocuments(data.data || data.documents || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError(err.message || "Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Fetch single document by ID
  const fetchDocumentById = async (documentId) => {
    if (!USE_API) {
      // Mock mode: find in localStorage
      const saved = localStorage.getItem("documentsV2");
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

  // Load documents on mount and when folder changes
  useEffect(() => {
    fetchDocuments(currentFolderId);
  }, [currentFolderId]);

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
      owner: {
        type: currentUser?.userType || "",
        id: currentUser?.id || "",
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
        team: currentUser?.team || currentUser?.department || "",
      },
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
        version: "0.0",
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
      const saved = localStorage.getItem("documentsV2");
      const docs = saved ? JSON.parse(saved) : [];
      const updated = [...docs, docWithId];
      localStorage.setItem("documentsV2", JSON.stringify(updated));
      setDocuments(updated);
      return docWithId;
    }

    // API mode: POST /documents
    try {
      const data = await apiService.request(DOCUMENTS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(newDocument),
      });

      const createdDoc = data.data || data.document || data;
      // Refresh documents list
      await fetchDocuments(currentFolderId);
      return createdDoc;
    } catch (err) {
      console.error("Failed to create document:", err);
      throw new Error(err.message || "Failed to create document");
    }
  };

  // Update a document
  const updateDocument = async (id, updates) => {
    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documentsV2");
      const docs = saved ? JSON.parse(saved) : [];
      const updated = docs.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : doc,
      );
      localStorage.setItem("documentsV2", JSON.stringify(updated));
      setDocuments(updated);
      return;
    }

    // API mode: PUT /documents/:id
    try {
      await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      // Refresh documents list
      await fetchDocuments(currentFolderId);
    } catch (err) {
      console.error("Failed to update document:", err);
      throw new Error(err.message || "Failed to update document");
    }
  };

  // Delete a document
  const deleteDocument = async (id) => {
    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documentsV2");
      const docs = saved ? JSON.parse(saved) : [];
      // Also delete all children if it's a folder
      const doc = docs.find((d) => d.id === id);
      let idsToDelete = [id];
      if (doc && doc.type === "folder") {
        const childIds = docs.filter((d) => d.parentId === id).map((d) => d.id);
        idsToDelete = [...idsToDelete, ...childIds];
      }
      const updated = docs.filter((doc) => !idsToDelete.includes(doc.id));
      localStorage.setItem("documentsV2", JSON.stringify(updated));
      setDocuments(updated);
      return;
    }

    // API mode: DELETE /documents/:id
    try {
      await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "DELETE",
      });

      // Refresh documents list
      await fetchDocuments(currentFolderId);
    } catch (err) {
      console.error("Failed to delete document:", err);
      throw new Error(err.message || "Failed to delete document");
    }
  };

  // Move document to a different parent
  const moveDocument = async (id, newParentId) => {
    return updateDocument(id, { parentId: newParentId });
  };

  // Get documents in current folder
  const getCurrentFolderDocuments = () => {
    return documents.filter((doc) => doc.parentId === currentFolderId);
  };

  // Get folder breadcrumb path
  const getBreadcrumbPath = () => {
    if (!currentFolderId) return [];

    const path = [];
    let current = documents.find((d) => d.id === currentFolderId);

    while (current) {
      path.unshift(current);
      current = documents.find((d) => d.id === current.parentId);
    }

    return path;
  };

  // Navigate to folder
  const navigateToFolder = (folderId, folderTitle = null) => {
    setCurrentFolderId(folderId);
    setSelectedDocument(null);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
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
    documents,
    viewMode,
    currentFolderId,
    selectedDocument,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    moveDocument,
    getCurrentFolderDocuments,
    getBreadcrumbPath,
    navigateToFolder,
    toggleViewMode,
    setViewMode,
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
