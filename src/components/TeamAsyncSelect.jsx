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
} from "@chakra-ui/react";
import { useState, useRef, useCallback } from "react";
import apiService from "../services/api";

const TEAMS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_TEAMS;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock teams for development
const MOCK_TEAMS = [
  { _id: "1", id: "1", name: "Engineering" },
  { _id: "2", id: "2", name: "Marketing" },
  { _id: "3", id: "3", name: "Sales" },
  { _id: "4", id: "4", name: "HR" },
  { _id: "5", id: "5", name: "Finance" },
];

const TeamAsyncSelect = ({ value = [], onChange, isInvalid, ...props }) => {
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

  const fetchTeams = useCallback(async (keyword) => {
    if (keyword.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);

    if (!USE_API) {
      // Mock API call with delay
      setTimeout(() => {
        const filtered = MOCK_TEAMS.filter((team) =>
          team.name.toLowerCase().includes(keyword.toLowerCase())
        );
        setOptions(filtered);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const data = await apiService.request(TEAMS_ENDPOINT, {
        method: "GET",
        params: {
          keyword,
          limit: 20,
        },
      });

      const teams = data.data || data.teams || [];
      setOptions(teams);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      fetchTeams(newValue);
    }, 500);
  };

  const handleSelectTeam = (team) => {
    // Store full team object with id and name
    // Prevent duplicate selection by checking if id already exists
    const isDuplicate = value.some((t) => t.id === team.id || t.id === team._id);
    if (!isDuplicate) {
      onChange([...value, { id: team.id || team._id, name: team.name }]);
    }
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleRemoveTeam = (teamToRemove) => {
    onChange(value.filter((team) => team.id !== teamToRemove.id));
  };

  // Filter out already selected teams by checking IDs
  const filteredOptions = options.filter(
    (option) => !value.some((t) => t.id === option.id || t.id === option._id)
  );

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>Teams</FormLabel>
      <Box ref={containerRef} position="relative">
        <VStack align="stretch" spacing={2}>
          {value.length > 0 && (
            <HStack spacing={2} wrap="wrap">
              {value.map((team) => (
                <Tag
                  key={team.id}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="green"
                >
                  <TagLabel>{team.name}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveTeam(team)} />
                </Tag>
              ))}
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
            placeholder="Type at least 2 characters to search teams..."
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
                  Loading teams...
                </Text>
              </Box>
            ) : filteredOptions.length > 0 ? (
              <VStack align="stretch" spacing={0}>
                {filteredOptions.map((option) => (
                  <Box
                    key={option._id || option.id}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => handleSelectTeam(option)}
                  >
                    <Text fontSize="sm">{option.name}</Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No teams found
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
      <Text fontSize="xs" color="gray.500" mt={1}>
        Type at least 2 characters to search for teams
      </Text>
    </FormControl>
  );
};

export default TeamAsyncSelect;
