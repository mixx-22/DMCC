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
import { useState, useEffect } from "react";

const getUserId = (user) => user.id || user._id || user.userId;

// Helper function to get user's full name from either format
const getUserFullName = (user) => {
  if (!user) return "";
  // Handle combined name field (API format)
  if (user.name) return user.name;
  // Handle separate firstName/lastName fields (legacy format)
  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
};

const noOptionsMessage = () => "No team leaders available";

const TeamLeadersSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Team Leaders",
  placeholder = "Select team leader(s)...",
  displayMode = "badges",
  readonly = false,
  tableProps = {},
  team = null, // Team object with leaders array
  ...props
}) => {
  const [teamLeaders, setTeamLeaders] = useState([]);

  useEffect(() => {
    if (!team) {
      setTeamLeaders([]);
      return;
    }

    // Support both leadersData (populated from context) and leaders (from API)
    const leaders = team.leadersData || team.leaders || [];

    setTeamLeaders(leaders);
  }, [team]);

  const handleChange = (selectedOptions) => {
    const users = (selectedOptions || []).map((option) => ({
      // Preserve the original user object structure
      ...option.user,
      // Ensure id and _id are set
      id: getUserId(option.user),
      _id: getUserId(option.user),
    }));
    onChange(users);
  };

  const handleRemoveUser = (userToRemove) => {
    onChange(
      value.filter((user) => getUserId(user) !== getUserId(userToRemove)),
    );
  };

  // Convert team leaders to select options
  const leaderOptions = (teamLeaders || []).map((leader) => ({
    value: getUserId(leader),
    label: getUserFullName(leader) || "Unknown",
    user: leader,
  }));

  const selectedValues = value.map((user) => ({
    value: getUserId(user),
    label: getUserFullName(user) || "Unknown",
    user: user,
  }));

  const formatOptionLabel = ({ user }) => {
    const fullName = getUserFullName(user) || "Unknown";
    return (
      <HStack>
        <Avatar size="sm" name={fullName} src={user.profilePicture} />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {fullName}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {user.email || user.employeeId || ""}
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
                  const fullName = getUserFullName(user) || "Unknown";
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
                                {user.email || user.employeeId || ""}
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
                const fullName = getUserFullName(user) || "Unknown";
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
            No leaders assigned
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
                const fullName = getUserFullName(user) || "Unknown";
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
            options={leaderOptions}
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
            Select from team&apos;s leaders
          </Text>
        )}
      </FormControl>
      {displayMode === "table" && value.length > 0 && (
        <Table variant="simple" size="sm" border="none" mt={6} {...tableProps}>
          <Tbody>
            {value.map((user) => {
              const userId = getUserId(user);
              const fullName = getUserFullName(user) || "Unknown";
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

export default TeamLeadersSelect;
