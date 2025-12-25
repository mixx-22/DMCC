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
  useToast,
  Card,
  CardBody,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useUser } from "../context/useUser";

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name || username}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid username or password",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Card w="100%" maxW="400px" boxShadow="lg">
        <CardBody p={8}>
          <VStack spacing={6}>
            <VStack spacing={2}>
              <Heading color="brandPrimary.600">Auptilyze</Heading>
              <Text color="gray.600" fontSize="sm">
                With Certainty.
              </Text>
            </VStack>

            <Box w="100%">
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <FiUser />
                      </InputLeftElement>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        pl={10}
                        id="username"
                        name="username"
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

                  <Button
                    type="submit"
                    colorScheme="brandPrimary"
                    w="full"
                    size="lg"
                    isLoading={isLoading}
                    leftIcon={<FiLock />}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
