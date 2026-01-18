import { FormControl, FormLabel, Text } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback } from "react";
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

const RoleAsyncSelect = ({ value = [], onChange, isInvalid, ...props }) => {
  const loadOptions = useCallback(async (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }

    if (!USE_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = MOCK_ROLES.filter((role) =>
            role.title.toLowerCase().includes(inputValue.toLowerCase())
          );
          resolve(
            filtered.map((role) => ({
              value: role.id || role._id,
              label: role.title,
            }))
          );
        }, 300);
      });
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
      return roles.map((role) => ({
        value: role.id || role._id,
        label: role.title,
      }));
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      return [];
    }
  }, []);

  const handleChange = (selectedOptions) => {
    const roles = (selectedOptions || []).map((option) => ({
      id: option.value,
      title: option.label,
    }));
    onChange(roles);
  };

  const selectedValues = value.map((role) => ({
    value: role.id,
    label: role.title,
  }));

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>Roles</FormLabel>
      <AsyncSelect
        isMulti
        value={selectedValues}
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
      <Text fontSize="xs" color="gray.500" mt={1}>
        Type at least 2 characters to search for roles
      </Text>
    </FormControl>
  );
};

export default RoleAsyncSelect;
