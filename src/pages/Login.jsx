import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
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
  HStack,
  Checkbox,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { validateLoginInput } from "../helpers/validation";
import logoWhite from "../images/auptilyze-white.png";
import { useUser } from "../context/_useContext";

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Validation Error", {
        description: "Please enter both email/username and password",
        duration: 3000,
      });
      return;
    }

    // Validate the login input format (email or username)
    const validationResult = validateLoginInput(username);

    if (!validationResult.isValid) {
      toast.error("Invalid Input", {
        description: validationResult.error,
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        toast.success("Login Successful", {
          description: `Welcome back, ${result.user.firstName || username}!`,
          duration: 3000,
        });

        navigate("/dashboard");
      } else {
        toast.error("Login Failed", {
          description: result.error || "Invalid email/username or password",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error("Login Error", {
        description: error.message || "An unexpected error occurred",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Desktop: split layout */}
      <Flex
        flex={1}
        direction={{ base: "column", md: "row" }}
        w="100%"
        align="center"
        justify="center"
      >
        {/* Left: Login Form */}
        <Box
          w={{ base: "100%", md: "50%" }}
          maxW={{ base: "100%", md: "480px" }}
          mx={{ base: 2, md: 0 }}
          py={{ base: 8, md: 16 }}
          px={{ base: 4, md: 12 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={1} mb={2}>
              <Heading
                fontWeight="extrabold"
                fontSize={{ base: "2xl", md: "3xl" }}
                lineHeight={1.1}
                color={useColorModeValue("gray.800", "white")}
              >
                Sign in
              </Heading>
              <Text
                color={useColorModeValue("gray.500", "gray.300")}
                fontSize="md"
              >
                Enter your email or username and password to continue
              </Text>
            </VStack>
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Email or Username</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <FiUser />
                    </InputLeftElement>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your email or username"
                      pl={10}
                      id="email"
                      name="email"
                      autoComplete="username"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <FiLock />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      pl={10}
                      pr={10}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <HStack justify="space-between" align="center">
                  <Checkbox colorScheme="brandPrimary">Remember me</Checkbox>
                  <Button
                    variant="link"
                    colorScheme="brandPrimary"
                    fontSize="sm"
                    fontWeight="medium"
                    px={0}
                  >
                    Forgot Password
                  </Button>
                </HStack>
                <Button
                  type="submit"
                  w="full"
                  size="lg"
                  isLoading={isLoading}
                  fontWeight="bold"
                  fontSize="md"
                  borderRadius="lg"
                  mt={2}
                  colorScheme="brandPrimary"
                >
                  Sign In
                </Button>
                <Text
                  textAlign="center"
                  color={useColorModeValue("gray.500", "gray.300")}
                  fontSize="sm"
                >
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="link"
                    colorScheme="brandPrimary"
                    fontWeight="medium"
                    fontSize="sm"
                    px={0}
                  >
                    Get an invite.
                  </Button>
                </Text>
              </VStack>
            </form>
          </VStack>
        </Box>
        {/* Right: Info Panel (desktop only) */}
        <Box
          display={{ base: "none", md: "flex" }}
          flex={1}
          alignItems="center"
          justifyContent="center"
          bg={useColorModeValue("brandPrimary.900", "brandPrimary-dark.400")}
          color="white"
          borderRadius={{ md: "2xl" }}
          m={6}
          p={10}
          flexDirection="column"
          minH="80vh"
          boxShadow="2xl"
          position="relative"
        >
          <Image
            src="https://images.unsplash.com/photo-1535350356005-fd52b3b524fb?auto=format&fit=crop&w=800&q=80"
            alt="Decorative overlay"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.18}
            zIndex={0}
            pointerEvents="none"
            style={{ mixBlendMode: "lighten" }}
          />
          <VStack spacing={4} align="flex-start" w="100%" zIndex={1}>
            <Box>
              <Image
                w={"xs"}
                h="auto"
                src={logoWhite}
                alt={import.meta.env.VITE_PROJECT_NAME}
              />
            </Box>
            <Text fontSize="lg" maxW="md" color="gray.200">
              <Text as="span" fontFamily="heading" textTransform="lowercase">
                {import.meta.env.VITE_PROJECT_NAME}
              </Text>{" "}
              helps you securely manage documents and certifications. Join us
              and start building your workflow today.
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
