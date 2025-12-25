import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Link,
  Text,
  Icon,
  Heading,
  useColorModeValue,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Flex,
  Spacer,
  Collapse,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiShield,
  FiUsers,
  FiArchive,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";

const Sidebar = () => {
  const { currentUser } = useApp();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsBottomNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsBottomNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsBottomNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const toggleItem = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const navItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      label: "Dashboard",
      icon: FiHome,
    },
    {
      id: "documents",
      path: "/documents",
      label: "Documents",
      icon: FiFileText,
      children: [
        { path: "/documents", label: "All Documents" },
        { path: "/documents?status=pending", label: "Pending Approval" },
      ],
    },
    {
      id: "archive",
      path: "/archive",
      label: "Archive",
      icon: FiArchive,
    },
    {
      id: "certifications",
      path: "/certifications",
      label: "Certifications",
      icon: FiShield,
    },
  ];

  if (currentUser?.userType === "Admin") {
    navItems.push({
      id: "accounts",
      path: "/accounts",
      label: "Accounts",
      icon: FiUsers,
    });
  }

  const NavItem = ({ item, isMobile = false }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <Box>
        <Link
          as={NavLink}
          to={item.path}
          display="flex"
          alignItems="center"
          gap={3}
          p={3}
          borderRadius="md"
          _hover={{ bg: "gray.100" }}
          _activeLink={{
            bg: "blue.50",
            color: "blue.600",
            fontWeight: "semibold",
          }}
          onClick={isMobile ? onClose : undefined}
        >
          <Icon as={item.icon} boxSize={5} />
          {(!isCollapsed || isMobile) && <Text>{item.label}</Text>}
          {hasChildren && (!isCollapsed || isMobile) && <Spacer />}
          {hasChildren && (!isCollapsed || isMobile) && (
            <Icon
              as={isExpanded ? FiChevronUp : FiChevronDown}
              boxSize={4}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(item.id);
              }}
              cursor="pointer"
            />
          )}
        </Link>
        {hasChildren && (
          <Collapse in={isExpanded} animateOpacity>
            <VStack
              spacing={0}
              align="stretch"
              pl={!isCollapsed || isMobile ? 8 : 2}
              mt={1}
            >
              {item.children.map((child, index) => (
                <Link
                  key={`${item.id}-child-${index}`}
                  as={NavLink}
                  to={child.path}
                  display="flex"
                  alignItems="center"
                  gap={3}
                  p={2}
                  pl={3}
                  borderRadius="md"
                  fontSize="sm"
                  _hover={{ bg: "gray.50" }}
                  _activeLink={{
                    bg: "blue.50",
                    color: "blue.600",
                    fontWeight: "semibold",
                  }}
                  onClick={isMobile ? onClose : undefined}
                >
                  <Text>{child.label}</Text>
                </Link>
              ))}
            </VStack>
          </Collapse>
        )}
      </Box>
    );
  };

  if (isMobile) {
    const mainNavItems = [
      { id: "dashboard", path: "/dashboard", label: "Home", icon: FiHome },
      { id: "documents", path: "/documents", label: "Docs", icon: FiFileText },
      { id: "more", path: "#", label: "More", icon: FiMenu, isMore: true },
    ];

    return (
      <>
        {/* Bottom Navigation Bar */}
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={bgColor}
          borderTop="1px"
          borderColor={borderColor}
          zIndex="docked"
          p={2}
          top={isBottomNavVisible ? "auto" : "100vh"}
          transition="top 0.3s ease-in-out"
          boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
        >
          <Flex justify="space-around" align="center">
            {/* Menu Toggle */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
              p={2}
              borderRadius="md"
              cursor="pointer"
              onClick={onOpen}
              _hover={{ bg: "gray.100" }}
            >
              <Icon as={FiMenu} boxSize={5} />
              <Text fontSize="xs">Menu</Text>
            </Box>

            {/* Main Navigation Items */}
            {mainNavItems.map((item) => (
              <Link
                key={`mobile-${item.id}`}
                as={item.isMore ? "div" : NavLink}
                to={item.isMore ? undefined : item.path}
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1}
                p={2}
                borderRadius="md"
                cursor={item.isMore ? "pointer" : "default"}
                onClick={item.isMore ? onOpen : undefined}
                _activeLink={
                  !item.isMore
                    ? {
                        bg: "blue.50",
                        color: "blue.600",
                      }
                    : {}
                }
                _hover={item.isMore ? { bg: "gray.100" } : {}}
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontSize="xs">{item.label}</Text>
              </Link>
            ))}
          </Flex>
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <Box bg={bgColor} h="100%">
                <Box p={6}>
                  <Heading
                    fontSize="xl"
                    fontWeight="bold"
                    color="brandPrimary.500"
                    mb={8}
                  >
                    auptilyze
                  </Heading>
                  <VStack spacing={0} align="stretch">
                    {navItems.map((item) => (
                      <NavItem key={item.id} item={item} isMobile={true} />
                    ))}
                  </VStack>
                </Box>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      w={isCollapsed ? "80px" : "250px"}
      bg={bgColor}
      h="100vh"
      position="sticky"
      top={0}
      borderRight="1px"
      borderColor={borderColor}
      transition="width 0.3s ease"
    >
      <Box p={4}>
        <Flex align="center" justify="space-between" mb={8}>
          {!isCollapsed && (
            <Heading fontSize="xl" fontWeight="bold" color="brandPrimary.500">
              auptilyze
            </Heading>
          )}
          <IconButton
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            aria-label="Toggle sidebar"
          />
        </Flex>
        <VStack spacing={0} align="stretch">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default Sidebar;
