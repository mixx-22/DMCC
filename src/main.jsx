import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import theme from "./theme";
import { AppProvider } from "./context/AppContext";
import { UserProvider } from "./context/UserContext";
import { DocumentsProvider } from "./context/DocumentsContext";
import "./index.css";
import Fonts from "./components/Fonts";
import { LayoutProvider } from "./context/Layout";
import { PermissionProvider } from "./context/Permission";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <UserProvider>
        <PermissionProvider>
          <AppProvider>
            <DocumentsProvider>
              <LayoutProvider>
                <Fonts />
                <App />
              </LayoutProvider>
            </DocumentsProvider>
          </AppProvider>
        </PermissionProvider>
      </UserProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
