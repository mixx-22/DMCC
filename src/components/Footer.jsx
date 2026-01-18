import { Flex, Box, useColorModeValue } from "@chakra-ui/react";
import { useLayout } from "../context/_useContext";

const Footer = () => {
  const { footerRef } = useLayout();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  return (
    <Flex
      bg={bgColor}
      borderTop="1px"
      border="none"
      position="sticky"
      bottom={0}
      zIndex="sticky"
      h="sidebar.row"
      justify="center"
    >
      <Flex
        w="full"
        px="page.padding"
        maxW="page.maxContent"
        alignItems="center"
      >
        <Box w="full" flex={1} ref={footerRef}></Box>
      </Flex>
    </Flex>
  );
};

export default Footer;
