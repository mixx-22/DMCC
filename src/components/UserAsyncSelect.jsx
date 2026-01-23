import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tag,
  TagLabel,
  Link,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { FiEye, FiX } from "react-icons/fi";
import { useCallback, useRef, useEffect } from "react";
import apiService from "../services/api";
import { Link as RouterLink } from "react-router-dom";

const USERS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_USERS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

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

const getUserId = (user) => user.id || user._id || user.userId;

const UserAsyncSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Users",
  placeholder = "Type at least 2 characters to search users...",
  limit = 10,
  displayMode = "badges",
  readonly = false,
  tableProps = {},
  debounceTimeout = 300,
  ...props
}) => {
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadOptions = useCallback(
    async (inputValue) => {
      if (inputValue.length < 2) {
        return [];
      }

      return new Promise((resolve) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
          if (!USE_API) {
            const filtered = MOCK_USERS.filter((user) => {
              const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
              const email = user.email.toLowerCase();
              return (
                fullName.includes(inputValue.toLowerCase()) ||
                email.includes(inputValue.toLowerCase())
              );
            });
            resolve(
              filtered.slice(0, limit).map((user) => ({
                value: getUserId(user),
                label: `${user.firstName} ${user.lastName}`,
                user: user,
              }))
            );
            return;
          }

          try {
            const data = await apiService.request(USERS_ENDPOINT, {
              method: "GET",
              params: {
                keyword: inputValue,
                limit,
              },
            });

            const users = data.data || data.users || [];
            resolve(
              users.map((user) => ({
                value: getUserId(user),
                label: `${user.firstName} ${user.lastName}`,
                user: user,
              }))
            );
          } catch (error) {
            console.error("Failed to fetch users:", error);
            resolve([]);
          }
        }, debounceTimeout);
      });
    },
    [limit, debounceTimeout],
  );

  const handleChange = (selectedOptions) => {
    const users = (selectedOptions || []).map((option) => ({
      id: option.value,
      _id: option.value,
      firstName: option.user.firstName,
      lastName: option.user.lastName,
      email: option.user.email,
      employeeId: option.user.employeeId || "",
      profilePicture: option.user.profilePicture,
    }));
    onChange(users);
  };

  const handleRemoveUser = (userToRemove) => {
    onChange(
      value.filter((user) => getUserId(user) !== getUserId(userToRemove)),
    );
  };

  const selectedValues = value.map((user) => ({
    value: getUserId(user),
    label: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    user: user,
  }));

  const formatOptionLabel = ({ user }) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return (
      <HStack>
        <Avatar size="sm" name={fullName} src={user.profilePicture} />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {fullName}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {user.email}
          </Text>
        </VStack>
      </HStack>
    );
  };

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
                  const userId = getUserId(user);
                  const fullName = `${user.firstName || ""} ${
                    user.lastName || ""
                  }`.trim();
                  return (
                    <Tr key={getUserId(user)}>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/users/${userId}`}
                          _hover={{ textDecoration: "none" }}
                        >
                          <HStack spacing={3} _hover={{ opacity: 0.8 }}>
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
                        </Link>
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
                const userId = getUserId(user);
                const fullName = `${user.firstName || ""} ${
                  user.lastName || ""
                }`.trim();
                return (
                  <Link
                    key={userId}
                    as={RouterLink}
                    to={`/users/${userId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="brandPrimary"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
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
                  </Link>
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

  return (
    <>
      <FormControl isInvalid={isInvalid} {...props}>
        <FormLabel>{label}</FormLabel>
        <Box>
          {displayMode === "badges" && value.length > 0 && (
            <HStack spacing={2} wrap="wrap" mb={2}>
              {value.map((user) => {
                const userId = getUserId(user);
                const fullName = `${user.firstName || ""} ${
                  user.lastName || ""
                }`.trim();
                return (
                  <Link
                    key={userId}
                    as={RouterLink}
                    to={`/users/${userId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
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
                  </Link>
                );
              })}
            </HStack>
          )}
          <AsyncSelect
            isMulti
            value={selectedValues}
            onChange={handleChange}
            loadOptions={loadOptions}
            placeholder={placeholder}
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 2
                ? "Type at least 2 characters to search"
                : "No users found"
            }
            formatOptionLabel={formatOptionLabel}
            isClearable
            cacheOptions
            defaultOptions={false}
            loadingMessage={() => "Loading users..."}
            colorScheme="blue"
            useBasicStyles
          />
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
              const userId = getUserId(user);
              const fullName = `${user.firstName || ""} ${
                user.lastName || ""
              }`.trim();
              return (
                <Tr key={userId}>
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
                        aria-label="View user"
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
