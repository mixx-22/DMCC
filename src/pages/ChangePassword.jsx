import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Text,
  IconButton,
  Container,
  useColorModeValue,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import apiService from "../services/api";
import { useUser } from "../context/_useContext";

const ChangePassword = () => {
  const { user: currentUser } = useUser();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const containerBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Validation Error", {
        description: "Please fill in all fields",
        duration: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Validation Error", {
        description: "New password and confirm password do not match",
        duration: 3000,
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Validation Error", {
        description: "New password must be at least 8 characters long",
        duration: 3000,
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Validation Error", {
        description: "New password must be different from current password",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiService.request(
        `${import.meta.env.VITE_API_PACKAGE_CHANGE_PASSWORD}/${currentUser.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      toast.success("Password Changed", {
        description: "Your password has been successfully updated",
        duration: 3000,
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Change Password Failed", {
        description: error.message || "Failed to change password",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.sm">
        <VStack spacing={6} align="stretch">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" color={headingColor}>
              Change Password
            </Heading>
            <Text color={textColor} fontSize="md">
              Update your password to keep your account secure
            </Text>
          </VStack>

          <Box bg={containerBg} p={8} borderRadius="lg" shadow="md">
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Current Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <FiLock />
                    </InputLeftElement>
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      pl={10}
                      pr={10}
                      autoComplete="current-password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <FiLock />
                    </InputLeftElement>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      pl={10}
                      pr={10}
                      autoComplete="new-password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showNewPassword ? "Hide password" : "Show password"
                        }
                        icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="xs" color={textColor} mt={1}>
                    Password must be at least 8 characters long
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <FiLock />
                    </InputLeftElement>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      pl={10}
                      pr={10}
                      autoComplete="new-password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  w="full"
                  size="lg"
                  isLoading={isLoading}
                  colorScheme="brandPrimary"
                  mt={4}
                >
                  Change Password
                </Button>

                <Button
                  variant="ghost"
                  w="full"
                  onClick={() => navigate(-1)}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChangePassword;
