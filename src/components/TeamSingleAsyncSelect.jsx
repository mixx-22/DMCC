import {
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  Avatar,
  FormHelperText,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback } from "react";
import apiService from "../services/api";

const TEAMS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_TEAMS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_TEAMS = [
  { _id: "team-1", id: "team-1", name: "Engineering Team", description: "Core engineering team" },
  { _id: "team-2", id: "team-2", name: "Marketing Team", description: "Marketing and PR" },
  { _id: "team-3", id: "team-3", name: "Sales Team", description: "Sales department" },
  { _id: "team-4", id: "team-4", name: "HR Team", description: "Human Resources" },
  { _id: "team-5", id: "team-5", name: "Finance Team", description: "Finance and accounting" },
];

const getTeamId = (team) => team.id || team._id;

const TeamSingleAsyncSelect = ({
  value = null,
  onChange,
  isInvalid,
  isDisabled = false,
  label = "Team",
  placeholder = "Type at least 2 characters to search teams...",
  helperText = "Type at least 2 characters to search for teams",
  limit = 10,
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
    [limit]
  );

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      const team = {
        id: selectedOption.value,
        _id: selectedOption.value,
        name: selectedOption.team.name,
        description: selectedOption.team.description,
      };
      onChange(team);
    } else {
      onChange(null);
    }
  };

  const selectedValue = value
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
          {team.description && (
            <Text fontSize="xs" color="gray.500">
              {team.description}
            </Text>
          )}
        </VStack>
      </HStack>
    );
  };

  return (
    <FormControl isInvalid={isInvalid} isDisabled={isDisabled} {...props}>
      <FormLabel>{label}</FormLabel>
      <AsyncSelect
        value={selectedValue}
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
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default TeamSingleAsyncSelect;
