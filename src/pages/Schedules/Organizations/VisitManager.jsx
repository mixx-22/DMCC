import {
  VStack,
  HStack,
  Box,
  FormLabel,
  IconButton,
  Badge,
  FormControl,
  FormHelperText,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import moment from "moment/moment";
import { useLayout } from "../../../context/_useContext";
import { formatDateRange } from "../../../utils/helpers";
import { getDocumentIcon } from "../../../components/Document/DocumentIcon";

const VisitManager = ({ visits = [], onChange, isInvalid }) => {
  const { pageRef } = useLayout();
  const bg = useColorModeValue("brandPrimary.50", "brandPrimary.200");
  const borderColor = useColorModeValue("brandPrimary.200", "brandPrimary.200");
  const invalidBg = useColorModeValue("error.50", "error.200");
  const invalidBorderColor = useColorModeValue("error.200", "error.200");

  // State to track whether to show the add visit form
  const [showAddForm, setShowAddForm] = useState(false);

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

    // Reset dates and hide form
    setVisitDates({
      start: new Date(moment(new Date()).add(1, "d")),
      end: new Date(moment(new Date()).add(1, "d")),
    });
    setShowAddForm(false);
  };

  const handleRemoveVisit = (index) => {
    onChange(visits.filter((_, i) => i !== index));
  };

  // Show form if no visits exist or if user clicked "Add Visit"
  const shouldShowForm = visits.length === 0 || showAddForm;

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
              {getDocumentIcon({ type: "auditSchedule" }, 20)}
              <Badge colorScheme="purple">
                {formatDateRange(visit.date.start, visit.date.end)}
              </Badge>
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

        {/* Show form or Add Visit button */}
        {shouldShowForm ? (
          <HStack
            p={2}
            bg={isInvalid ? invalidBg : bg}
            borderWidth={2}
            borderRadius="md"
            borderStyle="dashed"
            alignItems="flex-end"
            borderColor={isInvalid ? invalidBorderColor : borderColor}
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
                usePortal
                portalRef={pageRef}
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
                usePortal
                portalRef={pageRef}
              />
            </Box>
            <Button
              size="sm"
              colorScheme="purple"
              w={{ base: "full", md: "fit-content" }}
              onClick={handleAddVisit}
              leftIcon={<FiPlus />}
            >
              Add Visit
            </Button>
            {visits.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                w={{ base: "full", md: "fit-content" }}
                onClick={() => setShowAddForm(false)}
                leftIcon={<FiX />}
              >
                Cancel
              </Button>
            )}
          </HStack>
        ) : (
          <Button
            size="sm"
            leftIcon={<FiPlus />}
            onClick={() => setShowAddForm(true)}
            colorScheme="purple"
            variant="outline"
          >
            Add Visit
          </Button>
        )}
      </VStack>
      <FormHelperText fontSize="xs" color="gray.500">
        Add one or more visit date ranges for this organization
      </FormHelperText>
    </FormControl>
  );
};

export default VisitManager;
