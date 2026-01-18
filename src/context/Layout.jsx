import { useRef } from "react";
import { LayoutContext } from "./_contexts";

export const LayoutProvider = ({ children }) => {
  const headerRef = useRef();
  const footerRef = useRef();

  return (
    <LayoutContext.Provider
      value={{
        headerRef,
        footerRef,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
