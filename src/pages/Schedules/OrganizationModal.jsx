import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormErrorMessage,
  FormHelperText,
  FormControl,
  FormLabel,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import TeamSingleAsyncSelect from "../../components/TeamSingleAsyncSelect";
import UserAsyncSelect from "../../components/UserAsyncSelect";
import VisitManager from "./components/VisitManager";

const OrganizationModal = ({
  isOpen,
  onClose,
  onSave,
  organization = null,
  scheduleId,
  existingTeamIds = [],
  isSaving,
}) => {
  const isEdit = !!organization;

  const [formData, setFormData] = useState({
    team: null,
    auditors: [],
    visits: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (organization && isOpen) {
      setFormData({
        team: organization.team || {
          _id: organization.teamId,
          name: "Loading...",
        },
        auditors: organization.auditors || [],
        visits: organization.visits || [],
      });
      setValidationErrors({});
    } else if (isOpen) {
      setFormData({
        team: null,
        auditors: [],
        visits: [],
      });
      setValidationErrors({});
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

  const validateForm = () => {
    const errors = {};

    if (!formData.team) {
      errors.team = "Team is required";
    } else if (
      !isEdit &&
      existingTeamIds.includes(formData.team._id || formData.team.id)
    ) {
      errors.team = "This team is already added to this schedule";
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
        teamId: formData.team._id || formData.team.id,
        auditors: formData.auditors.map((a) => a._id || a.id), // Extract user IDs
        visits: formData.visits,
      };
      onSave(payload);
    }
  };

  const handleCancel = () => {
    setValidationErrors({});
    onClose();
  };

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
            <TeamSingleAsyncSelect
              value={formData.team}
              onChange={(team) => handleFieldChange("team", team)}
              isInvalid={!!validationErrors.team}
              isDisabled={isEdit} // Can't change team when editing
              label="Team"
              placeholder="Type at least 2 characters to search teams..."
              helperText={
                isEdit
                  ? "Team cannot be changed after creation"
                  : "Select a team to add to this audit schedule"
              }
            />
            {validationErrors.team && (
              <FormControl isInvalid>
                <FormErrorMessage>{validationErrors.team}</FormErrorMessage>
              </FormControl>
            )}

            <Divider my={4} />

            {/* Auditors Selection */}
            <FormControl isRequired isInvalid={!!validationErrors.auditors}>
              <FormLabel>Auditors</FormLabel>
              <UserAsyncSelect
                value={formData.auditors}
                onChange={(users) => handleFieldChange("auditors", users)}
                placeholder="Type at least 2 characters to search users..."
                label=""
                displayMode="none"
              />
              <FormHelperText>
                Select one or more users as auditors for this organization
              </FormHelperText>
              {validationErrors.auditors && (
                <FormErrorMessage>{validationErrors.auditors}</FormErrorMessage>
              )}
            </FormControl>

            <Divider my={4} />

            {/* Visits Section */}
            <VisitManager
              visits={formData.visits}
              onChange={(visits) => handleFieldChange("visits", visits)}
            />
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
