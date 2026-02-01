import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Avatar,
  Button,
  Divider,
  useColorMode,
  useBreakpointValue,
  Spacer,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiMoon, FiSun, FiSettings, FiKey } from "react-icons/fi";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useUser } from "../context/_useContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();

  // Redirect to dashboard on desktop - Profile page is mobile-only
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (isMobile === false) {
      navigate("/dashboard");
    }
  }, [isMobile, navigate]);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const containerBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Leaving so soon?",
      text: "Upon proceeding, you will be logged out of your session.",
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, Log Out",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "warning inverted",
      },
    });
    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  const displayName = currentUser
    ? [currentUser.firstName, currentUser.middleName, currentUser.lastName]
        .filter(Boolean)
        .join(" ") ||
      currentUser.name ||
      "User"
    : "User";

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Flex align="center" gap={3}>
            <Heading size="lg" color={headingColor}>
              hey, {currentUser?.firstName || "User"}!
            </Heading>
          </Flex>

          <Divider />

          {/* Profile Info Section */}
          <Box bg={containerBg} p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={6} align="stretch">
              <Flex direction="column" align="center" gap={4}>
                <Avatar
                  src={currentUser?.profilePicture}
                  name={displayName}
                  size="2xl"
                />
                <VStack spacing={1} justify="center">
                  <Text
                    fontSize="2xl"
                    fontWeight="semibold"
                    color={textColor}
                    textAlign="center"
                  >
                    {displayName}
                  </Text>
                  {currentUser?.position && (
                    <Text fontSize="md" color={subTextColor}>
                      {currentUser.position}
                    </Text>
                  )}
                  {currentUser?.email && (
                    <Text fontSize="sm" color={subTextColor}>
                      {currentUser.email}
                    </Text>
                  )}
                </VStack>
              </Flex>

              <Divider />

              {/* Settings Section */}
              <VStack spacing={3} align="stretch">
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<FiSettings />}
                  w="full"
                  color={textColor}
                  _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                >
                  Account Settings
                </Button>

                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<FiKey />}
                  onClick={() => navigate("/change-password")}
                  w="full"
                  color={textColor}
                  _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                >
                  Change Password
                </Button>

                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                  onClick={toggleColorMode}
                  w="full"
                  color={textColor}
                  _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                >
                  <Text>Appearance</Text>
                  <Spacer />
                  <Text fontSize="sm" color={subTextColor}>
                    {colorMode === "dark" ? "Dark" : "Light"}
                  </Text>
                </Button>
              </VStack>

              <Divider />

              {/* Logout Button */}
              <Button
                leftIcon={<FiLogOut />}
                colorScheme="red"
                variant="ghost"
                onClick={handleLogout}
                w="full"
                justifyContent="flex-start"
              >
                Log Out
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile;
