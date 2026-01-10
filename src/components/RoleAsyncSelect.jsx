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
import { useState, useRef, useCallback, useEffect } from "react";
import apiService from "../services/api";

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock roles for development
const MOCK_ROLES = [
  { _id: "1", id: "1", title: "Admin" },
  { _id: "2", id: "2", title: "Manager" },
  { _id: "3", id: "3", title: "User" },
  { _id: "4", id: "4", title: "Supervisor" },
  { _id: "5", id: "5", title: "Analyst" },
];

const RoleAsyncSelect = ({ value = [], onChange, isInvalid, ...props }) => {
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

  const fetchRoles = useCallback(async (keyword) => {
    if (keyword.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);

    if (!USE_API) {
      // Mock API call with delay
      setTimeout(() => {
        const filtered = MOCK_ROLES.filter((role) =>
          role.title.toLowerCase().includes(keyword.toLowerCase())
        );
        setOptions(filtered);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const data = await apiService.request(ROLES_ENDPOINT, {
        method: "GET",
        params: {
          keyword,
          limit: 20,
        },
      });

      const roles = data.data || data.roles || [];
      setOptions(roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
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
      fetchRoles(newValue);
    }, 500);
  };

  const handleSelectRole = (role) => {
    const { id, title } = role;
    if (!value.includes(title)) {
      onChange([...value, { id, title }]);
    }
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleRemoveRole = (roleToRemove) => {
    onChange(value.filter((role) => role !== roleToRemove));
  };

  const filteredOptions = options.filter(
    (option) => !value.includes(option.title)
  );

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>Roles</FormLabel>
      <Box ref={containerRef} position="relative">
        <VStack align="stretch" spacing={2}>
          {value.length > 0 && (
            <HStack spacing={2} wrap="wrap">
              {value.map((role) => (
                <Tag
                  key={role}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="purple"
                >
                  <TagLabel>{role.title}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveRole(role)} />
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
            placeholder="Type at least 2 characters to search roles..."
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
                  Loading roles...
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
                    onClick={() => handleSelectRole(option)}
                  >
                    <Text fontSize="sm">{option.title}</Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box p={4} textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No roles found
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
      <Text fontSize="xs" color="gray.500" mt={1}>
        Type at least 2 characters to search for roles
      </Text>
    </FormControl>
  );
};

export default RoleAsyncSelect;
