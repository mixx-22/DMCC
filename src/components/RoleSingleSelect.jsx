import { FormControl, FormLabel, Text, useColorModeValue } from "@chakra-ui/react";
import AsyncSelect from "react-select/async";
import { useCallback } from "react";
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

const RoleSingleSelect = ({
  value,
  onChange,
  isInvalid,
  label = "Role",
  helperText,
  ...props
}) => {
  // Chakra UI color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const errorBorderColor = useColorModeValue("red.500", "red.300");
  const focusBorderColor = useColorModeValue("purple.500", "purple.300");
  const textColor = useColorModeValue("gray.900", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const menuBg = useColorModeValue("white", "gray.800");
  const optionBg = useColorModeValue("gray.50", "gray.700");
  const optionSelectedBg = useColorModeValue("purple.500", "purple.300");

  const loadOptions = useCallback(async (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }

    if (!USE_API) {
      // Mock API call with delay
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

  // Custom styles to match Chakra UI theme
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: bgColor,
      borderColor: isInvalid 
        ? errorBorderColor 
        : state.isFocused 
        ? focusBorderColor 
        : borderColor,
      borderWidth: isInvalid ? "2px" : "1px",
      borderRadius: "0.375rem",
      minHeight: "40px",
      boxShadow: state.isFocused 
        ? `0 0 0 1px ${isInvalid ? errorBorderColor : focusBorderColor}` 
        : "none",
      "&:hover": {
        borderColor: isInvalid 
          ? errorBorderColor 
          : state.isFocused 
          ? focusBorderColor 
          : borderColor,
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 0.75rem",
    }),
    input: (provided) => ({
      ...provided,
      color: textColor,
      margin: 0,
      padding: 0,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: placeholderColor,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: textColor,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: menuBg,
      borderRadius: "0.375rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: 10,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "0.25rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? optionSelectedBg
        : state.isFocused
        ? optionBg
        : "transparent",
      color: state.isSelected ? "white" : textColor,
      cursor: "pointer",
      borderRadius: "0.25rem",
      padding: "0.5rem 0.75rem",
      "&:active": {
        backgroundColor: optionSelectedBg,
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: placeholderColor,
      "&:hover": {
        color: textColor,
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: placeholderColor,
      "&:hover": {
        color: textColor,
      },
    }),
    loadingIndicator: (provided) => ({
      ...provided,
      color: focusBorderColor,
    }),
  };

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
        styles={customStyles}
        loadingMessage={() => "Loading roles..."}
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
