import PropTypes from "prop-types";
import { Box, Portal } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  Flex,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  VStack,
  HStack,
  Divider,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiBell,
  FiLogOut,
  FiKey,
  FiMoon,
  FiSun,
  FiSettings,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useApp, useLayout, useUser } from "../context/_useContext";
const PageHeader = ({ children }) => {
  const { getExpiringCertifications } = useApp();
  const { user: currentUser, logout } = useUser();
  const { headerRef } = useLayout();
  const navigate = useNavigate();
  const expiringCerts = getExpiringCertifications();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  const hasContent = useMemo(
    () => ![null, undefined, ""].includes(children),
    [children],
  );

  // Hide notifications and user menu on mobile (they're in bottom nav now)
  const showDesktopMenu = useBreakpointValue({ base: false, md: true });

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

  if (!hasContent) return null;
  return (
    <Portal containerRef={headerRef}>
      <Flex
        bg={bgColor}
        borderBottom="1px"
        border="none"
        position="sticky"
        top={0}
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
          <Box w="full">{children}</Box>
          {showDesktopMenu && (
            <Flex align="center" gap={0}>
              <IconButton
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                position="relative"
                isRound
                onClick={() => navigate("/notifications")}
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
              </IconButton>
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
                  isRound
                />
                <MenuList>
                  <MenuItem>
                    <HStack spacing={3}>
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
                  <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                  <MenuItem
                    icon={<FiKey />}
                    onClick={() => navigate("/change-password")}
                  >
                    Change Password
                  </MenuItem>
                  <MenuItem
                    icon={colorMode === "dark" ? <FiMoon /> : <FiSun />}
                    onClick={toggleColorMode}
                  >
                    Appearance: {colorMode === "dark" ? "Dark" : "Light"} Mode
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
              </Menu>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Portal>
  );
};

PageHeader.propTypes = {
  children: PropTypes.node,
};

export default PageHeader;
