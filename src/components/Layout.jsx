import { useState, useEffect, useMemo } from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { useLayout } from "../context/Layout";

// Mobile navigation constants - keep in sync across Sidebar.jsx, Footer.jsx, and Layout.jsx
const MOBILE_NAV_HEIGHT = 60; // Must match value in Sidebar.jsx
const FOOTER_HEIGHT = 48; // From theme sidebar.row

const Layout = ({ children }) => {
  const location = useLocation();
  const { isBottomNavVisible } = useLayout();
  const smallMaxContent = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return ["users"].includes(pathSegments[0]) && pathSegments.length === 2;
  }, [location.pathname]);
  const contentBg = useColorModeValue("gray.50", "gray.900");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Flex direction="column" flex={1} overflow="hidden">
        <Header />
        <Box
          flex={1}
          bg={contentBg}
          overflowY="auto"
          pb={
            isMobile
              ? isBottomNavVisible
                ? `${MOBILE_NAV_HEIGHT + FOOTER_HEIGHT}px`
                : `${FOOTER_HEIGHT}px`
              : `${FOOTER_HEIGHT}px`
          }
        >
          <Box
            maxW={smallMaxContent ? "page.maxContent-sm" : "page.maxContent"}
            mx="auto"
            w="full"
            p="page.padding"
          >
            {children}
          </Box>
        </Box>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default Layout;
