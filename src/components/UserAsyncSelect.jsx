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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { FiEye, FiX } from "react-icons/fi";
import { useState, useRef, useCallback } from "react";
import apiService from "../services/api";
import { Link as RouterLink } from "react-router-dom";

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
    employeeId: "EMP001",
  },
  {
    _id: "user-2",
    id: "user-2",
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    employeeId: "EMP002",
  },
  {
    _id: "user-3",
    id: "user-3",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    employeeId: "EMP003",
  },
  {
    _id: "user-4",
    id: "user-4",
    firstName: "Bob",
    lastName: "Williams",
    email: "bob@example.com",
    employeeId: "EMP004",
  },
];

// Helper function to get consistent user ID
const getUserId = (user) => user.id || user._id || user.userId;

const UserAsyncSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Users",
  placeholder = "Type at least 2 characters to search users...",
  limit = 10,
  displayMode = "badges", // "badges" or "table"
  readonly = false, // if true, only shows the list without input
  tableProps = {},
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
    [limit],
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
    const userId = getUserId(user);
    const isDuplicate = value.some((u) => getUserId(u) === userId);
    if (!isDuplicate) {
      onChange([
        ...value,
        {
          id: userId,
          _id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          employeeId: user.employeeId || "",
        },
      ]);
    }
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleRemoveUser = (userToRemove) => {
    onChange(
      value.filter((user) => getUserId(user) !== getUserId(userToRemove)),
    );
  };

  // Filter out already selected users by checking IDs
  const filteredOptions = options.filter(
    (option) => !value.some((u) => getUserId(u) === getUserId(option)),
  );

  // Readonly mode - only display the list, no input
  if (readonly) {
    return (
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        {value.length > 0 ? (
          displayMode === "table" ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Employee ID</Th>
                </Tr>
              </Thead>
              <Tbody>
                {value.map((user) => {
                  const fullName = `${user.firstName || ""} ${
                    user.lastName || ""
                  }`.trim();
                  return (
                    <Tr key={getUserId(user)}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={fullName}
                            src={user.profilePicture}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {fullName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {user.email}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {user.employeeId || "-"}
                        </Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <HStack spacing={2} wrap="wrap">
              {value.map((user) => {
                const fullName = `${user.firstName || ""} ${
                  user.lastName || ""
                }`.trim();
                return (
                  <Tag
                    key={getUserId(user)}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="brandPrimary"
                  >
                    <Avatar
                      size="xs"
                      name={fullName}
                      ml={-1}
                      mr={2}
                      src={user.profilePicture}
                    />
                    <TagLabel>{fullName}</TagLabel>
                  </Tag>
                );
              })}
            </HStack>
          )
        ) : (
          <Text color="gray.500" fontSize="sm">
            No users assigned
          </Text>
        )}
      </FormControl>
    );
  }

  // Editable mode with either badges or table display
  return (
    <>
      <FormControl isInvalid={isInvalid} {...props}>
        <FormLabel>{label}</FormLabel>
        <Box ref={containerRef} position="relative">
          <VStack
            align="stretch"
            spacing={2}
            order={displayMode === "table" ? "revert" : "initial"}
          >
            {displayMode === "badges" && value.length > 0 && (
              <HStack spacing={2} wrap="wrap">
                {value.map((user) => {
                  const fullName = `${user.firstName || ""} ${
                    user.lastName || ""
                  }`.trim();
                  return (
                    <Tag
                      key={getUserId(user)}
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="brandPrimary"
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
                        key={getUserId(option)}
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
        {!readonly && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            Type at least 2 characters to search for users
          </Text>
        )}
      </FormControl>
      {displayMode === "table" && value.length > 0 && (
        <Table variant="simple" size="sm" border="none" mt={6} {...tableProps}>
          <Tbody>
            {value.map((user) => {
              const userId = user.id || user._id || user.userId;
              const fullName = `${user.firstName || ""} ${
                user.lastName || ""
              }`.trim();
              return (
                <Tr key={getUserId(user)}>
                  <Td border="none">
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={fullName}
                        src={user.profilePicture}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {fullName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {user.employeeId || "-"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td border="none" textAlign="right">
                    <HStack spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="brandPrimary"
                        icon={<FiEye />}
                        aria-label="Remove user"
                        as={RouterLink}
                        to={`/users/${userId}`}
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="error"
                        icon={<FiX />}
                        aria-label="Remove user"
                        onClick={() => handleRemoveUser(user)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </>
  );
};

export default UserAsyncSelect;
