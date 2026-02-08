import { Box, FormControl, FormLabel, VStack, Text } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback, useRef, useEffect } from "react";
import apiService from "../services/api";

const STANDARDS_ENDPOINT =
  import.meta.env.VITE_API_PACKAGE_STANDARDS || "/standards";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_STANDARDS = [
  {
    id: "std-1",
    standard: "ISO 9001:2015",
    description: "Quality management systems requirements.",
  },
  {
    id: "std-2",
    standard: "ISO 27001:2022",
    description: "Information security management systems requirements.",
  },
  {
    id: "std-3",
    standard: "SOX",
    description: "Sarbanes-Oxley Act compliance requirements.",
  },
  {
    id: "std-4",
    standard: "ISO 45001:2018",
    description: "Occupational health and safety management systems.",
  },
];

const StandardsAsyncSelect = ({
  value = null,
  onChange,
  isInvalid,
  label = "Standard",
  placeholder = "Type at least 2 characters to search standards...",
  helperText = "The audit standard or framework being followed (optional)",
  limit = 10,
  allowEmptySearch = false,
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
      if (!allowEmptySearch && inputValue.length < 2) {
        return [];
      }

      return new Promise((resolve) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
          if (!USE_API) {
            const searchLower = inputValue.toLowerCase();
            const filtered = MOCK_STANDARDS.filter((standard) => {
              const standardName = (standard.standard || "").toLowerCase();
              const description = (standard.description || "").toLowerCase();
              if (!inputValue.length) return true;
              return (
                standardName.includes(searchLower) ||
                description.includes(searchLower)
              );
            });

            const options = filtered.slice(0, limit).map((standard) => ({
              value: standard.id,
              label: standard.standard,
              standard: standard,
            }));

            resolve(options);
            return;
          }

          try {
            const response = await apiService.request(STANDARDS_ENDPOINT, {
              method: "GET",
              params: {
                ...(allowEmptySearch || inputValue.length
                  ? { keyword: inputValue }
                  : {}),
                limit,
              },
            });

            const standards = Array.isArray(response)
              ? response
              : response?.data || [];

            const options = standards.map((standard) => ({
              value: standard.id || standard._id,
              label: standard.standard,
              standard: standard,
            }));

            resolve(options);
          } catch (error) {
            console.error("Error loading standards:", error);
            resolve([]);
          }
        }, debounceTimeout);
      });
    },
    [limit, debounceTimeout, allowEmptySearch],
  );

  // Convert value to option format for display
  const selectedOption = value
    ? {
        value: value.id || value._id,
        label: value.standard,
        standard: value,
      }
    : null;

  const handleChange = (option) => {
    onChange(option?.standard || null);
  };

  return (
    <FormControl isInvalid={isInvalid}>
      {label && <FormLabel>{label}</FormLabel>}
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable
        noOptionsMessage={({ inputValue }) => {
          if (!allowEmptySearch && (!inputValue || inputValue.length < 2)) {
            return "Type at least 2 characters to search";
          }
          return "No standards found";
        }}
        defaultOptions={allowEmptySearch}
        openMenuOnFocus={allowEmptySearch}
        chakraStyles={{
          container: (provided) => ({
            ...provided,
            width: "100%",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            backgroundColor: "transparent",
            border: 0,
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            display: "none",
          }),
        }}
        {...props}
      />
      {helperText && (
        <Text fontSize="sm" color="gray.500" mt={1}>
          {allowEmptySearch ? "Click to view available standards" : helperText}
        </Text>
      )}
    </FormControl>
  );
};

export default StandardsAsyncSelect;
