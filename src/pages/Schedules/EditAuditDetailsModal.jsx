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
  HStack,
  InputGroup,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import PreviousAuditAsyncSelect from "../../components/PreviousAuditAsyncSelect";
import { generateAuditCode, getAuditTypePrefix } from "../../utils/auditHelpers";

const EditAuditDetailsModal = ({
  isOpen,
  onClose,
  auditData,
  onSave,
  isSaving,
  currentScheduleId = null,
}) => {
  const [formData, setFormData] = useState({
    auditCode: "",
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
      let auditYear = new Date().getFullYear().toString();
      let auditNumber = "";
      
      if (auditData.auditCode) {
        // Extract year and number from existing audit code (format: PREFIX-YEAR-NUMBER)
        const parts = auditData.auditCode.split("-");
        if (parts.length >= 2) {
          auditYear = parts[1] || auditYear;
        }
        if (parts.length >= 3) {
          auditNumber = parts[2] || "";
        }
      }
      
      setFormData({
        auditCode: auditData.auditCode || "",
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
      if (field === "auditType" || field === "auditYear" || field === "auditNumber") {
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

    if (!formData.auditCode.trim()) {
      errors.auditCode = "Audit code is required";
    }
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
      let auditYear = new Date().getFullYear().toString();
      let auditNumber = "";
      
      if (auditData.auditCode) {
        const parts = auditData.auditCode.split("-");
        if (parts.length >= 2) {
          auditYear = parts[1] || auditYear;
        }
        if (parts.length >= 3) {
          auditNumber = parts[2] || "";
        }
      }
      
      setFormData({
        auditCode: auditData.auditCode || "",
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

            <FormControl isRequired isInvalid={!!validationErrors.auditCode}>
              <FormLabel>Audit Code</FormLabel>
              <HStack spacing={2}>
                <InputGroup size="md" flex="0 0 100px">
                  <Input
                    value={getAuditTypePrefix(formData.auditType) || ""}
                    isReadOnly
                    bg="gray.100"
                    placeholder="PREFIX"
                    textAlign="center"
                    fontWeight="bold"
                  />
                </InputGroup>
                <InputGroup size="md" flex="0 0 100px">
                  <Input
                    value={formData.auditYear}
                    onChange={(e) => handleFieldChange("auditYear", e.target.value)}
                    placeholder="YYYY"
                    textAlign="center"
                    maxLength={4}
                  />
                </InputGroup>
                <InputGroup size="md" flex="1">
                  <Input
                    value={formData.auditNumber}
                    onChange={(e) => handleFieldChange("auditNumber", e.target.value)}
                    placeholder="Number (e.g., 001 or 9999)"
                    textAlign="center"
                  />
                </InputGroup>
              </HStack>
              <FormHelperText>
                Prefix is based on audit type and cannot be edited. Format: {formData.auditType ? getAuditTypePrefix(formData.auditType) : "PREFIX"}-YEAR-NUMBER
              </FormHelperText>
              <FormErrorMessage>{validationErrors.auditCode}</FormErrorMessage>
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
