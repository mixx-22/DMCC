import { useState, useEffect, useRef } from "react";
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
  };

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
          const uploadResult = await uploadFileToServer(documentData.metadata.file, apiService);
          
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
          setDocuments(prevDocs => [...prevDocs, createdDoc]);
        }
        
        return createdDoc;
      } else {
        throw new Error(response.message || "Unknown error occurred while creating document");
      }
    } catch (err) {
      console.error("Failed to create document:", err);
      throw new Error(err.message || "Failed to create document");
    }
  };

  // Update a document
  const updateDocument = async (id, updates) => {
    if (!USE_API) {
      // Mock mode: use localStorage
      const saved = localStorage.getItem("documents");
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
      localStorage.setItem("documents", JSON.stringify(updated));
      setDocuments(updated);
      return;
    }

    // API mode: PUT /documents/:id
    try {
      const response = await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      // Optimize: Update document in existing array instead of re-fetching
      const updatedDoc = response.data || response.document || { ...updates, id, updatedAt: new Date().toISOString() };
      
      // Check if document is being moved to a different folder
      const isMoving = 'parentId' in updates;
      const newParentId = updates.parentId;
      
      if (isMoving && newParentId !== currentFolderId) {
        // Document moved out of current folder - remove from list
        setDocuments(prevDocs => 
          prevDocs.filter(doc => (doc.id !== id && doc._id !== id))
        );
      } else {
        // Document updated in current folder - update in list
        setDocuments(prevDocs => 
          prevDocs.map(doc => doc.id === id || doc._id === id ? { ...doc, ...updatedDoc } : doc)
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
      const doc = docs.find((d) => d.id === id);
      let idsToDelete = [id];
      if (doc && doc.type === "folder") {
        const childIds = docs.filter((d) => d.parentId === id).map((d) => d.id);
        idsToDelete = [...idsToDelete, ...childIds];
      }
      const updated = docs.filter((doc) => !idsToDelete.includes(doc.id));
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
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id && doc._id !== id));
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
    folder,
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
