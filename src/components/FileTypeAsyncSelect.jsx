import { FormControl, FormLabel, Text } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback, useRef } from "react";
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

const FileTypeAsyncSelect = ({
  value,
  onChange,
  isInvalid,
  label = "File Type",
  helperText,
  isMulti = false,
  ...props
}) => {
  const debounceTimer = useRef(null);

  const loadOptions = useCallback((inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }

    // Clear existing timeout
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the API call
    debounceTimer.current = setTimeout(async () => {
      if (!USE_API) {
        const filtered = MOCK_FILE_TYPES.filter((fileType) =>
          fileType.name.toLowerCase().includes(inputValue.toLowerCase()),
        );
        callback(
          filtered.map((fileType) => ({
            value: fileType.id || fileType._id,
            label: fileType.name,
            isQualityDocument: fileType.isQualityDocument,
          })),
        );
        return;
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
        callback(
          fileTypes.map((fileType) => ({
            value: fileType.id || fileType._id,
            label: fileType.name,
            isQualityDocument: fileType.isQualityDocument,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch file types:", error);
        callback([]);
      }
    }, 500);
  }, []);

  const handleChange = (selectedOption) => {
    if (isMulti) {
      // Handle multi-select: selectedOption is an array
      const fileTypes = selectedOption
        ? selectedOption.map((opt) => ({
            id: opt.value,
            name: opt.label,
            isQualityDocument: opt.isQualityDocument,
          }))
        : [];
      onChange(fileTypes);
    } else {
      // Handle single select: selectedOption is an object or null
      const fileType = selectedOption
        ? {
            id: selectedOption.value,
            name: selectedOption.label,
            isQualityDocument: selectedOption.isQualityDocument,
          }
        : null;
      onChange(fileType);
    }
  };

  const selectedValue = isMulti
    ? Array.isArray(value)
      ? value.map((ft) => ({
          value: ft.id,
          label: ft.name,
          isQualityDocument: ft.isQualityDocument,
        }))
      : []
    : value?.id
      ? {
          value: value.id,
          label: value.name,
          isQualityDocument: value.isQualityDocument,
        }
      : null;

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <AsyncSelect
        isMulti={isMulti}
        value={selectedValue}
        onChange={handleChange}
        loadOptions={loadOptions}
        placeholder="Start searching file types..."
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2
            ? "Type at least 2 characters to search"
            : "No file types found"
        }
        isClearable
        cacheOptions
        defaultOptions={false}
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
