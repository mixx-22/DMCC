import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { FiCalendar } from "react-icons/fi";
import { useCallback } from "react";
import apiService from "../services/api";

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock audit schedules for development
const MOCK_AUDIT_SCHEDULES = [
  {
    _id: "audit-1",
    id: "audit-1",
    title: "Q1 2024 Internal Audit",
    metadata: {
      code: "AUD-2024-001",
      type: "internal",
      standard: "ISO 9001",
      status: 1,
    },
    status: 1,
  },
  {
    _id: "audit-2",
    id: "audit-2",
    title: "Q4 2023 Compliance Audit",
    metadata: {
      code: "AUD-2023-004",
      type: "compliance",
      standard: "SOX",
      status: 1,
    },
    status: 1,
  },
  {
    _id: "audit-3",
    id: "audit-3",
    title: "External Audit 2024",
    metadata: {
      code: "AUD-2024-002",
      type: "external",
      standard: "ISO 27001",
      status: 0,
    },
    status: 0,
  },
];

const getAuditId = (audit) => audit.id || audit._id;

const AuditScheduleAsyncSelect = ({
  value = null,
  onChange,
  isInvalid,
  label = "Previous Audit",
  placeholder = "Type at least 2 characters to search audits...",
  limit = 10,
  ...props
}) => {
  const loadOptions = useCallback(
    async (inputValue) => {
      if (inputValue.length < 2) {
        return [];
      }

      if (!USE_API) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const filtered = MOCK_AUDIT_SCHEDULES.filter((audit) => {
              const title = audit.title.toLowerCase();
              const code = audit.metadata?.code?.toLowerCase() || "";
              return (
                title.includes(inputValue.toLowerCase()) ||
                code.includes(inputValue.toLowerCase())
              );
            });
            resolve(
              filtered.slice(0, limit).map((audit) => ({
                value: getAuditId(audit),
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
            limit,
          },
        });

        const audits = data.data?.documents || data.documents || [];
        return audits.map((audit) => ({
          value: getAuditId(audit),
          label: audit.title,
          audit: audit,
        }));
      } catch (error) {
        console.error("Failed to fetch audit schedules:", error);
        return [];
      }
    },
    [limit]
  );

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      const audit = {
        id: selectedOption.value,
        _id: selectedOption.value,
        title: selectedOption.audit.title,
        code: selectedOption.audit.metadata?.code || "",
        status: selectedOption.audit.status,
      };
      onChange(audit);
    } else {
      onChange(null);
    }
  };

  const selectedValue = value
    ? {
        value: getAuditId(value),
        label: value.title,
        audit: value,
      }
    : null;

  const getStatusLabel = (status) => {
    const statusMap = {
      0: "Scheduled",
      1: "In Progress",
      2: "Completed",
    };
    return statusMap[status] || "Unknown";
  };

  const formatOptionLabel = ({ audit }) => {
    return (
      <HStack>
        <Icon as={FiCalendar} color="purple.500" />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {audit.title}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {audit.metadata?.code || "No code"} • {getStatusLabel(audit.status)}
          </Text>
        </VStack>
      </HStack>
    );
  };

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <Box>
        {value && (
          <HStack spacing={2} wrap="wrap" mb={2}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme="purple"
            >
              <Icon as={FiCalendar} mr={2} />
              <TagLabel>
                {value.title} {value.code ? `(${value.code})` : ""}
              </TagLabel>
              <TagCloseButton onClick={() => onChange(null)} />
            </Tag>
          </HStack>
        )}
        <AsyncSelect
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
        Type at least 2 characters to search for previous audits
      </Text>
    </FormControl>
  );
};

export default AuditScheduleAsyncSelect;
