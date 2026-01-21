import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { FiX, FiCalendar } from "react-icons/fi";
import { useCallback } from "react";
import apiService from "../services/api";

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock audit schedules for development
const MOCK_AUDIT_SCHEDULES = [
  {
    id: "audit-1",
    title: "Q1 2024 Internal Audit",
    code: "AUD-2024-001",
    status: 1,
    metadata: {
      code: "AUD-2024-001",
      type: "internal",
      standard: "ISO 9001",
    },
  },
  {
    id: "audit-2",
    title: "Q4 2023 External Audit",
    code: "AUD-2023-004",
    status: 1,
    metadata: {
      code: "AUD-2023-004",
      type: "external",
      standard: "SOX",
    },
  },
];

const AuditScheduleAsyncSelect = ({
  value = null,
  onChange,
  isInvalid,
  label = "Previous Audit",
  placeholder = "Type to search for audit schedules...",
  isMulti = false,
  readonly = false,
  ...props
}) => {
  const loadOptions = useCallback(async (inputValue) => {
    if (inputValue.length < 2) {
      return [];
    }

    if (!USE_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = MOCK_AUDIT_SCHEDULES.filter((audit) => {
            const searchText =
              `${audit.title} ${audit.code}`.toLowerCase();
            return searchText.includes(inputValue.toLowerCase());
          });
          resolve(
            filtered.map((audit) => ({
              value: audit.id,
              label: audit.title,
              audit: audit,
            }))
          );
        }, 300);
      });
    }

    try {
      const data = await apiService.request(DOCUMENTS_ENDPOINT, {
        method: "GET",
        params: {
          type: "auditSchedule",
          keyword: inputValue,
        },
      });

      const audits = data.data?.documents || data.documents || [];
      return audits.map((audit) => ({
        value: audit.id,
        label: audit.title,
        audit: audit,
      }));
    } catch (error) {
      console.error("Failed to fetch audit schedules:", error);
      return [];
    }
  }, []);

  const handleChange = (selectedOption) => {
    if (isMulti) {
      const audits = (selectedOption || []).map((option) => ({
        id: option.value,
        title: option.audit.title,
        code: option.audit.metadata?.code || option.audit.code || "",
        status: option.audit.status,
      }));
      onChange(audits);
    } else {
      if (selectedOption) {
        onChange({
          id: selectedOption.value,
          title: selectedOption.audit.title,
          code: selectedOption.audit.metadata?.code || selectedOption.audit.code || "",
          status: selectedOption.audit.status,
        });
      } else {
        onChange(null);
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const formatOptionLabel = ({ audit }) => {
    return (
      <HStack>
        <FiCalendar />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {audit.title}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {audit.metadata?.code || audit.code || "No code"}
          </Text>
        </VStack>
      </HStack>
    );
  };

  if (readonly) {
    return (
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        {value ? (
          <HStack spacing={2} p={3} bg="gray.50" borderRadius="md">
            <FiCalendar />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="medium">
                {value.title}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {value.code || "No code"}
              </Text>
            </VStack>
          </HStack>
        ) : (
          <Text color="gray.500" fontSize="sm">
            No previous audit selected
          </Text>
        )}
      </FormControl>
    );
  }

  const selectedValue = value
    ? {
        value: value.id,
        label: value.title,
        audit: value,
      }
    : null;

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <Box>
        {!isMulti && value && (
          <HStack spacing={2} mb={2} p={3} bg="gray.50" borderRadius="md">
            <FiCalendar />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontSize="sm" fontWeight="medium">
                {value.title}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {value.code || "No code"}
              </Text>
            </VStack>
            <IconButton
              size="sm"
              variant="ghost"
              colorScheme="red"
              icon={<FiX />}
              aria-label="Remove audit"
              onClick={handleRemove}
            />
          </HStack>
        )}
        <AsyncSelect
          isMulti={isMulti}
          value={selectedValue}
          onChange={handleChange}
          loadOptions={loadOptions}
          placeholder={placeholder}
          noOptionsMessage={({ inputValue }) =>
            inputValue.length < 2
              ? "Type at least 2 characters to search"
              : "No audit schedules found"
          }
          formatOptionLabel={formatOptionLabel}
          isClearable
          cacheOptions
          defaultOptions={false}
          loadingMessage={() => "Loading audit schedules..."}
          colorScheme="purple"
          useBasicStyles
        />
      </Box>
      <Text fontSize="xs" color="gray.500" mt={1}>
        Type at least 2 characters to search for audit schedules
      </Text>
    </FormControl>
  );
};

export default AuditScheduleAsyncSelect;
