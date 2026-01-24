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

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_ROLES = [
  { _id: "1", id: "1", title: "Admin" },
  { _id: "2", id: "2", title: "Manager" },
  { _id: "3", id: "3", title: "User" },
  { _id: "4", id: "4", title: "Supervisor" },
  { _id: "5", id: "5", title: "Analyst" },
];

const getRoleId = (role) => role.id || role._id;

const RoleAsyncSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Roles",
  placeholder = "Type at least 2 characters to search roles...",
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
            const filtered = MOCK_ROLES.filter((role) =>
              role.title.toLowerCase().includes(inputValue.toLowerCase())
            );
            resolve(
              filtered.slice(0, limit).map((role) => ({
                value: getRoleId(role),
                label: role.title,
                role: role,
              }))
            );
            return;
          }

          try {
            const data = await apiService.request(ROLES_ENDPOINT, {
              method: "GET",
              params: {
                keyword: inputValue,
                limit,
              },
            });

            const roles = data.data || data.roles || [];
            resolve(
              roles.map((role) => ({
                value: getRoleId(role),
                label: role.title,
                role: role,
              }))
            );
          } catch (error) {
            console.error("Failed to fetch roles:", error);
            resolve([]);
          }
        }, debounceTimeout);
      });
    },
    [limit, debounceTimeout],
  );

  const handleChange = (selectedOptions) => {
    const roles = (selectedOptions || []).map((option) => ({
      id: option.value,
      _id: option.value,
      title: option.role.title,
    }));
    onChange(roles);
  };

  const handleRemoveRole = (roleToRemove) => {
    onChange(
      value.filter((role) => getRoleId(role) !== getRoleId(roleToRemove)),
    );
  };

  const selectedValues = value.map((role) => ({
    value: getRoleId(role),
    label: role.title || "",
    role: role,
  }));

  const formatOptionLabel = ({ role }) => {
    return (
      <HStack>
        <Avatar size="sm" name={role.title} bg="purple.500" />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {role.title}
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
                  <Th>Title</Th>
                </Tr>
              </Thead>
              <Tbody>
                {value.map((role) => {
                  const roleId = getRoleId(role);
                  return (
                    <Tr key={getRoleId(role)}>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/roles/${roleId}`}
                          _hover={{ textDecoration: "none" }}
                        >
                          <HStack spacing={3} _hover={{ opacity: 0.8 }}>
                            <Avatar
                              size="sm"
                              name={role.title}
                              bg="purple.500"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {role.title}
                              </Text>
                            </VStack>
                          </HStack>
                        </Link>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <HStack spacing={2} wrap="wrap">
              {value.map((role) => {
                const roleId = getRoleId(role);
                return (
                  <Link
                    key={roleId}
                    as={RouterLink}
                    to={`/roles/${roleId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="purple"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                    >
                      <Avatar
                        size="xs"
                        name={role.title}
                        ml={-1}
                        mr={2}
                        bg="purple.500"
                      />
                      <TagLabel>{role.title}</TagLabel>
                    </Tag>
                  </Link>
                );
              })}
            </HStack>
          )
        ) : (
          <Text color="gray.500" fontSize="sm">
            No roles assigned
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
              {value.map((role) => {
                const roleId = getRoleId(role);
                return (
                  <Link
                    key={roleId}
                    as={RouterLink}
                    to={`/roles/${roleId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="purple"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                    >
                      <Avatar
                        size="xs"
                        name={role.title}
                        ml={-1}
                        mr={2}
                        bg="purple.500"
                      />
                      <TagLabel>{role.title}</TagLabel>
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
                : "No roles found"
            }
            formatOptionLabel={formatOptionLabel}
            isClearable
            cacheOptions
            defaultOptions={false}
            loadingMessage={() => "Loading roles..."}
            colorScheme="purple"
            useBasicStyles
          />
        </Box>
        {!readonly && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            Type at least 2 characters to search for roles
          </Text>
        )}
      </FormControl>
      {displayMode === "table" && value.length > 0 && (
        <Table variant="simple" size="sm" border="none" mt={6} {...tableProps}>
          <Tbody>
            {value.map((role) => {
              const roleId = getRoleId(role);
              return (
                <Tr key={roleId}>
                  <Td border="none">
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={role.title}
                        bg="purple.500"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {role.title}
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
                        aria-label="View role"
                        as={RouterLink}
                        to={`/roles/${roleId}`}
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="error"
                        icon={<FiX />}
                        aria-label="Remove role"
                        onClick={() => handleRemoveRole(role)}
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

export default RoleAsyncSelect;
