import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import theme from "./theme";
import { AppProvider } from "./context/AppContext";
import { UserProvider } from "./context/UserContext";
import "./index.css";
import Fonts from "./components/Fonts";
import { LayoutProvider } from "./context/Layout";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <UserProvider>
        <AppProvider>
          <LayoutProvider>
            <Fonts />
            <App />
          </LayoutProvider>
        </AppProvider>
      </UserProvider>
    </ChakraProvider>
  </React.StrictMode>
);
