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
  FormErrorMessage,
  FormLabel,
  Input,
  VStack,
  Textarea,
  Select,
  FormHelperText,
  Heading,
} from "@chakra-ui/react";
import { FiSave, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

const EditScheduleModal = ({ isOpen, onClose, schedule, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    auditCode: "",
    auditType: "",
    standard: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (schedule && isOpen) {
      setFormData({
        title: schedule.title || "",
        description: schedule.description || "",
        auditCode: schedule.auditCode || "",
        auditType: schedule.auditType || "",
        standard: schedule.standard || "",
      });
      setValidationErrors({});
    }
  }, [schedule, isOpen]);

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

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.auditCode.trim()) {
      errors.auditCode = "Audit code is required";
    }
    if (!formData.auditType) {
      errors.auditType = "Audit type is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    setValidationErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Audit Schedule</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Heading size="sm" mb={2}>
              Basic Information
            </Heading>
            <FormControl isRequired isInvalid={!!validationErrors.title}>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="e.g., Annual Financial Audit 2024"
              />
              <FormErrorMessage>{validationErrors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!validationErrors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Describe the purpose and scope of this audit"
                rows={4}
              />
              <FormErrorMessage>{validationErrors.description}</FormErrorMessage>
            </FormControl>

            <Heading size="sm" mb={2} mt={4}>
              Audit Details
            </Heading>
            <FormControl isRequired isInvalid={!!validationErrors.auditCode}>
              <FormLabel>Audit Code</FormLabel>
              <Input
                value={formData.auditCode}
                onChange={(e) => handleFieldChange("auditCode", e.target.value)}
                placeholder="e.g., AUD-2024-001"
              />
              <FormHelperText>
                Unique identifier for this audit schedule
              </FormHelperText>
              <FormErrorMessage>{validationErrors.auditCode}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!validationErrors.auditType}>
              <FormLabel>Audit Type</FormLabel>
              <Select
                value={formData.auditType}
                onChange={(e) => handleFieldChange("auditType", e.target.value)}
                placeholder="Select audit type"
              >
                <option value="internal">Internal Audit</option>
                <option value="external">External Audit</option>
                <option value="compliance">Compliance Audit</option>
                <option value="financial">Financial Audit</option>
                <option value="operational">Operational Audit</option>
              </Select>
              <FormErrorMessage>{validationErrors.auditType}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Standard</FormLabel>
              <Input
                value={formData.standard}
                onChange={(e) => handleFieldChange("standard", e.target.value)}
                placeholder="e.g., ISO 9001, SOX, ISO 27001"
              />
              <FormHelperText>
                The audit standard or framework being followed (optional)
              </FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={handleClose} leftIcon={<FiX />} mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<FiSave />}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditScheduleModal;
