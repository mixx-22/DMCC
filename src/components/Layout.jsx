import { useState, useEffect, useMemo } from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();
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
          pb={isMobile ? "80px" : 0}
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
