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
  Select,
  VStack,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import PreviousAuditAsyncSelect from "../../components/PreviousAuditAsyncSelect";
import StandardsAsyncSelect from "../../components/StandardsAsyncSelect";
import { generateAuditCode, parseAuditCode } from "../../utils/auditHelpers";

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
    auditYear: new Date().getFullYear().toString(),
    auditNumber: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (auditData && isOpen) {
      // Parse existing audit code if present
      const { auditYear, auditNumber } = parseAuditCode(auditData.auditCode);

      setFormData({
        auditType: auditData.auditType || "",
        standard: auditData.standard || "",
        previousAudit: auditData.previousAudit || null,
        auditYear,
        auditNumber,
      });
      setValidationErrors({});
    }
  }, [auditData, isOpen]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Auto-generate audit code when type, year, or number changes
      if (
        field === "auditType" ||
        field === "auditYear" ||
        field === "auditNumber"
      ) {
        const type = field === "auditType" ? value : prev.auditType;
        const year = field === "auditYear" ? value : prev.auditYear;
        const number = field === "auditNumber" ? value : prev.auditNumber;

        if (type) {
          updated.auditCode = generateAuditCode(type, year, number);
        }
      }

      return updated;
    });

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
      const { auditYear, auditNumber } = parseAuditCode(auditData.auditCode);

      setFormData({
        auditType: auditData.auditType || "",
        standard: auditData.standard || "",
        previousAudit: auditData.previousAudit || null,
        auditYear,
        auditNumber,
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

            <StandardsAsyncSelect
              value={formData.standard}
              onChange={(standard) => handleFieldChange("standard", standard)}
              label="Standard"
            />

            <PreviousAuditAsyncSelect
              value={formData.previousAudit}
              onChange={(audit) => handleFieldChange("previousAudit", audit)}
              currentScheduleId={currentScheduleId}
              label="Previous Audit"
              allowEmptySearch
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
