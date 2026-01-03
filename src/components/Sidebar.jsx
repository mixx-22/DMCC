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
  Spacer,
  Image,
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiChevronDown,
  FiChevronUp,
  FiSettings,
} from "react-icons/fi";
import logoDefault from "../images/auptilyze.png";
import logoWhite from "../images/auptilyze-white.png";

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
  icon = null,
  label,
  isCollapsed,
  isMobile = false,
  isChild = false,
  hasChildren = false,
  isExpanded = false,
  isActive = false,
  onToggle,
  onClick,
}) => {
  const activeBg = useColorModeValue("brandPrimary.50", "whiteAlpha.200");
  const activeColor = useColorModeValue("brandPrimary.600", "brandPrimary.200");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const childTextColor = useColorModeValue("gray.500", "gray.400");

  const content = (
    <Flex
      align="center"
      h={isChild ? "40px" : "sidebar.row"}
      justify={isCollapsed && !isMobile ? "center" : "flex-start"}
      pl={isCollapsed && !isMobile ? 0 : isChild ? 12 : 4}
      pr={isCollapsed && !isMobile ? 0 : isChild ? 8 : 4}
      gap={isCollapsed && !isMobile ? 0 : 3}
      borderRadius="0"
      cursor="pointer"
      bg={isActive ? activeBg : "transparent"}
      color={isActive ? activeColor : isChild ? childTextColor : textColor}
      fontWeight={isActive ? "semibold" : "normal"}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      title={isCollapsed && !isMobile ? label : ""}
      w="full"
      position="relative"
      onClick={onClick}
    >
      {isActive && !isMobile && !isChild && (
        <Box
          position="absolute"
          left={0}
          w="3px"
          h="full"
          bg={activeColor}
          transition="all 0.2s"
        />
      )}

      {icon !== null && (
        <Icon as={icon} boxSize={isChild ? 4 : 5} minW={isChild ? 4 : 5} />
      )}
      {(!isCollapsed || isMobile) && (
        <>
          <Text flex={1} noOfLines={1} fontSize={isChild ? "xs" : "sm"}>
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
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoSrc = useColorModeValue(logoDefault, logoWhite);
  const textColor = useColorModeValue("gray.700", "gray.300");
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.800");
  const brandColor = useColorModeValue("brandPrimary.500", "brandPrimary.200");
  const subMenuBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isAdmin = true;

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
          // { path: "/documents?status=pending", label: "Pending Approval" },
        ],
      },
      // { id: "archive", path: "/archive", label: "Archive", icon: FiArchive },
      // {
      //   id: "certifications",
      //   path: "/certifications",
      //   label: "Certifications",
      //   icon: FiShield,
      // },
    ];
    if (isAdmin) {
      items.push({
        id: "users",
        path: "/users",
        label: "Users",
        icon: FiUsers,
      });
      items.push({
        id: "settings",
        path: "/settings",
        label: "Settings",
        icon: FiSettings,
        children: [
          // { path: "/settings", label: "All Settings" },
          { path: "/roles", label: "Roles & Permissions" },
        ],
      });
    }
    return items;
  }, [isAdmin]);

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
            onClick={() => mobileMode && !hasChildren && onClose()}
          />

          {hasChildren && (
            <Collapse in={isExpanded} animateOpacity>
              <VStack align="stretch" spacing={0} bg={subMenuBg}>
                {item.children.map((child) => (
                  <SidebarRow
                    key={child.path}
                    to={child.path}
                    label={child.label}
                    isCollapsed={isCollapsed}
                    isMobile={mobileMode}
                    isChild={true}
                    isActive={isRouteMatch(location, child.path)}
                    onClick={() => mobileMode && onClose()}
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
          h="sidebar.row"
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
              borderRadius="0"
            >
              <Text fontSize="xs">Menu</Text>
            </IconButton>
          </Flex>
        </Box>

        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent bg={bgColor}>
            <DrawerCloseButton borderRadius="full" color={textColor} />
            <DrawerBody px={0} py="sidebar.row">
              <VStack spacing={0} align="stretch" h="full">
                <Spacer />
                <Heading
                  fontSize="lg"
                  mb={"sidebar.row"}
                  color={brandColor}
                  px={4}
                >
                  {import.meta.env.VITE_PROJECT_NAME}
                </Heading>
                {renderNavList(navItems, true)}
              </VStack>
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
      <Flex
        align="center"
        h="sidebar.row"
        justify={isCollapsed ? "center" : "flex-start"}
        pl={isCollapsed ? 0 : 4}
        pr={isCollapsed ? 0 : 2}
        mb={"sidebar.row"}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        {!isCollapsed && (
          <>
            <Image
              w={24}
              src={logoSrc}
              alt={import.meta.env.VITE_PROJECT_NAME}
            />
            <Spacer />
          </>
        )}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={<Icon as={isCollapsed ? FiChevronRight : FiChevronLeft} />}
          size="sm"
          variant="ghost"
          color={textColor}
          onClick={() => setIsCollapsed(!isCollapsed)}
          isRound
        />
      </Flex>

      <VStack spacing={0} align="stretch">
        {renderNavList(navItems)}
      </VStack>
    </Box>
  );
};

export default Sidebar;
