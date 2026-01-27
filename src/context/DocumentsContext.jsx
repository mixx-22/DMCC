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

  const [folder, setFolder] = useState(rootFolder);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);

  const fetchingRef = useRef(false);
  const lastFetchedFolderIdRef = useRef(null);

  const fetchDocuments = useCallback(async (folderId = null) => {
    // Prevent duplicate requests
    if (fetchingRef.current && lastFetchedFolderIdRef.current === folderId) {
      return;
    }

    if (!USE_API) {
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

  const fetchDocumentById = async (documentId) => {
    if (!USE_API) {
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

  const createDocument = async (documentData) => {
    const newDocument = {
      title: documentData.title || "",
      description: documentData.description || "",
      type: documentData.type,
      status: documentData.status ?? -1,
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

    try {
      let response;

      if (documentData.type === "file") {
        if (documentData.metadata?.file) {
          const uploadResult = await uploadFileToServer(
            documentData.metadata.file,
            apiService,
          );

          // Preserve additional metadata fields (like fileType) while updating file-specific fields
          newDocument.metadata = {
            ...documentData.metadata,
            filename: uploadResult.filename,
            size: uploadResult.size,
            key: uploadResult.key,
            version: DEFAULT_FILE_VERSION,
            file: undefined, // Remove the File object from metadata
          };
        } else {
          throw new Error("File is required for document type 'file'");
        }

        response = await apiService.request(DOCUMENTS_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(newDocument),
        });
      } else {
        response = await apiService.request(DOCUMENTS_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(newDocument),
        });
      }

      if (response.success) {
        const createdDoc = response.data || response.document || response;

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

  const extractIds = (items) => {
    if (!items) return [];
    if (!Array.isArray(items)) return items;

    return items.map((item) => {
      if (typeof item === "string") return item;
      return item?.id || item?._id;
    });
  };

  const formatUpdatesForAPI = (data = {}, updates) => {
    const payload = { ...updates };
    const consolidatedData = { ...data, ...updates };

    if (updates.privacy) {
      payload.privacy = {
        ...updates.privacy,
        users: extractIds(updates.privacy.users),
        teams: extractIds(updates.privacy.teams),
        roles: extractIds(updates.privacy.roles),
      };

      consolidatedData.privacy = {
        ...updates.privacy,
        users: updates.privacy.users || [],
        teams: updates.privacy.teams || [],
        roles: updates.privacy.roles || [],
      };
    }

    if (updates.metadata) {
      const payloadMeta = { ...updates.metadata };
      const consolidatedMeta = { ...updates.metadata };

      if (typeof updates.metadata.documentNumber === "string") {
        const trimmedDocNumber =
          updates.metadata.documentNumber.trim() || undefined;
        payloadMeta.documentNumber = trimmedDocNumber;
        consolidatedMeta.documentNumber = trimmedDocNumber;
      }

      if (payloadMeta.fileType && typeof payloadMeta.fileType === "object") {
        payloadMeta.fileType =
          payloadMeta.fileType.id || payloadMeta.fileType._id || null;
      }

      payload.metadata = payloadMeta;
      consolidatedData.metadata = consolidatedMeta;
    }

    return { payload, consolidatedData };
  };

  const updateDocument = async (document, updates) => {
    const id = document?.id || document?._id;
    const { payload, consolidatedData } = formatUpdatesForAPI(
      document,
      updates,
    );

    if (!USE_API) {
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
              ...consolidatedData,
              ...updatedDoc,
            }
          : doc,
      );

      const result = updated.find((doc) => doc.id === id);

      localStorage.setItem("documents", JSON.stringify(updated));
      setDocuments(updated);
      return result;
    }

    const updatedDoc = {
      id,
      ...consolidatedData,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response.success) {
        const isMoving = "parentId" in updates;
        const newParentId = updates.parentId;

        if (isMoving && newParentId !== currentFolderId) {
          setDocuments((prevDocs) =>
            prevDocs.filter((doc) => doc.id !== id && doc._id !== id),
          );
        } else {
          setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
              doc.id === id || doc._id === id ? { ...doc, ...updatedDoc } : doc,
            ),
          );
        }

        return updatedDoc;
      } else {
        throw "Refresh your tab to view changes.";
      }
    } catch (err) {
      console.error("Failed to update document:", err);
      throw new Error(err.message || "Failed to update document");
    }
  };

  const deleteDocument = async (id) => {
    if (!USE_API) {
      const saved = localStorage.getItem("documents");
      const docs = saved ? JSON.parse(saved) : [];
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

    try {
      await apiService.request(`${DOCUMENTS_ENDPOINT}/${id}`, {
        method: "DELETE",
      });

      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== id && doc._id !== id),
      );
    } catch (err) {
      console.error("Failed to delete document:", err);
      throw new Error(err.message || "Failed to delete document");
    }
  };

  const moveDocument = async (document, newParentId) => {
    return updateDocument(document, { parentId: newParentId });
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolderId(folderId);
  };

  const canViewDocument = (doc) => {
    if (!currentUser) return false;

    if (doc.owner.id === currentUser.id) return true;

    const { users, teams, roles } = doc.privacy;

    if (users.length === 0 && teams.length === 0 && roles.length === 0) {
      return true;
    }

    if (users.some((u) => u.id === currentUser.id || u === currentUser.id)) {
      return true;
    }

    const userTeam = currentUser.team || currentUser.department;
    if (teams.some((t) => t.id === userTeam || t === userTeam)) {
      return true;
    }

    const userRole = currentUser.userType;
    if (roles.some((r) => r.id === userRole || r === userRole)) {
      return true;
    }

    return false;
  };

  const getVisibleDocuments = () => {
    return documents.filter(canViewDocument);
  };

  const value = {
    folder,
    documents,
    currentFolderId,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    moveDocument,
    navigateToFolder,
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
