import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./useUser";

const DocumentsContext = createContext();

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
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("documentsV2");
    return saved ? JSON.parse(saved) : [];
  });

  // View preferences
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("documentsViewMode");
    return saved || "grid"; // "grid" or "list"
  });

  // Current folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(null);

  // Selected document for drawer
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Persist documents to localStorage
  useEffect(() => {
    localStorage.setItem("documentsV2", JSON.stringify(documents));
  }, [documents]);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem("documentsViewMode", viewMode);
  }, [viewMode]);

  // Generate unique ID
  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create a new document (file/folder/auditSchedule)
  const createDocument = (documentData) => {
    const newDocument = {
      id: generateId(),
      title: documentData.title || "",
      description: documentData.description || "",
      type: documentData.type, // "file", "folder", "auditSchedule"
      status: documentData.status ?? -1, // -1: draft, 0: under review, 1: approved, 2: archived, 3: expired
      parentId: documentData.parentId || null,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
        allowInheritance: 0,
      };
    } else if (documentData.type === "auditSchedule" && !documentData.metadata) {
      newDocument.metadata = {
        code: "",
        type: "",
        standard: "",
        status: 0,
        auditors: [],
        organization: {},
      };
    }

    setDocuments((prev) => [...prev, newDocument]);
    return newDocument;
  };

  // Update a document
  const updateDocument = (id, updates) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );
  };

  // Delete a document
  const deleteDocument = (id) => {
    // Also delete all children if it's a folder
    const doc = documents.find((d) => d.id === id);
    if (doc && doc.type === "folder") {
      const childIds = documents
        .filter((d) => d.parentId === id)
        .map((d) => d.id);
      childIds.forEach((childId) => deleteDocument(childId));
    }
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // Move document to a different parent
  const moveDocument = (id, newParentId) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              parentId: newParentId,
              updatedAt: new Date().toISOString(),
            }
          : doc
      )
    );
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
    documents,
    viewMode,
    currentFolderId,
    selectedDocument,
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
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};
