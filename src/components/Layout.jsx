import { useState, useEffect, useMemo } from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";
import { useLayout } from "../context/_useContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { pageRef } = useLayout();
  const xsmallMaxContent = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return ["form"].includes(pathSegments[1]) && pathSegments.length === 3;
  }, [location.pathname]);
  const smallMaxContent = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return (
      (["users", "teams", "document", "audit-schedule"].includes(
        pathSegments[0],
      ) &&
        pathSegments.length === 2) ||
      (["settings"].includes(pathSegments[0]) && pathSegments.length === 1)
    );
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
      <Flex ref={pageRef} direction="column" flex={1} overflow="hidden">
        <Header />
        <Box
          flex={1}
          bg={contentBg}
          overflowY="auto"
          pb={isMobile ? "80px" : 0}
        >
          <Box
            maxW={
              xsmallMaxContent
                ? "page.maxContent-xs"
                : smallMaxContent
                  ? "page.maxContent-sm"
                  : "page.maxContent"
            }
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
