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
  displayMode = "badges",
  readonly = false,
  tableProps = {},
  ...props
}) => {
  const loadOptions = useCallback(
    async (inputValue) => {
      if (inputValue.length < 2) {
        return [];
      }

      if (!USE_API) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const filtered = MOCK_TEAMS.filter((team) =>
              team.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            resolve(
              filtered.slice(0, limit).map((team) => ({
                value: getTeamId(team),
                label: team.name,
                team: team,
              }))
            );
          }, 300);
        });
      }

      try {
        const data = await apiService.request(TEAMS_ENDPOINT, {
          method: "GET",
          params: {
            keyword: inputValue,
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
    [limit],
  );

  const handleChange = (selectedOptions) => {
    const teams = (selectedOptions || []).map((option) => ({
      id: option.value,
      _id: option.value,
      name: option.team.name,
    }));
    onChange(teams);
  };

  const handleRemoveTeam = (teamToRemove) => {
    onChange(
      value.filter((team) => getTeamId(team) !== getTeamId(teamToRemove)),
    );
  };

  const selectedValues = value.map((team) => ({
    value: getTeamId(team),
    label: team.name || "",
    team: team,
  }));

  const formatOptionLabel = ({ team }) => {
    return (
      <HStack>
        <Avatar size="sm" name={team.name} bg="blue.500" />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {team.name}
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
                </Tr>
              </Thead>
              <Tbody>
                {value.map((team) => {
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
                              bg="blue.500"
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
                        bg="blue.500"
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
          {displayMode === "badges" && value.length > 0 && (
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
                        bg="blue.500"
                      />
                      <TagLabel>{team.name}</TagLabel>
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
                : "No teams found"
            }
            formatOptionLabel={formatOptionLabel}
            isClearable
            cacheOptions
            defaultOptions={false}
            loadingMessage={() => "Loading teams..."}
            colorScheme="green"
            useBasicStyles
          />
        </Box>
        {!readonly && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            Type at least 2 characters to search for teams
          </Text>
        )}
      </FormControl>
      {displayMode === "table" && value.length > 0 && (
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
                        bg="blue.500"
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
