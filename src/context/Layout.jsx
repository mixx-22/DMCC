import { useRef, useState, useCallback, useEffect } from "react";
import { LayoutContext } from "./_contexts";

export const LayoutProvider = ({ children }) => {
  const pageRef = useRef();
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
  // Returns true if it was a double-click (caller should handle navigation)
  // Returns false if it was a single-click (drawer should be shown)
  const handleDocumentClick = useCallback(
    (doc) => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;

      if (lastClickId === doc.id && timeDiff < 300) {
        // Double click - caller should handle navigation
        setLastClickTime(0);
        setLastClickId(null);
        return { isDoubleClick: true, document: doc };
      } else {
        // Single click - show in drawer
        setSelectedDocument(doc);
        setLastClickTime(now);
        setLastClickId(doc.id);
        return { isDoubleClick: false, document: doc };
      }
    },
    [lastClickTime, lastClickId],
  );

  // Close document drawer
  const closeDocumentDrawer = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        pageRef,
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
