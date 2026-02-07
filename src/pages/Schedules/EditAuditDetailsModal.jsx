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
  Input,
  Select,
  VStack,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import PreviousAuditAsyncSelect from "../../components/PreviousAuditAsyncSelect";

const EditAuditDetailsModal = ({
  isOpen,
  onClose,
  auditData,
  onSave,
  isSaving,
  currentScheduleId = null,
}) => {
  const [formData, setFormData] = useState({
    auditType: "",
    standard: "",
    previousAudit: null,
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (auditData && isOpen) {
      setFormData({
        auditType: auditData.auditType || "",
        standard: auditData.standard || "",
        previousAudit: auditData.previousAudit || null,
      });
      setValidationErrors({});
    }
  }, [auditData, isOpen]);

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

    if (!formData.auditType) {
      errors.auditType = "Audit type is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    setValidationErrors({});
    // Reset form data to original values
    if (auditData) {
      setFormData({
        auditType: auditData.auditType || "",
        standard: auditData.standard || "",
        previousAudit: auditData.previousAudit || null,
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Audit Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
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

            <PreviousAuditAsyncSelect
              value={formData.previousAudit}
              onChange={(audit) => handleFieldChange("previousAudit", audit)}
              currentScheduleId={currentScheduleId}
              label="Previous Audit"
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
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditAuditDetailsModal;
