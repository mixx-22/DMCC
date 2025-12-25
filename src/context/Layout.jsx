import { createContext, useContext, useRef } from "react";

const Layout = createContext();

export const useLayout = () => {
  const context = useContext(Layout);
  if (!context) {
    throw new Error("useLayout must be used within LayoutProvider");
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const headerRef = useRef();

  return (
    <Layout.Provider
      value={{
        headerRef,
      }}
    >
      {children}
    </Layout.Provider>
  );
};
