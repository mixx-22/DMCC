import {
  VStack,
  HStack,
  Box,
  Text,
  FormLabel,
  IconButton,
  Badge,
  FormControl,
  FormHelperText,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiPlus, FiX, FiCalendar } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

const VisitManager = ({ visits = [], onChange }) => {
  const [visitDates, setVisitDates] = useState({
    start: new Date(),
    end: new Date(),
  });

  const handleAddVisit = () => {
    const newVisit = {
      date: {
        start: visitDates.start.toISOString().split("T")[0],
        end: visitDates.end.toISOString().split("T")[0],
      },
    };

    onChange([...visits, newVisit]);

    // Reset dates
    setVisitDates({ start: new Date(), end: new Date() });
  };

  const handleRemoveVisit = (index) => {
    onChange(visits.filter((_, i) => i !== index));
  };

  return (
    <FormControl>
      <FormLabel>Visits</FormLabel>
      <VStack align="stretch" spacing={3}>
        {/* Add Visit Form */}
        <Box p={3} borderWidth={1} borderRadius="md">
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Box flex={1}>
                <FormLabel fontSize="sm">Start Date</FormLabel>
                <SingleDatepicker
                  date={visitDates.start}
                  onDateChange={(date) =>
                    setVisitDates((prev) => ({ ...prev, start: date }))
                  }
                  propsConfigs={{
                    inputProps: {
                      size: "sm",
                    },
                  }}
                />
              </Box>
              <Box flex={1}>
                <FormLabel fontSize="sm">End Date</FormLabel>
                <SingleDatepicker
                  date={visitDates.end}
                  onDateChange={(date) =>
                    setVisitDates((prev) => ({ ...prev, end: date }))
                  }
                  propsConfigs={{
                    inputProps: {
                      size: "sm",
                    },
                  }}
                />
              </Box>
              <IconButton
                icon={<FiPlus />}
                onClick={handleAddVisit}
                colorScheme="blue"
                size="sm"
                mt={6}
                aria-label="Add visit"
              />
            </HStack>
          </VStack>
        </Box>

        {/* List of Added Visits */}
        {visits.length > 0 && (
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="medium">
              Added Visits:
            </Text>
            {visits.map((visit, index) => (
              <HStack
                key={index}
                p={2}
                borderWidth={1}
                borderRadius="md"
                justify="space-between"
              >
                <HStack spacing={2}>
                  <FiCalendar />
                  <Badge colorScheme="green">{visit.date.start}</Badge>
                  <Text fontSize="sm">to</Text>
                  <Badge colorScheme="green">{visit.date.end}</Badge>
                </HStack>
                <IconButton
                  icon={<FiX />}
                  onClick={() => handleRemoveVisit(index)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  aria-label="Remove visit"
                />
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
      <FormHelperText>
        Add one or more visit date ranges for this organization
      </FormHelperText>
    </FormControl>
  );
};

export default VisitManager;
