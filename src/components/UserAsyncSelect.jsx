import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  Text,
  Spinner,
  useOutsideClick,
  Avatar,
} from "@chakra-ui/react";
import { useState, useRef, useCallback } from "react";
import apiService from "../services/api";

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock users for development
const MOCK_USERS = [
  {
    _id: "user-1",
    id: "user-1",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
  },
  {
    _id: "user-2",
    id: "user-2",
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
  },
  {
    _id: "user-3",
    id: "user-3",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
  },
  {
    _id: "user-4",
    id: "user-4",
    firstName: "Bob",
    lastName: "Williams",
    email: "bob@example.com",
  },
];

const UserAsyncSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Users",
  placeholder = "Type at least 2 characters to search users...",
  limit = 10,
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();
  const debounceTimer = useRef(null);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  const fetchUsers = useCallback(
    async (keyword) => {
      if (keyword.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);

      if (!USE_API) {
        // Mock API call with delay
        setTimeout(() => {
          const filtered = MOCK_USERS.filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            return (
              fullName.includes(keyword.toLowerCase()) ||
              email.includes(keyword.toLowerCase())
            );
          });
          setOptions(filtered.slice(0, limit));
          setLoading(false);
        }, 300);
        return;
      }

      try {
        const data = await apiService.request(USERS_ENDPOINT, {
          method: "GET",
          params: {
            keyword,
            limit,
          },
        });

        const users = data.data || data.users || [];
        setOptions(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    // Clear existing timeout
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the API call
    debounceTimer.current = setTimeout(() => {
      fetchUsers(newValue);
    }, 500);
  };

  const handleSelectUser = (user) => {
    // Store full user object with necessary properties
    // Prevent duplicate selection by checking if id already exists
    const userId = user.id || user._id;
    const isDuplicate = value.some(
      (u) => u.id === userId || u.id === user._id || u._id === userId
    );
    if (!isDuplicate) {
      onChange([
        ...value,
        {
          id: userId,
          _id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      ]);
    }
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleRemoveUser = (userToRemove) => {
    onChange(
      value.filter(
        (user) =>
          user.id !== userToRemove.id && user._id !== userToRemove._id
      )
    );
  };

  // Filter out already selected users by checking IDs
  const filteredOptions = options.filter(
    (option) =>
      !value.some(
        (u) =>
          u.id === option.id ||
          u.id === option._id ||
          u._id === option.id ||
          u._id === option._id
      )
  );

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <Box ref={containerRef} position="relative">
        <VStack align="stretch" spacing={2}>
          {value.length > 0 && (
            <HStack spacing={2} wrap="wrap">
              {value.map((user) => {
                const fullName = `${user.firstName || ""} ${
                  user.lastName || ""
                }`.trim();
                return (
                  <Tag
                    key={user.id || user._id}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                  >
                    <Avatar
                      size="xs"
                      name={fullName}
                      ml={-1}
                      mr={2}
                      src={user.profilePicture}
                    />
                    <TagLabel>{fullName}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveUser(user)} />
                  </Tag>
                );
              })}
            </HStack>
          )}
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputValue.length >= 2) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
          />
        </VStack>

        {isOpen && inputValue.length >= 2 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={1}
            bg="white"
            boxShadow="lg"
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
            maxH="200px"
            overflowY="auto"
            zIndex={10}
          >
            {loading ? (
              <Box p={4} textAlign="center">
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Loading users...
                </Text>
              </Box>
            ) : filteredOptions.length > 0 ? (
              <VStack align="stretch" spacing={0}>
                {filteredOptions.map((option) => {
                  const fullName = `${option.firstName || ""} ${
                    option.lastName || ""
                  }`.trim();
                  return (
                    <Box
                      key={option._id || option.id}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleSelectUser(option)}
                    >
                      <HStack>
                        <Avatar
                          size="sm"
                          name={fullName}
                          src={option.profilePicture}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {fullName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {option.email}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No users found
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
      <Text fontSize="xs" color="gray.500" mt={1}>
        Type at least 2 characters to search for users
      </Text>
    </FormControl>
  );
};

export default UserAsyncSelect;
