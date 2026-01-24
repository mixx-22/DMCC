import { useRef, useState, useCallback } from "react";
import { LayoutContext } from "./_contexts";

export const LayoutProvider = ({ children }) => {
  const headerRef = useRef();
  const footerRef = useRef();
  const [hasHeaderContent, setHasHeaderContent] = useState(false);
  const [hasFooterContent, setHasFooterContent] = useState(false);

  const updateHeaderContent = useCallback((hasContent) => {
    setHasHeaderContent(hasContent);
  }, []);

  const updateFooterContent = useCallback((hasContent) => {
    setHasFooterContent(hasContent);
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
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
