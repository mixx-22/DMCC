import { FormControl, FormLabel, Text } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback, useRef, useEffect } from "react";
import apiService from "../services/api";

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_ROLES = [
  { _id: "1", id: "1", title: "Admin" },
  { _id: "2", id: "2", title: "Manager" },
  { _id: "3", id: "3", title: "User" },
  { _id: "4", id: "4", title: "Supervisor" },
  { _id: "5", id: "5", title: "Analyst" },
];

const RoleSingleSelect = ({
  value,
  onChange,
  isInvalid,
  label = "Role",
  helperText,
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

  const loadOptions = useCallback(async (inputValue) => {
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
            filtered.map((role) => ({
              value: role.id || role._id,
              label: role.title,
            }))
          );
          return;
        }

        try {
          const data = await apiService.request(ROLES_ENDPOINT, {
            method: "GET",
            params: {
              keyword: inputValue,
              limit: 20,
            },
          });

          const roles = data.data || data.roles || [];
          resolve(
            roles.map((role) => ({
              value: role.id || role._id,
              label: role.title,
            }))
          );
        } catch (error) {
          console.error("Failed to fetch roles:", error);
          resolve([]);
        }
      }, debounceTimeout);
    });
  }, [debounceTimeout]);

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      onChange({
        id: selectedOption.value,
        title: selectedOption.label,
      });
    } else {
      onChange(null);
    }
  };

  const selectedValue = value
    ? { value: value.id, label: value.title }
    : null;

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      <AsyncSelect
        value={selectedValue}
        onChange={handleChange}
        loadOptions={loadOptions}
        placeholder="Type at least 2 characters to search roles..."
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2
            ? "Type at least 2 characters to search"
            : "No roles found"
        }
        isClearable
        cacheOptions
        defaultOptions={false}
        loadingMessage={() => "Loading roles..."}
        colorScheme="purple"
        useBasicStyles
      />
      {helperText && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {helperText}
        </Text>
      )}
    </FormControl>
  );
};

export default RoleSingleSelect;
