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
import { useCallback } from "react";
import apiService from "../services/api";
import { Link as RouterLink } from "react-router-dom";

const TEAMS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_TEAMS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_TEAMS = [
  { _id: "1", id: "1", name: "Engineering" },
  { _id: "2", id: "2", name: "Marketing" },
  { _id: "3", id: "3", name: "Sales" },
  { _id: "4", id: "4", name: "HR" },
  { _id: "5", id: "5", name: "Finance" },
];

const getTeamId = (team) => team.id || team._id;

const TeamAsyncSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Teams",
  placeholder = "Type at least 2 characters to search teams...",
  limit = 10,
  allowEmptySearch = false,
  displayMode = "badges",
  readonly = false,
  tableProps = {},
  isMulti = true,
  max,
  ...props
}) => {
  const loadOptions = useCallback(
    async (inputValue) => {
      if (!allowEmptySearch && inputValue.length < 2) {
        return [];
      }

      if (!USE_API) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const filtered = MOCK_TEAMS.filter((team) =>
              inputValue.length
                ? team.name.toLowerCase().includes(inputValue.toLowerCase())
                : true,
            );
            resolve(
              filtered.slice(0, limit).map((team) => ({
                value: getTeamId(team),
                label: team.name,
                team: team,
              })),
            );
          }, 300);
        });
      }

      try {
        const data = await apiService.request(TEAMS_ENDPOINT, {
          method: "GET",
          params: {
            ...(allowEmptySearch || inputValue.length
              ? { keyword: inputValue }
              : {}),
            limit,
          },
        });

        const teams = data.data || data.teams || [];
        return teams.map((team) => ({
          value: getTeamId(team),
          label: team.name,
          team: team,
        }));
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        return [];
      }
    },
    [limit, allowEmptySearch],
  );

  const handleChange = (selectedOptions) => {
    if (isMulti) {
      const teams = (selectedOptions || []).map((option) => ({
        ...option.team, // Preserve all team data from API
        id: option.value,
        _id: option.value,
      }));

      // Check max limit if specified
      if (max && teams.length > max) {
        return; // Don't allow selection beyond max
      }

      onChange(teams);
    } else {
      // Single select mode
      if (selectedOptions) {
        const team = {
          ...selectedOptions.team, // Preserve all team data from API
          id: selectedOptions.value,
          _id: selectedOptions.value,
        };
        onChange(team);
      } else {
        onChange(null);
      }
    }
  };

  const handleRemoveTeam = (teamToRemove) => {
    onChange(
      value.filter((team) => getTeamId(team) !== getTeamId(teamToRemove)),
    );
  };

  const selectedValues = isMulti
    ? value.map((team) => ({
        value: getTeamId(team),
        label: team.name || "",
        team: team,
      }))
    : value
      ? {
          value: getTeamId(value),
          label: value.name || "",
          team: value,
        }
      : null;

  const formatOptionLabel = ({ team }) => {
    return (
      <HStack>
        <Avatar size="sm" name={team.name} bg="brandPrimary.500" />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {team.name}
          </Text>
        </VStack>
      </HStack>
    );
  };

  if (readonly) {
    const teams = isMulti ? value : value ? [value] : [];
    return (
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        {teams.length > 0 ? (
          displayMode === "table" ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                </Tr>
              </Thead>
              <Tbody>
                {teams.map((team) => {
                  const teamId = getTeamId(team);
                  return (
                    <Tr key={getTeamId(team)}>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/teams/${teamId}`}
                          _hover={{ textDecoration: "none" }}
                        >
                          <HStack spacing={3} _hover={{ opacity: 0.8 }}>
                            <Avatar
                              size="sm"
                              name={team.name}
                              bg="brandPrimary.500"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {team.name}
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
              {teams.map((team) => {
                const teamId = getTeamId(team);
                return (
                  <Link
                    key={teamId}
                    as={RouterLink}
                    to={`/teams/${teamId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="green"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                    >
                      <Avatar
                        size="xs"
                        name={team.name}
                        ml={-1}
                        mr={2}
                        bg="brandPrimary.500"
                      />
                      <TagLabel>{team.name}</TagLabel>
                    </Tag>
                  </Link>
                );
              })}
            </HStack>
          )
        ) : (
          <Text color="gray.500" fontSize="sm">
            No teams assigned
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
          {displayMode === "badges" && isMulti && value.length > 0 && (
            <HStack spacing={2} wrap="wrap" mb={2}>
              {value.map((team) => {
                const teamId = getTeamId(team);
                return (
                  <Link
                    key={teamId}
                    as={RouterLink}
                    to={`/teams/${teamId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="green"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                    >
                      <Avatar
                        size="xs"
                        name={team.name}
                        ml={-1}
                        mr={2}
                        bg="brandPrimary.500"
                      />
                      <TagLabel>{team.name}</TagLabel>
                    </Tag>
                  </Link>
                );
              })}
            </HStack>
          )}
          <AsyncSelect
            isMulti={isMulti}
            value={selectedValues}
            onChange={handleChange}
            loadOptions={loadOptions}
            placeholder={placeholder}
            noOptionsMessage={({ inputValue }) =>
              !allowEmptySearch && inputValue.length < 2
                ? "Type at least 2 characters to search"
                : "No teams found"
            }
            formatOptionLabel={formatOptionLabel}
            isClearable
            cacheOptions
            defaultOptions={allowEmptySearch}
            openMenuOnFocus={allowEmptySearch}
            loadingMessage={() => "Loading teams..."}
            colorScheme="green"
            useBasicStyles
            isOptionDisabled={() => isMulti && max && value.length >= max}
          />
        </Box>
        {!readonly && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            {allowEmptySearch
              ? "Click to view available teams"
              : "Type at least 2 characters to search for teams"}
            {max && ` (max ${max} team${max > 1 ? "s" : ""})`}
          </Text>
        )}
      </FormControl>
      {displayMode === "table" && isMulti && value.length > 0 && (
        <Table variant="simple" size="sm" border="none" mt={6} {...tableProps}>
          <Tbody>
            {value.map((team) => {
              const teamId = getTeamId(team);
              return (
                <Tr key={teamId}>
                  <Td border="none">
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={team.name}
                        bg="brandPrimary.500"
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {team.name}
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
                        aria-label="View team"
                        as={RouterLink}
                        to={`/teams/${teamId}`}
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="error"
                        icon={<FiX />}
                        aria-label="Remove team"
                        onClick={() => handleRemoveTeam(team)}
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

export default TeamAsyncSelect;
