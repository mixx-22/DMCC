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
import { Select } from "chakra-react-select";
import { FiEye, FiX } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useCallback } from "react";

const getUserId = (user) => user.id || user._id || user.userId;

const noOptionsMessage = () => "No auditors available for this organization";

/**
 * Component to select auditors from organization's auditor list
 * Similar to UserAsyncSelect but limited to pre-defined organization auditors
 */
const OrganizationAuditorsSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Auditors",
  placeholder = "Select auditor(s)...",
  displayMode = "badges",
  readonly = false,
  tableProps = {},
  organizationAuditors = [], // List of auditors from organization
  ...props
}) => {
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

  // Convert organization auditors to select options
  const auditorOptions = organizationAuditors.map((auditor) => ({
    value: getUserId(auditor),
    label: `${auditor.firstName || ""} ${auditor.lastName || ""}`.trim(),
    user: auditor,
  }));

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
            No auditors assigned
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
          )}
          <Select
            isMulti
            value={selectedValues}
            onChange={handleChange}
            options={auditorOptions}
            placeholder={placeholder}
            noOptionsMessage={noOptionsMessage}
            formatOptionLabel={formatOptionLabel}
            isClearable
            colorScheme="brandPrimary"
            useBasicStyles
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 1500,
              }),
            }}
          />
        </Box>
        {!readonly && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            Select from organization&apos;s auditors
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

export default OrganizationAuditorsSelect;
