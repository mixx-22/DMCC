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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  MenuGroup,
  Badge,
  Avatar,
  HStack,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  FiBell,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import logoDefault from "../images/auptilyze.png";
import logoWhite from "../images/auptilyze-white.png";
import logoIconDefault from "../images/auptilyze-icon.svg";
import logoIconWhite from "../images/auptilyze-icon-white.svg";
import { useUser } from "../context/useUser";
import { useApp } from "../context/AppContext";
import Swal from "sweetalert2";

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
      bg={isActive ? activeBg : "transparent"}
      color={isActive ? activeColor : isChild ? childTextColor : textColor}
      fontWeight={isActive ? "semibold" : "normal"}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      title={isCollapsed && !isMobile ? label : ""}
      w="full"
      position="relative"
      onClick={onClick}
      cursor="pointer !important"
    >
      {isActive && !isMobile && !isChild && (
        <Box
          position="absolute"
          left={0}
          w="3px"
          h="full"
          bg={activeColor}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        />
      )}

      {icon !== null && (
        <Icon 
          as={icon} 
          boxSize={isChild ? 4 : 5} 
          minW={isChild ? 4 : 5}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        />
      )}
      {(!isCollapsed || isMobile) && (
        <>
          <Text 
            flex={1} 
            noOfLines={1} 
            fontSize={isChild ? "xs" : "sm"}
            transition="opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
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
              transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              transform={isExpanded ? "rotate(180deg)" : "rotate(0deg)"}
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
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user: currentUser, logout } = useUser();
  const { getExpiringCertifications } = useApp();
  const { colorMode, toggleColorMode } = useColorMode();
  const expiringCerts = getExpiringCertifications();

  const logoSrc = useColorModeValue(logoDefault, logoWhite);
  const logoIconSrc = useColorModeValue(logoIconDefault, logoIconWhite);
  const textColor = useColorModeValue("gray.700", "gray.300");
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.100", "gray.800");
  const brandColor = useColorModeValue("brandPrimary.500", "brandPrimary.200");
  const subMenuBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const activeBg = useColorModeValue("brandPrimary.50", "whiteAlpha.200");
  const activeColor = useColorModeValue("brandPrimary.600", "brandPrimary.200");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const menuHeaderColor = useColorModeValue("gray.500", "gray.400");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isAdmin = true;

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Leaving so soon?",
      text: "Upon proceeding, you will be logged out of your session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  const handleNotificationClick = (certId) => {
    navigate(`/certifications/${certId}`);
    onClose();
  };

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

      // Show popup menu for items with children when collapsed
      if (hasChildren && isCollapsed && !mobileMode) {
        return (
          <Menu
            key={item.id}
            placement="right-start"
            offset={[8, 0]}
            strategy="fixed"
            gutter={8}
          >
            <MenuButton 
              as={Box} 
              w="full" 
              cursor="pointer"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{ transform: "translateX(2px)" }}
            >
              <SidebarRow
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
                isMobile={mobileMode}
                hasChildren={hasChildren}
                isExpanded={false}
                isActive={isActiveParent}
              />
            </MenuButton>
            <Portal>
              <MenuList 
                minW="200px"
                motionProps={{
                  initial: { opacity: 0, x: -10 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -10 },
                  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                }}
              >
                <MenuGroup
                  color={menuHeaderColor}
                  title={item.label}
                  fontFamily={"heading"}
                  textTransform="lowercase"
                >
                  {item.children.map((child) => (
                    <MenuItem
                      key={child.path}
                      as={NavLink}
                      to={child.path}
                      px={4}
                      py={2}
                      fontSize="sm"
                      fontWeight={
                        isRouteMatch(location, child.path)
                          ? "semibold"
                          : "normal"
                      }
                      color={
                        isRouteMatch(location, child.path)
                          ? activeColor
                          : textColor
                      }
                      bg={
                        isRouteMatch(location, child.path)
                          ? activeBg
                          : "transparent"
                      }
                      _hover={{ 
                        bg: hoverBg,
                        transform: "translateX(4px)"
                      }}
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      {child.label}
                    </MenuItem>
                  ))}
                </MenuGroup>
              </MenuList>
            </Portal>
          </Menu>
        );
      }

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
              <VStack 
                align="stretch" 
                spacing={0} 
                bg={subMenuBg}
                transition="background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
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
          h="60px"
          boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
        >
          <Flex justify="space-around" align="center" h="full" px={2}>
            {/* Menu Button */}
            <IconButton
              aria-label="Menu"
              icon={<FiMenu size={24} />}
              variant="ghost"
              onClick={() => navigate("/menu")}
              display="flex"
              flexDirection="column"
              h="auto"
              py={2}
              color={location.pathname === "/menu" ? activeColor : textColor}
              _hover={{ bg: hoverBg }}
              borderRadius="md"
            />

            {/* Notifications Button */}
            <Box position="relative">
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiBell size={24} />}
                  variant="ghost"
                  position="relative"
                  aria-label="Notifications"
                  h="auto"
                  py={2}
                  color={textColor}
                  _hover={{ bg: hoverBg }}
                  borderRadius="md"
                >
                  {expiringCerts.length > 0 && (
                    <Badge
                      position="absolute"
                      top={0}
                      right={0}
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {expiringCerts.length}
                    </Badge>
                  )}
                </MenuButton>
                <Portal>
                  <MenuList maxH="300px" overflowY="auto">
                    {expiringCerts.length === 0 ? (
                      <MenuItem>No notifications</MenuItem>
                    ) : (
                      <>
                        <MenuItem fontWeight="bold" isDisabled>
                          Expiring Certifications ({expiringCerts.length})
                        </MenuItem>
                        {expiringCerts.map((cert) => (
                          <MenuItem
                            key={`expiring-cert-${cert.id}`}
                            onClick={() => handleNotificationClick(cert.id)}
                            fontSize="sm"
                          >
                            {cert.name} - Expires:{" "}
                            {new Date(cert.expirationDate).toLocaleDateString()}
                          </MenuItem>
                        ))}
                      </>
                    )}
                  </MenuList>
                </Portal>
              </Menu>
            </Box>

            {/* User Menu Button */}
            <Menu>
              <MenuButton
                as={IconButton}
                variant="ghost"
                icon={
                  <Avatar
                    src={currentUser?.profilePicture}
                    name={
                      currentUser
                        ? [
                            currentUser.firstName,
                            currentUser.middleName,
                            currentUser.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                          currentUser.name ||
                          "User"
                        : "User"
                    }
                    size="sm"
                  />
                }
                aria-label="User menu"
                h="auto"
                py={2}
                _hover={{ bg: hoverBg }}
                borderRadius="md"
              />
              <Portal>
                <MenuList>
                  <MenuItem>
                    <HStack spacing={3}>
                      <Avatar
                        src={currentUser?.profilePicture}
                        name={currentUser?.name || "User"}
                        size="sm"
                      />
                      <VStack spacing={0} align="start">
                        <Text fontSize="sm" fontWeight="semibold">
                          {currentUser
                            ? [
                                currentUser.firstName,
                                currentUser.middleName,
                                currentUser.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ") ||
                              currentUser.name ||
                              "User"
                            : "User"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {currentUser?.position || ""}
                        </Text>
                      </VStack>
                    </HStack>
                  </MenuItem>
                  <MenuItem>Settings</MenuItem>
                  <Divider />
                  <MenuItem onClick={toggleColorMode}>
                    Appearance: {colorMode === "dark" ? "Dark" : "Light"}
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    icon={<FiLogOut />}
                    onClick={handleLogout}
                    color="error.500"
                  >
                    Log Out
                  </MenuItem>
                  <Divider />
                </MenuList>
              </Portal>
            </Menu>
          </Flex>
        </Box>

        {/* Old drawer removed - menu now opens as a page */}
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
      {isCollapsed && (
        <Flex
          align="center"
          h="sidebar.row"
          justify={isCollapsed ? "center" : "flex-start"}
          pl={isCollapsed ? 0 : 4}
          pr={isCollapsed ? 0 : 2}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          cursor="pointer"
        >
          <Image
            boxSize={5}
            src={logoIconSrc}
            alt={import.meta.env.VITE_PROJECT_NAME}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          />
        </Flex>
      )}
      <Flex
        align="center"
        h="sidebar.row"
        justify={isCollapsed ? "center" : "flex-start"}
        pl={isCollapsed ? 0 : 4}
        pr={isCollapsed ? 0 : 2}
        mb={"sidebar.row"}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        cursor="pointer"
      >
        {!isCollapsed && (
          <>
            <Image
              w={24}
              src={logoSrc}
              alt={import.meta.env.VITE_PROJECT_NAME}
              transition="opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            />
            <Spacer />
          </>
        )}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={
            <Icon 
              as={isCollapsed ? FiChevronRight : FiChevronLeft}
              transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            />
          }
          size="sm"
          variant="ghost"
          color={textColor}
          onClick={() => setIsCollapsed(!isCollapsed)}
          isRound
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{ 
            transform: "scale(1.1)",
            bg: hoverBg
          }}
        />
      </Flex>

      <VStack spacing={0} align="stretch">
        {renderNavList(navItems)}
      </VStack>
    </Box>
  );
};

export default Sidebar;
