import { useRef, useState, useCallback, useEffect } from "react";
import { LayoutContext } from "./_contexts";

export const LayoutProvider = ({ children }) => {
  const headerRef = useRef();
  const footerRef = useRef();
  const [hasHeaderContent, setHasHeaderContent] = useState(false);
  const [hasFooterContent, setHasFooterContent] = useState(false);

  // View mode state - shared across the entire site
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("viewMode");
    return saved || "grid"; // "grid" or "list"
  });

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
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
