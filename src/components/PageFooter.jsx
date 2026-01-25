import PropTypes from "prop-types";
import { Box, Flex, Portal, useColorModeValue } from "@chakra-ui/react";
import { useMemo } from "react";
import { useLayout } from "../context/_useContext";

const PageFooter = ({ children }) => {
  const { footerRef } = useLayout();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  const hasContent = useMemo(
    () => ![null, undefined, ""].includes(children),
    [children],
  );

  if (!hasContent) return null;
  return (
    <Portal containerRef={footerRef}>
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
          <Box w="full" flex={1}>
            {children}
          </Box>
        </Flex>
      </Flex>
    </Portal>
  );
};

PageFooter.propTypes = {
  children: PropTypes.node,
};

export default PageFooter;
