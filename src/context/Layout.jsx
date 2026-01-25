import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutContext } from "./_contexts";

export const LayoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const headerRef = useRef();
  const footerRef = useRef();
  const [hasHeaderContent, setHasHeaderContent] = useState(false);
  const [hasFooterContent, setHasFooterContent] = useState(false);

  // View mode state - shared across the entire site
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("viewMode");
    return saved || "grid"; // "grid" or "list"
  });

  // Document drawer state - shared across the entire site
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickId, setLastClickId] = useState(null);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const updateHeaderContent = useCallback((hasContent) => {
    setHasHeaderContent(hasContent);
  }, []);

  const updateFooterContent = useCallback((hasContent) => {
    setHasFooterContent(hasContent);
  }, []);

  // Toggle view mode between grid and list
  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  }, []);

  // Handle document click with double-click detection
  // sourcePage: optional object with { path, label } for navigation state
  const handleDocumentClick = useCallback(
    (doc, sourcePage = null) => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;

      if (lastClickId === doc.id && timeDiff < 300) {
        // Double click - navigate to document/folder
        if (doc.type === "folder" || doc.type === "auditSchedule") {
          navigate(`/documents/folders/${doc.id}`);
        } else if (doc.type === "file" || doc.type === "formTemplate") {
          if (sourcePage) {
            navigate(`/document/${doc.id}`, { state: { from: sourcePage } });
          } else {
            navigate(`/document/${doc.id}`);
          }
        }
        setLastClickTime(0);
        setLastClickId(null);
      } else {
        // Single click - show in drawer
        setSelectedDocument(doc);
        setLastClickTime(now);
        setLastClickId(doc.id);
      }
    },
    [lastClickTime, lastClickId, navigate],
  );

  // Close document drawer
  const closeDocumentDrawer = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        headerRef,
        footerRef,
        hasHeaderContent,
        hasFooterContent,
        updateHeaderContent,
        updateFooterContent,
        viewMode,
        setViewMode,
        toggleViewMode,
        selectedDocument,
        setSelectedDocument,
        handleDocumentClick,
        closeDocumentDrawer,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
