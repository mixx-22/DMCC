import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Spinner,
  useOutsideClick,
  useColorModeValue,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { useState, useRef, useCallback } from "react";
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

const RoleSingleSelect = ({ value, onChange, isInvalid, label = "Role", helperText, ...props }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef();
  const debounceTimer = useRef(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");

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
    // Store full role object with id and title
    onChange({ id: role.id || role._id, title: role.title });
    setInputValue("");
    setOptions([]);
    setIsOpen(false);
  };

  const handleRemoveRole = () => {
    onChange(null);
  };

  // Filter out the selected role from options
  const filteredOptions = options.filter(
    (option) => !value || (value.id !== option.id && value.id !== option._id)
  );

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      <Box ref={containerRef} position="relative">
        <VStack align="stretch" spacing={2}>
          {value && (
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme="purple"
              w="fit-content"
            >
              <TagLabel>{value.title}</TagLabel>
              <TagCloseButton onClick={handleRemoveRole} />
            </Tag>
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
            bg={bgColor}
            boxShadow="lg"
            borderRadius="md"
            border="1px"
            borderColor={borderColor}
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
                    color={textColor}
                    _hover={{ bg: hoverBg }}
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
      {helperText && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {helperText}
        </Text>
      )}
    </FormControl>
  );
};

export default RoleSingleSelect;
