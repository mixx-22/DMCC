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

/* ────────────────────────────── */
/* Sidebar Row */
/* ────────────────────────────── */

const SidebarRow = ({
  to,
  icon,
  label,
  isCollapsed,
  isMobile = false,
  hasChildren = false,
  isExpanded = false,
  onToggle,
  onClick,
}) => {
  return (
    <Link
      as={to ? NavLink : "div"}
      to={to}
      display="flex"
      alignItems="center"
      h="sidebar.row"
      px={3}
      gap={3}
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: "gray.100" }}
      _activeLink={
        to
          ? {
              bg: "blue.50",
              color: "blue.600",
              fontWeight: "semibold",
            }
          : {}
      }
      onClick={onClick}
    >
      {/* Icon always visible */}
      <Icon as={icon} boxSize={5} />

      {/* Label + chevron ONLY when expanded or mobile */}
      {(!isCollapsed || isMobile) && (
        <>
          <Text>{label}</Text>

          {hasChildren && <Flex flex={1} />}

          {hasChildren && (
            <Icon
              as={isExpanded ? FiChevronUp : FiChevronDown}
              boxSize={4}
              cursor="pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle?.();
              }}
            />
          )}
        </>
      )}
    </Link>
  );
};

/* ────────────────────────────── */
/* Sidebar */
/* ────────────────────────────── */

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

  /* ────────────────────────────── */
  /* Responsive + Scroll */
  /* ────────────────────────────── */

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) setIsBottomNavVisible(true);
      else if (currentY > lastScrollY && currentY > 100)
        setIsBottomNavVisible(false);
      else if (currentY < lastScrollY) setIsBottomNavVisible(true);
      setLastScrollY(currentY);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const toggleItem = (id) => {
    const next = new Set(expandedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedItems(next);
  };

  /* ────────────────────────────── */
  /* Navigation Data */
  /* ────────────────────────────── */

  const navItems = [
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
    navItems.push({
      id: "accounts",
      path: "/accounts",
      label: "Accounts",
      icon: FiUsers,
    });
  }

  /* ────────────────────────────── */
  /* Mobile */
  /* ────────────────────────────── */

  if (isMobile) {
    return (
      <>
        {/* Bottom Nav */}
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
          <Flex justify="space-around" py={2}>
            <Sidebar.row
              icon={FiMenu}
              label="Menu"
              isCollapsed={false}
              isMobile
              onClick={onOpen}
            />
          </Flex>
        </Box>

        {/* Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody p={0}>
              <Box p={4}>
                <Heading fontSize="lg" mb={4} color="brandPrimary.500">
                  auptilyze
                </Heading>

                <VStack spacing={0} align="stretch">
                  {navItems.map((item) => {
                    const expanded = expandedItems.has(item.id);
                    return (
                      <Box key={item.id}>
                        <Sidebar.row
                          to={item.path}
                          icon={item.icon}
                          label={item.label}
                          isCollapsed={false}
                          isMobile
                          hasChildren={!!item.children}
                          isExpanded={expanded}
                          onToggle={() => toggleItem(item.id)}
                          onClick={onClose}
                        />

                        {item.children && (
                          <Collapse in={expanded}>
                            <VStack align="stretch" pl={8}>
                              {item.children.map((child) => (
                                <Sidebar.row
                                  key={child.path}
                                  to={child.path}
                                  icon={FiFileText}
                                  label={child.label}
                                  isCollapsed={false}
                                  isMobile
                                  onClick={onClose}
                                />
                              ))}
                            </VStack>
                          </Collapse>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  /* ────────────────────────────── */
  /* Desktop */
  /* ────────────────────────────── */

  return (
    <Box
      w={isCollapsed ? "sidebar.collapsed" : "sidebar.expanded"}
      bg={bgColor}
      h="100vh"
      position="sticky"
      top={0}
      borderRight="1px"
      borderColor={borderColor}
      transition="width 0.3s ease"
    >
      {/* Header */}
      <Flex align="center" h="sidebar.row" px={3} gap={2}>
        {!isCollapsed && (
          <Heading
            flex={1}
            fontSize="md"
            fontWeight="bold"
            color="brandPrimary.500"
            lineHeight="1"
          >
            auptilyze
          </Heading>
        )}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={<Icon as={isCollapsed ? FiChevronRight : FiChevronLeft} />}
          size="sm"
          variant="ghost"
          h="sidebar.row"
          minW="sidebar.row"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </Flex>

      {/* Navigation */}
      <VStack spacing={0} align="stretch">
        {navItems.map((item) => {
          const expanded = expandedItems.has(item.id);
          return (
            <Box key={item.id}>
              <SidebarRow
                to={item.path}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
                hasChildren={!!item.children}
                isExpanded={expanded}
                onToggle={() => toggleItem(item.id)}
              />

              {item.children && !isCollapsed && (
                <Collapse in={expanded}>
                  <VStack align="stretch" pl={8}>
                    {item.children.map((child) => (
                      <SidebarRow
                        key={child.path}
                        to={child.path}
                        icon={FiFileText}
                        label={child.label}
                        isCollapsed={false}
                      />
                    ))}
                  </VStack>
                </Collapse>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Sidebar;
