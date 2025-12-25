import {
  Box,
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
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiBell, FiLogOut } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../context/Layout";

const Header = () => {
  const { getExpiringCertifications, currentUser, logout } = useApp();
  const { headerRef } = useLayout();
  const navigate = useNavigate();
  const expiringCerts = getExpiringCertifications();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Flex
      bg={bgColor}
      borderBottom="1px"
      border="none"
      position="sticky"
      top={0}
      zIndex="sticky"
      h="sidebar.row"
      justify="center"
      px={4}
    >
      <Flex
        w="full"
        px="page.padding"
        maxW="page.maxContent"
        justify="space-between"
        align="center"
      >
        <Box ref={headerRef}></Box>
        <Spacer />
        <Flex align="center" gap={0}>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiBell />}
              variant="ghost"
              position="relative"
              isRound
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
            <MenuList>
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
                      onClick={() => navigate(`/certifications/${cert.id}`)}
                    >
                      {cert.name} - Expires:{" "}
                      {new Date(cert.expirationDate).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </>
              )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              icon={
                <Avatar
                  src={currentUser?.profilePicture}
                  name={currentUser?.name || "User"}
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
                    name={currentUser?.name || "User"}
                    size="sm"
                  />
                  <VStack spacing={0} align="start">
                    <Text fontSize="sm" fontWeight="semibold">
                      {currentUser?.name || "User"}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {currentUser?.userType || ""}
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
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
