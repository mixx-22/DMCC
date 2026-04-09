import { Box, FormControl, FormLabel, VStack, Text } from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { useCallback, useRef, useEffect } from "react";
import apiService from "../services/api";

const SCHEDULES_ENDPOINT = "/schedules";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_SCHEDULES = [
  {
    _id: "schedule-1",
    title: "Annual Financial Audit 2024",
    auditCode: "AUD-2024-001",
    auditType: "financial",
    standard: "ISO 9001",
  },
  {
    _id: "schedule-2",
    title: "Q1 Compliance Audit",
    auditCode: "AUD-2024-002",
    auditType: "compliance",
    standard: "SOX",
  },
  {
    _id: "schedule-3",
    title: "IT Security Audit",
    auditCode: "AUD-2024-003",
    auditType: "internal",
    standard: "ISO 27001",
  },
];

const getScheduleId = (schedule) => schedule.id || schedule._id;

const PreviousAuditAsyncSelect = ({
  value = null,
  onChange,
  isInvalid,
  label = "Previous Audit",
  placeholder = "Type at least 2 characters to search audits...",
  helperText = "Select a previous audit for reference (optional)",
  currentScheduleId = null,
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
            const filtered = MOCK_SCHEDULES.filter((schedule) => {
              const scheduleId = getScheduleId(schedule);
              // Exclude current schedule
              if (currentScheduleId && scheduleId === currentScheduleId) {
                return false;
              }

              const title = (schedule.title || "").toLowerCase();
              const auditCode = (schedule.auditCode || "").toLowerCase();
              if (!inputValue.length) return true;
              return (
                title.includes(searchLower) || auditCode.includes(searchLower)
              );
            });
            resolve(
              filtered.slice(0, limit).map((schedule) => ({
                value: getScheduleId(schedule),
                label: schedule.title,
                schedule: schedule,
              })),
            );
            return;
          }

          try {
            const data = await apiService.request(SCHEDULES_ENDPOINT, {
              method: "GET",
              params: {
                ...(allowEmptySearch || inputValue.length
                  ? { keyword: inputValue }
                  : {}),
                limit,
              },
            });

            const schedules = data.data || data.schedules || [];
            // Filter out current schedule
            const filtered = schedules.filter((schedule) => {
              const scheduleId = getScheduleId(schedule);
              return !currentScheduleId || scheduleId !== currentScheduleId;
            });

            resolve(
              filtered.map((schedule) => ({
                value: getScheduleId(schedule),
                label: schedule.title,
                schedule: schedule,
              })),
            );
          } catch (error) {
            console.error("Failed to fetch schedules:", error);
            resolve([]);
          }
        }, debounceTimeout);
      });
    },
    [limit, debounceTimeout, currentScheduleId, allowEmptySearch],
  );

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      onChange({
        id: selectedOption.value,
        _id: selectedOption.value,
        title: selectedOption.schedule.title,
        auditCode: selectedOption.schedule.auditCode,
      });
    } else {
      onChange(null);
    }
  };

  const selectedValue = value
    ? {
        value: getScheduleId(value),
        label: value.title || value.auditCode,
        schedule: value,
      }
    : null;

  const formatOptionLabel = ({ schedule }) => {
    return (
      <VStack align="start" spacing={0}>
        <Text fontSize="sm" fontWeight="medium">
          {schedule.title}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {schedule.auditCode}
        </Text>
      </VStack>
    );
  };

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <Box pos="relative">
        <AsyncSelect
          value={selectedValue}
          onChange={handleChange}
          loadOptions={loadOptions}
          placeholder={placeholder}
          noOptionsMessage={({ inputValue }) =>
            !allowEmptySearch && inputValue.length < 2
              ? "Type at least 2 characters to search"
              : "No audits found"
          }
          formatOptionLabel={formatOptionLabel}
          isClearable
          cacheOptions
          defaultOptions={allowEmptySearch}
          openMenuOnFocus={allowEmptySearch}
          loadingMessage={() => "Loading audits..."}
          colorScheme="brandPrimary"
          useBasicStyles
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (provided) => ({
              ...provided,
              zIndex: 1500,
            }),
          }}
        />
      </Box>
      {helperText && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {allowEmptySearch ? "Click to view available audits" : helperText}
        </Text>
      )}
    </FormControl>
  );
};

export default PreviousAuditAsyncSelect;
