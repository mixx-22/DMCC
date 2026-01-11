import { Flex, Box, useColorModeValue } from "@chakra-ui/react";
import { useLayout } from "../context/Layout";
import { useState, useEffect } from "react";

const MOBILE_NAV_HEIGHT = 60; // Must match height in Sidebar.jsx

const Footer = () => {
  const { footerRef, isBottomNavVisible } = useLayout();
  const bgColor = useColorModeValue("gray.50", "gray.900");
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
    <Flex
      bg={bgColor}
      borderTop="1px"
      border="none"
      position={isMobile ? "fixed" : "sticky"}
      bottom={0}
      left={isMobile ? 0 : undefined}
      right={isMobile ? 0 : undefined}
      zIndex="sticky"
      h="sidebar.row"
      justify="center"
      transition="transform 0.3s ease"
      transform={
        isMobile
          ? isBottomNavVisible
            ? `translateY(-${MOBILE_NAV_HEIGHT}px)`
            : "translateY(0)"
          : "none"
      }
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
