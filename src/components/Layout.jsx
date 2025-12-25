import { useState, useEffect } from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
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
          <Box maxW="page.maxContent" mx="auto" w="full" p="page.padding">
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;
