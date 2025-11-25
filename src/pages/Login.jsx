import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@chakra-ui/react'
import { FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi'
import { useApp } from '../context/AppContext'

const Login = () => {
  const { accounts, login, addAccount } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both username and password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    // Find account with matching username
    let account = accounts.find(
      acc => acc.username?.toLowerCase() === username.toLowerCase()
    )

    if (!account && accounts.length === 0) {
      // Seed a first account so users can sign in on fresh installs
      account = addAccount({
        name: username,
        username,
        password,
        userType: 'Admin',
        jobTitle: 'System Administrator',
        department: 'Administration',
      })
    }

    if (!account) {
      setIsLoading(false)
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Check password (in a real app, this would be hashed)
    if (account.password !== password) {
      setIsLoading(false)
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Login successful
    login(account)
    toast({
      title: 'Login Successful',
      description: `Welcome back, ${account.name}!`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setIsLoading(false)
    navigate('/dashboard')
  }

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
              <Heading size="lg" color="blue.600">
                DMCC
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Document Management & Certification Monitoring
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
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        pl={10}
                        pr={10}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                    colorScheme="blue"
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
  )
}

export default Login

