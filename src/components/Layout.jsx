import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const contentBg = useColorModeValue("gray.50", "gray.900");
  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Flex direction="column" flex={1} overflow="hidden">
        <Header />
        <Box bg={contentBg} flex={1} overflowY="auto">
          <Box maxW="1200px" mx="auto" w="full" p={6}>
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;
