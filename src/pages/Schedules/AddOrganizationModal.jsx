import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  VStack,
  FormErrorMessage,
  HStack,
  Text,
  IconButton,
  Box,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import TeamAsyncSelect from "../../components/TeamAsyncSelect";
import UserAsyncSelect from "../../components/UserAsyncSelect";

const AddOrganizationModal = ({ isOpen, onClose, scheduleId }) => {
  const [formData, setFormData] = useState({
    teamId: null,
    auditors: [],
    visits: [{ startDate: "", endDate: "" }],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleTeamChange = (team) => {
    setFormData((prev) => ({
      ...prev,
      teamId: team,
    }));
    if (validationErrors.teamId) {
      setValidationErrors((prev) => ({ ...prev, teamId: undefined }));
    }
  };

  const handleAuditorsChange = (auditors) => {
    setFormData((prev) => ({
      ...prev,
      auditors: auditors || [],
    }));
    if (validationErrors.auditors) {
      setValidationErrors((prev) => ({ ...prev, auditors: undefined }));
    }
  };

  const handleVisitChange = (index, field, value) => {
    const newVisits = [...formData.visits];
    newVisits[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      visits: newVisits,
    }));
  };

  const addVisit = () => {
    setFormData((prev) => ({
      ...prev,
      visits: [...prev.visits, { startDate: "", endDate: "" }],
    }));
  };

  const removeVisit = (index) => {
    setFormData((prev) => ({
      ...prev,
      visits: prev.visits.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.teamId) {
      errors.teamId = "Team is required";
    }

    if (formData.auditors.length === 0) {
      errors.auditors = "At least one auditor is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Prepare data for API
      const organizationData = {
        auditScheduleId: scheduleId,
        teamId: formData.teamId.id || formData.teamId._id,
        status: 0, // Backend will handle
        documents: [], // Leave for now as requested
        auditors: formData.auditors.map((a) => a.id || a._id),
        visits: formData.visits
          .filter((v) => v.startDate && v.endDate)
          .map((v) => ({
            date: {
              start: v.startDate,
              end: v.endDate,
            },
          })),
      };

      // TODO: Call API to create organization
      console.log("Creating organization:", organizationData);

      toast.success("Organization Added", {
        description: `${formData.teamId.name} has been added successfully`,
        duration: 3000,
      });

      // Reset form
      setFormData({
        teamId: null,
        auditors: [],
        visits: [{ startDate: "", endDate: "" }],
      });
      onClose();
    } catch (error) {
      toast.error("Failed to Add Organization", {
        description: error.message || "An error occurred. Please try again.",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      teamId: null,
      auditors: [],
      visits: [{ startDate: "", endDate: "" }],
    });
    setValidationErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Add Organization</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!validationErrors.teamId}>
                <FormLabel>Team</FormLabel>
                <TeamAsyncSelect
                  value={formData.teamId}
                  onChange={handleTeamChange}
                  placeholder="Select a team..."
                />
                <FormErrorMessage>{validationErrors.teamId}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!validationErrors.auditors}>
                <FormLabel>Auditors</FormLabel>
                <UserAsyncSelect
                  value={formData.auditors}
                  onChange={handleAuditorsChange}
                  placeholder="Select auditors..."
                  isMulti
                />
                <FormErrorMessage>{validationErrors.auditors}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Visits</FormLabel>
                <VStack spacing={3} align="stretch">
                  {formData.visits.map((visit, index) => (
                    <Box
                      key={index}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <HStack spacing={2} mb={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                          Visit {index + 1}
                        </Text>
                        {formData.visits.length > 1 && (
                          <IconButton
                            size="xs"
                            icon={<FiTrash2 />}
                            onClick={() => removeVisit(index)}
                            aria-label="Remove visit"
                            colorScheme="red"
                            variant="ghost"
                          />
                        )}
                      </HStack>
                      <HStack>
                        <FormControl>
                          <FormLabel fontSize="sm">Start Date</FormLabel>
                          <Input
                            type="date"
                            value={visit.startDate}
                            onChange={(e) =>
                              handleVisitChange(
                                index,
                                "startDate",
                                e.target.value,
                              )
                            }
                            size="sm"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">End Date</FormLabel>
                          <Input
                            type="date"
                            value={visit.endDate}
                            onChange={(e) =>
                              handleVisitChange(index, "endDate", e.target.value)
                            }
                            size="sm"
                          />
                        </FormControl>
                      </HStack>
                    </Box>
                  ))}
                  <Button
                    size="sm"
                    leftIcon={<FiPlus />}
                    onClick={addVisit}
                    variant="outline"
                  >
                    Add Visit
                  </Button>
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brandPrimary"
              type="submit"
              isLoading={saving}
            >
              Add Organization
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddOrganizationModal;
