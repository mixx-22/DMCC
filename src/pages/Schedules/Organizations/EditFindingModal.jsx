import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormHelperText,
  Text,
  Divider,
  useColorModeValue,
  useDisclosure,
  Wrap,
  WrapItem,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState, useEffect } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import UserAsyncSelect from "../../../components/UserAsyncSelect";
import ClauseSelectionModal from "../../../components/ClauseSelectionModal";

// Helper function to check if compliance type is a Non-Conformity
const isNonConformity = (complianceType) => {
  return ["MINOR_NC", "MAJOR_NC", "NC"].includes(complianceType);
};

// Compliance options
const COMPLIANCE_OPTIONS = [
  {
    value: "OBSERVATIONS",
    label: "OBSERVATIONS",
    description:
      "Findings result of internal quality audit conducted. It can be positive or negative findings.",
  },
  {
    value: "OPPORTUNITIES_FOR_IMPROVEMENTS",
    label: "OPPORTUNITIES FOR IMPROVEMENTS",
    description:
      "Negative findings which did not violate any standard of ISO or the QMS but may result to non-conformity if not corrected.",
  },
  {
    value: "MINOR_NC",
    label: "MINOR NON-CONFORMITY",
    description:
      "NC which violated a single clause or sub-clause which has no adverse effect on consumer satisfaction or product quality",
  },
  {
    value: "MAJOR_NC",
    label: "MAJOR NON-CONFORMITY",
    description:
      "NC which violated a single clause or sub-clause resulting to an adverse effect on consumer satisfaction or product quality.",
  },
];

// TODO Editing Form not Fully Working; Users Input not displaying current selected User
const EditFindingModal = ({
  isOpen,
  onClose,
  finding,
  auditStandardClauses = [], // Changed from teamObjectives to auditStandardClauses
  onSave,
}) => {
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const { isOpen: isClauseModalOpen, onOpen: onClauseModalOpen, onClose: onClauseModalClose } = useDisclosure();

  const [formData, setFormData] = useState({
    title: "",
    details: "",
    clauses: [], // Changed from objective to clauses array
    compliance: "",
    report: {
      reportNo: "",
      details: "",
      date: new Date(),
      auditee: null,
      auditor: null,
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when finding changes
  useEffect(() => {
    if (finding) {
      // Handle backward compatibility for clauses
      let clauses = [];
      if (finding.clauses && Array.isArray(finding.clauses)) {
        clauses = finding.clauses;
      } else if (finding.objectives && Array.isArray(finding.objectives)) {
        // Old format: objectives - convert to clauses
        clauses = finding.objectives.map(obj => ({
          id: obj._id || obj.id,
          name: obj.title,
        }));
      } else if (finding.objective) {
        // Very old format: single objective - ignore for now
        clauses = [];
      }

      setFormData({
        title: finding.title || "",
        details: finding.details || "",
        clauses: clauses,
        compliance: finding.compliance || "",
        report: {
          reportNo: finding.report?.reportNo || "",
          details: finding.report?.details || "",
          date: finding.report?.date
            ? new Date(finding.report.date)
            : new Date(),
          auditee: finding.report?.auditee || null,
          auditor: finding.report?.auditor || null,
        },
      });
      setErrors({});
    }
  }, [finding]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleReportChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      report: {
        ...prev.report,
        [field]: value,
      },
    }));
    // Clear error when user types
    if (errors[`report.${field}`]) {
      setErrors((prev) => ({ ...prev, [`report.${field}`]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.details.trim()) {
      newErrors.details = "Details are required";
    }
    if (!formData.clauses || formData.clauses.length === 0) {
      newErrors.clauses = "At least one clause is required";
    }
    if (!formData.compliance) {
      newErrors.compliance = "Compliance type is required";
    }

    // Validate report fields if compliance is Non-Conformity
    if (isNonConformity(formData.compliance)) {
      if (!formData.report.reportNo?.trim()) {
        newErrors["report.reportNo"] =
          "Report number is required for Non-Conformity";
      }
      if (!formData.report.details?.trim()) {
        newErrors["report.details"] =
          "Report details are required for Non-Conformity";
      }
      if (!formData.report.auditee) {
        newErrors["report.auditee"] = "Auditee is required for Non-Conformity";
      }
      if (!formData.report.auditor) {
        newErrors["report.auditor"] = "Auditor is required for Non-Conformity";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create updated finding data
      const updatedFinding = {
        ...finding, // Preserve _id and other fields
        title: formData.title,
        details: formData.details,
        clauses: formData.clauses, // Use clauses instead of objective
        compliance: formData.compliance,
      };

      // Only include report if it's a Non-Conformity type
      if (isNonConformity(formData.compliance)) {
        updatedFinding.report = {
          reportNo: formData.report.reportNo,
          details: formData.report.details,
          date: formData.report.date,
          auditee: formData.report.auditee
            ? {
                ...formData.report.auditee,
                id: formData.report.auditee._id || formData.report.auditee.id,
                _id: formData.report.auditee._id || formData.report.auditee.id,
              }
            : null,
          auditor: formData.report.auditor
            ? {
                ...formData.report.auditor,
                id: formData.report.auditor._id || formData.report.auditor.id,
                _id: formData.report.auditor._id || formData.report.auditor.id,
              }
            : null,
        };
      } else {
        // Remove report if not NC type
        updatedFinding.report = undefined;
      }

      await onSave(updatedFinding);
      onClose();
    } catch (error) {
      console.error("Failed to update finding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!finding) return null;

  const selectedCompliance = COMPLIANCE_OPTIONS.find(
    (opt) => opt.value === formData.compliance,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Finding</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {" "}
            {/* Clauses Selection */}
            <FormControl isInvalid={!!errors.clauses} isRequired>
              <FormLabel fontSize="sm">Clauses</FormLabel>
              <VStack align="stretch" spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClauseModalOpen}
                  colorScheme="brandPrimary"
                >
                  {formData.clauses.length > 0
                    ? `${formData.clauses.length} Clause${formData.clauses.length > 1 ? 's' : ''} Selected`
                    : 'Select Clauses'}
                </Button>
                {formData.clauses.length > 0 && (
                  <Wrap spacing={2}>
                    {formData.clauses.map((clause) => (
                      <WrapItem key={clause.id}>
                        <Badge
                          colorScheme="brandPrimary"
                          fontSize="xs"
                          px={2}
                          py={1}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <Text>{clause.name}</Text>
                          <IconButton
                            icon={<FiX />}
                            size="xs"
                            variant="ghost"
                            minW="auto"
                            h="auto"
                            p={0}
                            onClick={() => {
                              handleChange(
                                "clauses",
                                formData.clauses.filter((c) => c.id !== clause.id)
                              );
                            }}
                            aria-label="Remove clause"
                          />
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
              {errors.clauses && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {errors.clauses}
                </Text>
              )}
            </FormControl>

            <ClauseSelectionModal
              isOpen={isClauseModalOpen}
              onClose={onClauseModalClose}
              clauses={auditStandardClauses}
              value={formData.clauses}
              onChange={(selectedClauses) => handleChange("clauses", selectedClauses)}
            />
            {/* Compliance */}
            <FormControl isInvalid={!!errors.compliance} isRequired>
              <FormLabel fontSize="sm">Compliance Type</FormLabel>
              <Select
                size="sm"
                value={selectedCompliance}
                onChange={(option) =>
                  handleChange("compliance", option?.value || "")
                }
                options={COMPLIANCE_OPTIONS}
                placeholder="Select compliance type"
                isClearable
                useBasicStyles
              />
              {selectedCompliance && (
                <FormHelperText fontSize="xs">
                  {selectedCompliance.description}
                </FormHelperText>
              )}
              {errors.compliance && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {errors.compliance}
                </Text>
              )}
            </FormControl>
            {/* Title */}
            <FormControl isInvalid={!!errors.title} isRequired>
              <FormLabel fontSize="sm">Title</FormLabel>
              <Input
                size="sm"
                placeholder="Enter finding title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
              {errors.title && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {errors.title}
                </Text>
              )}
            </FormControl>
            {/* Details */}
            <FormControl isInvalid={!!errors.details} isRequired>
              <FormLabel fontSize="sm">Details</FormLabel>
              <Textarea
                size="sm"
                placeholder="Enter detailed description"
                value={formData.details}
                onChange={(e) => handleChange("details", e.target.value)}
                rows={4}
              />
              {errors.details && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {errors.details}
                </Text>
              )}
            </FormControl>
            {/* Report Section - Only for Non-Conformity */}
            {isNonConformity(formData.compliance) && (
              <>
                <Divider />
                <VStack align="stretch" spacing={4}>
                  <Text fontWeight="semibold" fontSize="sm" color={labelColor}>
                    Report Details (Required for Non-Conformity)
                  </Text>

                  {/* Report Number */}
                  <FormControl
                    isInvalid={!!errors["report.reportNo"]}
                    isRequired
                  >
                    <FormLabel fontSize="sm">Report Number</FormLabel>
                    <Input
                      size="sm"
                      placeholder="Enter report number"
                      value={formData.report.reportNo}
                      onChange={(e) =>
                        handleReportChange("reportNo", e.target.value)
                      }
                    />
                    {errors["report.reportNo"] && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors["report.reportNo"]}
                      </Text>
                    )}
                  </FormControl>

                  {/* Report Details */}
                  <FormControl
                    isInvalid={!!errors["report.details"]}
                    isRequired
                  >
                    <FormLabel fontSize="sm">Report Details</FormLabel>
                    <Textarea
                      size="sm"
                      placeholder="Enter report details"
                      value={formData.report.details}
                      onChange={(e) =>
                        handleReportChange("details", e.target.value)
                      }
                      rows={3}
                    />
                    {errors["report.details"] && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors["report.details"]}
                      </Text>
                    )}
                  </FormControl>

                  {/* Date Issued */}
                  <FormControl>
                    <FormLabel fontSize="sm">Date Issued</FormLabel>
                    <SingleDatepicker
                      name="date"
                      date={formData.report.date}
                      onDateChange={(date) => handleReportChange("date", date)}
                      configs={{
                        dateFormat: "MM/dd/yyyy",
                      }}
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
                  </FormControl>

                  {/* Auditee */}
                  <FormControl
                    isInvalid={!!errors["report.auditee"]}
                    isRequired
                  >
                    <FormLabel fontSize="sm">Auditee</FormLabel>
                    <UserAsyncSelect
                      label=""
                      value={
                        formData.report.auditee ? [formData.report.auditee] : []
                      }
                      onChange={(users) =>
                        handleReportChange("auditee", users[0] || null)
                      }
                      placeholder="Select Auditee"
                      displayMode="none"
                    />
                    {errors["report.auditee"] && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors["report.auditee"]}
                      </Text>
                    )}
                  </FormControl>

                  {/* Auditor */}
                  <FormControl
                    isInvalid={!!errors["report.auditor"]}
                    isRequired
                  >
                    <FormLabel fontSize="sm">Auditor</FormLabel>
                    <UserAsyncSelect
                      label=""
                      value={
                        formData.report.auditor ? [formData.report.auditor] : []
                      }
                      onChange={(users) =>
                        handleReportChange("auditor", users[0] || null)
                      }
                      placeholder="Select Auditor"
                      displayMode="none"
                    />
                    {errors["report.auditor"] && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors["report.auditor"]}
                      </Text>
                    )}
                  </FormControl>
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2}>
            <Button
              variant="ghost"
              leftIcon={<FiX />}
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="brandPrimary"
              leftIcon={<FiSave />}
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditFindingModal;
