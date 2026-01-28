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
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiPlus, FiX, FiCalendar } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import moment from "moment/moment";

const VisitManager = ({ visits = [], onChange }) => {
  const bg = useColorModeValue("brandPrimary.50", "brandPrimary.200");
  const borderColor = useColorModeValue("brandPrimary.200", "brandPrimary.200");
  const [visitDates, setVisitDates] = useState({
    start: new Date(moment(new Date()).add(1, "d")),
    end: new Date(moment(new Date()).add(1, "d")),
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
        {visits.map((visit, index) => (
          <HStack
            p={2}
            key={index}
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
        <HStack
          p={2}
          bg={bg}
          borderWidth={2}
          borderRadius="md"
          borderStyle="dashed"
          alignItems="flex-end"
          borderColor={borderColor}
          flexWrap={{ base: "wrap", md: "nowrap" }}
        >
          <Box flex={1}>
            <FormLabel fontSize="sm">Start Date</FormLabel>
            <SingleDatepicker
              date={visitDates.start}
              onDateChange={(date) =>
                setVisitDates((prev) => ({
                  ...prev,
                  start: date,
                  end: prev.end && prev.end < date ? date : prev.end,
                }))
              }
              minDate={new Date()}
              configs={{ dateFormat: "MMMM dd, yyyy" }}
              propsConfigs={{
                inputProps: {
                  size: "sm",
                },
                triggerBtnProps: {
                  size: "sm",
                  w: "full",
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
              minDate={visitDates.start}
              configs={{ dateFormat: "MMMM dd, yyyy" }}
              propsConfigs={{
                inputProps: {
                  size: "sm",
                },
                triggerBtnProps: {
                  size: "sm",
                  w: "full",
                },
              }}
            />
          </Box>
          <Button
            size="sm"
            variant={"outline"}
            colorScheme="brandPrimary"
            w={{ base: "full", md: "fit-content" }}
            onClick={handleAddVisit}
            leftIcon={<FiPlus />}
          >
            Add Visit
          </Button>
        </HStack>
      </VStack>
      <FormHelperText fontSize="xs" color="gray.500">
        Add one or more visit date ranges for this organization
      </FormHelperText>
    </FormControl>
  );
};

export default VisitManager;
