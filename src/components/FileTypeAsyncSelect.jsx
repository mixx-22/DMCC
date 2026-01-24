import { FormControl, FormLabel, Text } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback } from "react";
import apiService from "../services/api";

const FILE_TYPES_ENDPOINT = "/file-types";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_FILE_TYPES = [
  { _id: "1", id: "1", name: "Quality Manual" },
  { _id: "2", id: "2", name: "Work Instruction" },
  { _id: "3", id: "3", name: "Form" },
  { _id: "4", id: "4", name: "Policy" },
  { _id: "5", id: "5", name: "Procedure" },
];

const FileTypeAsyncSelect = ({ value, onChange, isInvalid, label = "File Type", helperText, ...props }) => {
  const loadOptions = useCallback(async (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }

    if (!USE_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = MOCK_FILE_TYPES.filter((fileType) =>
            fileType.name.toLowerCase().includes(inputValue.toLowerCase())
          );
          resolve(
            filtered.map((fileType) => ({
              value: fileType.id || fileType._id,
              label: fileType.name,
            }))
          );
        }, 300);
      });
    }

    try {
      const data = await apiService.request(FILE_TYPES_ENDPOINT, {
        method: "GET",
        params: {
          keyword: inputValue,
          limit: 20,
        },
      });

      const fileTypes = data.data || data.fileTypes || [];
      return fileTypes.map((fileType) => ({
        value: fileType.id || fileType._id,
        label: fileType.name,
      }));
    } catch (error) {
      console.error("Failed to fetch file types:", error);
      return [];
    }
  }, []);

  const handleChange = (selectedOption) => {
    // When loading: value is {id, name}
    // When saving: we pass just the id
    const fileType = selectedOption
      ? {
          id: selectedOption.value,
          name: selectedOption.label,
        }
      : null;
    onChange(fileType);
  };

  // Convert the value from {id, name} to the format expected by AsyncSelect
  const selectedValue = value
    ? {
        value: value.id,
        label: value.name,
      }
    : null;

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <AsyncSelect
        value={selectedValue}
        onChange={handleChange}
        loadOptions={loadOptions}
        placeholder="Type at least 2 characters to search file types..."
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2
            ? "Type at least 2 characters to search"
            : "No file types found"
        }
        isClearable
        cacheOptions
        defaultOptions={false}
        debounceTimeout={500}
        loadingMessage={() => "Loading file types..."}
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

export default FileTypeAsyncSelect;
