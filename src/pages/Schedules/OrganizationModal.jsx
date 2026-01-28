import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  VStack,
  FormErrorMessage,
  FormHelperText,
  HStack,
  IconButton,
  Badge,
  Box,
  Text,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { useState, useEffect } from "react";
import { FiSave, FiPlus, FiX, FiCalendar } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

const OrganizationModal = ({
  isOpen,
  onClose,
  onSave,
  organization = null,
  scheduleId,
  teams = [],
  users = [],
  existingTeamIds = [],
  isSaving,
}) => {
  const isEdit = !!organization;

  const [formData, setFormData] = useState({
    teamId: "",
    auditors: [],
    visits: [],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [visitDates, setVisitDates] = useState({ start: new Date(), end: new Date() });

  useEffect(() => {
    if (organization && isOpen) {
      setFormData({
        teamId: organization.teamId || "",
        auditors: organization.auditors || [],
        visits: organization.visits || [],
      });
      setValidationErrors({});
    } else if (isOpen) {
      setFormData({
        teamId: "",
        auditors: [],
        visits: [],
      });
      setValidationErrors({});
      setVisitDates({ start: new Date(), end: new Date() });
    }
  }, [organization, isOpen]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAddVisit = () => {
    const newVisit = {
      date: {
        start: visitDates.start.toISOString().split("T")[0],
        end: visitDates.end.toISOString().split("T")[0],
      },
    };

    setFormData((prev) => ({
      ...prev,
      visits: [...prev.visits, newVisit],
    }));

    // Reset dates
    setVisitDates({ start: new Date(), end: new Date() });
  };

  const handleRemoveVisit = (index) => {
    setFormData((prev) => ({
      ...prev,
      visits: prev.visits.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.teamId) {
      errors.teamId = "Team is required";
    } else if (!isEdit && existingTeamIds.includes(formData.teamId)) {
      errors.teamId = "This team is already added to this schedule";
    }

    if (!formData.auditors || formData.auditors.length === 0) {
      errors.auditors = "At least one auditor is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare data for API - only include IDs
      const payload = {
        auditScheduleId: scheduleId,
        teamId: formData.teamId,
        auditors: formData.auditors, // Already array of IDs
        visits: formData.visits,
      };
      onSave(payload);
    }
  };

  const handleCancel = () => {
    setValidationErrors({});
    onClose();
  };

  // Prepare team options
  const teamOptions = teams
    .filter((team) => {
      // If editing, allow current team, otherwise filter out existing teams
      if (isEdit && team._id === organization?.teamId) return true;
      return !existingTeamIds.includes(team._id);
    })
    .map((team) => ({
      label: team.name,
      value: team._id,
    }));

  // Prepare user options
  const userOptions = users.map((user) => ({
    label: `${user.firstName || ""} ${user.lastName || ""} (${user.email || ""})`,
    value: user._id || user.id,
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEdit ? "Edit Organization" : "Add Organization"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {/* Team Selection */}
            <FormControl isRequired isInvalid={!!validationErrors.teamId}>
              <FormLabel>Team</FormLabel>
              <ChakraSelect
                value={teamOptions.find((opt) => opt.value === formData.teamId)}
                onChange={(option) => handleFieldChange("teamId", option?.value || "")}
                options={teamOptions}
                placeholder="Select team"
                isDisabled={isEdit} // Can't change team when editing
              />
              <FormHelperText>
                {isEdit
                  ? "Team cannot be changed after creation"
                  : "Select a team to add to this audit schedule"}
              </FormHelperText>
              <FormErrorMessage>{validationErrors.teamId}</FormErrorMessage>
            </FormControl>

            {/* Auditors Selection */}
            <FormControl isRequired isInvalid={!!validationErrors.auditors}>
              <FormLabel>Auditors</FormLabel>
              <ChakraSelect
                isMulti
                value={userOptions.filter((opt) =>
                  formData.auditors.includes(opt.value)
                )}
                onChange={(options) =>
                  handleFieldChange(
                    "auditors",
                    options ? options.map((opt) => opt.value) : []
                  )
                }
                options={userOptions}
                placeholder="Select auditors"
              />
              <FormHelperText>
                Select one or more users as auditors for this organization
              </FormHelperText>
              <FormErrorMessage>{validationErrors.auditors}</FormErrorMessage>
            </FormControl>

            {/* Visits Section */}
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
                {formData.visits.length > 0 && (
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      Added Visits:
                    </Text>
                    {formData.visits.map((visit, index) => (
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
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<FiSave />}
          >
            {isEdit ? "Save Changes" : "Add Organization"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrganizationModal;
