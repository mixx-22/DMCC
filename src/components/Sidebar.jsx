import { useState, useEffect, useMemo } from "react";
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
  Collapse,
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
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

const isRouteMatch = (location, target) => {
  const [targetPath, targetQuery] = target.split("?");
  const targetParams = new URLSearchParams(targetQuery);
  const currentParams = new URLSearchParams(location.search);

  if (location.pathname !== targetPath) return false;
  if (!targetQuery) return currentParams.toString() === "";

  for (const [key, value] of targetParams.entries()) {
    if (currentParams.get(key) !== value) return false;
  }
  return true;
};

const SidebarRow = ({
  to,
  icon,
  label,
  isCollapsed,
  isMobile = false,
  hasChildren = false,
  isExpanded = false,
  isActive = false,
  onToggle,
}) => {
  const activeBg = useColorModeValue("blue.50", "whiteAlpha.200");
  const activeColor = useColorModeValue("blue.600", "blue.200");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.700", "gray.300");

  const content = (
    <Flex
      align="center"
      h="sidebar.row"
      px={3}
      gap={3}
      borderRadius="md"
      cursor="pointer"
      bg={isActive ? activeBg : "transparent"}
      color={isActive ? activeColor : textColor}
      fontWeight={isActive ? "semibold" : "normal"}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      transition="all 0.2s"
      title={isCollapsed && !isMobile ? label : ""}
      w="full"
    >
      <Icon as={icon} boxSize={5} minW={5} />
      {(!isCollapsed || isMobile) && (
        <>
          <Text flex={1} noOfLines={1} fontSize="sm">
            {label}
          </Text>
          {hasChildren && (
            <Icon
              as={isExpanded ? FiChevronUp : FiChevronDown}
              boxSize={4}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle?.();
              }}
            />
          )}
        </>
      )}
    </Flex>
  );

  if (to) {
    return (
      <Link as={NavLink} to={to} w="full" _hover={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return content;
};

const Sidebar = () => {
  const { currentUser } = useApp();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue("gray.700", "gray.300");

  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const brandColor = useColorModeValue("brandPrimary.500", "brandPrimary.200");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = useMemo(() => {
    const items = [
      { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: FiHome },
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
      { id: "archive", path: "/archive", label: "Archive", icon: FiArchive },
      {
        id: "certifications",
        path: "/certifications",
        label: "Certifications",
        icon: FiShield,
      },
    ];
    if (currentUser?.userType === "Admin") {
      items.push({
        id: "accounts",
        path: "/accounts",
        label: "Accounts",
        icon: FiUsers,
      });
    }
    return items;
  }, [currentUser]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) setIsBottomNavVisible(true);
      else if (currentY > lastScrollY && currentY > 100)
        setIsBottomNavVisible(false);
      else if (currentY < lastScrollY) setIsBottomNavVisible(true);
      setLastScrollY(currentY);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (isCollapsed && !isMobile) {
      setExpandedItems(new Set());
      return;
    }

    const timer = setTimeout(() => {
      const activeParent = navItems.find((item) => {
        return (
          item.children?.some((child) => isRouteMatch(location, child.path)) ||
          isRouteMatch(location, item.path)
        );
      });
      setExpandedItems(activeParent ? new Set([activeParent.id]) : new Set());
    }, 100);

    return () => clearTimeout(timer);
  }, [location, navItems, isCollapsed, isMobile]);

  const toggleItem = (id) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedItems(new Set([id]));
      return;
    }
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderNavList = (items, mobileMode = false) =>
    items.map((item) => {
      const hasChildren = !!item.children;
      const isActiveParent = hasChildren
        ? item.children.some((child) => isRouteMatch(location, child.path)) ||
          isRouteMatch(location, item.path)
        : isRouteMatch(location, item.path);

      const isExpanded =
        expandedItems.has(item.id) && (!isCollapsed || mobileMode);

      return (
        <Box key={item.id} w="full">
          <SidebarRow
            to={item.path}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
            isMobile={mobileMode}
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            isActive={isActiveParent}
            onToggle={() => toggleItem(item.id)}
          />

          {hasChildren && (
            <Collapse in={isExpanded} animateOpacity>
              <VStack
                align="stretch"
                pl={isCollapsed && !mobileMode ? 0 : 8}
                spacing={0}
                py={1}
              >
                {item.children.map((child) => (
                  <SidebarRow
                    key={child.path}
                    to={child.path}
                    icon={FiFileText}
                    label={child.label}
                    isCollapsed={isCollapsed}
                    isMobile={mobileMode}
                    isActive={isRouteMatch(location, child.path)}
                  />
                ))}
              </VStack>
            </Collapse>
          )}
        </Box>
      );
    });

  if (isMobile) {
    return (
      <>
        {/* Mobile Bottom Bar */}
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={bgColor}
          borderTop="1px"
          borderColor={borderColor}
          zIndex="docked"
          transition="transform 0.3s ease"
          transform={isBottomNavVisible ? "translateY(0)" : "translateY(100%)"}
        >
          <Flex justify="center" py={3}>
            <IconButton
              aria-label="Open Menu"
              icon={<FiMenu size={20} />}
              variant="ghost"
              onClick={onOpen}
              display="flex"
              flexDirection="column"
              h="auto"
              gap={1}
              color={textColor}
            >
              <Text fontSize="xs">Menu</Text>
            </IconButton>
          </Flex>
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent bg={bgColor}>
            <DrawerCloseButton color={textColor} />
            <DrawerBody p={0}>
              <Box p={4}>
                <Heading fontSize="lg" mb={6} color={brandColor} px={2}>
                  {import.meta.env.VITE_PROJECT_NAME}
                </Heading>
                <VStack spacing={1} align="stretch">
                  {renderNavList(navItems, true)}
                </VStack>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      w={isCollapsed ? "sidebar.collapsed" : "sidebar.expanded"}
      bg={bgColor}
      h="100vh"
      position="sticky"
      top={0}
      borderRight="1px"
      borderColor={borderColor}
      transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      overflowX="hidden"
    >
      <Flex align="center" h="sidebar.row" px={3} mb={2}>
        {!isCollapsed && (
          <Heading
            flex={1}
            fontSize="md"
            fontWeight="bold"
            color={brandColor}
            noOfLines={1}
          >
            {import.meta.env.VITE_PROJECT_NAME}
          </Heading>
        )}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={<Icon as={isCollapsed ? FiChevronRight : FiChevronLeft} />}
          size="sm"
          variant="ghost"
          color={textColor}
          mx={isCollapsed ? "auto" : 0}
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </Flex>
      <VStack spacing={1} align="stretch" px={2}>
        {renderNavList(navItems)}
      </VStack>
    </Box>
  );
};

export default Sidebar;
