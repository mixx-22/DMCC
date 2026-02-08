import {
  VStack,
  HStack,
  Box,
  Text,
  FormLabel,
  Input,
  Textarea,
  Button,
  FormControl,
  FormHelperText,
  useColorModeValue,
  Divider,
  IconButton,
  useDisclosure,
  Wrap,
  WrapItem,
  Badge,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import OrganizationAuditorsSelect from "../../../components/OrganizationAuditorsSelect";
import TeamLeadersSelect from "../../../components/TeamLeadersSelect";
import ClauseSelectionModal from "../../../components/ClauseSelectionModal";
import { useLayout } from "../../../context/_useContext";

// Helper function to check if compliance type is a Non-Conformity
const isNonConformity = (complianceType) => {
  return ["MINOR_NC", "MAJOR_NC", "NC"].includes(complianceType);
};

// Compliance options as per requirements
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
  {
    value: "COMPLIANT",
    label: "COMPLIANT",
    description:
      "Non-conformity has been corrected and verified. The finding is now compliant with requirements.",
  },
];

const FindingsForm = ({
  team = null, // NEW: Accept full team object for updatedAt
  organizationAuditors = [], // List of auditors from organization
  auditStandardClauses = [], // Changed from teamObjectives to auditStandardClauses
  initialData = null,
  mode = "add",
  onAddFinding,
  onCancel,
}) => {
  const bg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const borderColor = useColorModeValue("brandPrimary.200", "brandPrimary.700");
  const { pageRef } = useLayout();
  const {
    isOpen: isClauseModalOpen,
    onOpen: onClauseModalOpen,
    onClose: onClauseModalClose,
  } = useDisclosure();

  // Initialize form data based on mode
  const getInitialFormData = () => {
    if (mode === "edit" && initialData) {
      // Handle backward compatibility: clauses should be an array
      let clauses = [];
      if (initialData.clauses && Array.isArray(initialData.clauses)) {
        clauses = initialData.clauses;
      } else if (
        initialData.objectives &&
        Array.isArray(initialData.objectives)
      ) {
        // Old format: objectives - convert to clauses
        clauses = initialData.objectives.map((obj) => ({
          id: obj._id || obj.id,
          name: obj.title,
        }));
      } else if (initialData.objective) {
        // Very old format: single objective - ignore for now
        clauses = [];
      }

      return {
        _id: initialData._id,
        title: initialData.title || "",
        details: initialData.details || "",
        clauses: clauses, // NEW: Array of clause objects { id, name }
        compliance: initialData.compliance || "",
        currentCompliance:
          initialData.currentCompliance || initialData.compliance || "",
        corrected: (() => {
          // Handle backward compatibility: convert old corrected value (1) to new system (2)
          if (initialData.corrected === 1) return 2; // Old "corrected" becomes new "corrected"
          if (initialData.corrected !== undefined) return initialData.corrected;
          return -1; // Default for new findings
        })(),
        correctionDate: initialData.correctionDate
          ? new Date(initialData.correctionDate)
          : null,
        remarks: initialData.remarks || "",
        report: initialData.report
          ? {
              reportNo: initialData.report.reportNo || "",
              details: initialData.report.details || "",
              date: initialData.report.date
                ? new Date(initialData.report.date)
                : new Date(),
              auditee: Array.isArray(initialData.report.auditee)
                ? initialData.report.auditee
                : initialData.report.auditee
                  ? [initialData.report.auditee]
                  : [],
              auditor: Array.isArray(initialData.report.auditor)
                ? initialData.report.auditor
                : initialData.report.auditor
                  ? [initialData.report.auditor]
                  : [],
            }
          : {
              reportNo: "",
              details: "",
              date: new Date(),
              auditee: [],
              auditor: [],
            },
        actionPlan: initialData.actionPlan || undefined, // Preserve action plan
      };
    }
    return {
      title: "",
      details: "",
      clauses: [], // NEW: Array instead of objectives
      compliance: "",
      currentCompliance: "",
      corrected: -1,
      correctionDate: null,
      remarks: "",
      report: {
        reportNo: "",
        details: "",
        date: new Date(),
        auditee: [],
        auditor: [],
      },
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  const [errors, setErrors] = useState({});

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

    // Validate report section only for Non-Conformity types
    if (isNonConformity(formData.compliance)) {
      if (!formData.report.reportNo.trim()) {
        newErrors["report.reportNo"] = "Report number is required";
      }
      if (!formData.report.details.trim()) {
        newErrors["report.details"] = "Report details are required";
      }
      if (!formData.report.auditee || formData.report.auditee.length === 0) {
        newErrors["report.auditee"] = "At least one auditee is required";
      }
      if (!formData.report.auditor || formData.report.auditor.length === 0) {
        newErrors["report.auditor"] = "At least one auditor is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate unique client-side ID for finding
  const generateFindingId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `finding-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Calculate currentCompliance based on corrected status
      const calculatedCurrentCompliance =
        formData.corrected === 2 ? "COMPLIANT" : formData.compliance;

      const findingData = {
        _id: formData._id || generateFindingId(), // Use existing ID in edit mode or generate new for add mode
        id: formData.id || generateFindingId(), // Backup ID field
        ...formData,
        currentCompliance: calculatedCurrentCompliance,
        correctionDate: formData.correctionDate
          ? formData.correctionDate.toISOString().split("T")[0]
          : null,
        createdAt: formData.createdAt || new Date().toISOString(), // Preserve existing or add new timestamp
        report: isNonConformity(formData.compliance)
          ? {
              ...formData.report,
              date: formData.report.date.toISOString().split("T")[0],
              auditee: formData.report.auditee || [],
              auditor: formData.report.auditor || [],
            }
          : undefined,
        actionPlan: formData.actionPlan || undefined, // Preserve action plan if it exists
      };

      try {
        await onAddFinding(findingData);

        // Reset form only on successful add (not in edit mode)
        if (mode === "add") {
          setFormData({
            title: "",
            details: "",
            clauses: [],
            compliance: "",
            report: {
              reportNo: "",
              details: "",
              date: new Date(),
              auditee: [],
              auditor: [],
            },
          });
          setErrors({});
        }
      } catch (error) {
        // If onAddFinding fails, don't reset form - preserve user's data
        console.error("Failed to add finding:", error);
      }
    }
  };

  return (
    <Box
      p={4}
      bg={bg}
      borderWidth={2}
      borderRadius="md"
      borderStyle="dashed"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontWeight="semibold" fontSize="md">
            {mode === "edit" ? "Edit Finding" : "Add New Finding"}
          </Text>
          {onCancel && (
            <IconButton
              icon={<FiX />}
              size="sm"
              variant="ghost"
              onClick={onCancel}
              aria-label="Cancel"
            />
          )}
        </HStack>
        {/* Clauses Selection */}
        <FormControl isInvalid={!!errors.clauses}>
          <FormLabel fontSize="sm">Clause/s</FormLabel>
          <VStack align="stretch" spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={onClauseModalOpen}
              colorScheme="brandPrimary"
            >
              {formData.clauses.length > 0
                ? `${formData.clauses.length} Clause${formData.clauses.length > 1 ? "s" : ""} Selected`
                : "Select Clauses"}
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
                            formData.clauses.filter((c) => c.id !== clause.id),
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
            <FormHelperText color="red.500" fontSize="xs">
              {errors.clauses}
            </FormHelperText>
          )}
        </FormControl>

        <ClauseSelectionModal
          isOpen={isClauseModalOpen}
          onClose={onClauseModalClose}
          clauses={auditStandardClauses}
          value={formData.clauses}
          onChange={(selectedClauses) =>
            handleChange("clauses", selectedClauses)
          }
        />

        {/* Compliance Dropdown */}
        <FormControl isInvalid={!!errors.compliance}>
          <FormLabel fontSize="sm">Compliance</FormLabel>
          <Select
            size="sm"
            value={COMPLIANCE_OPTIONS.find(
              (opt) => opt.value === formData.compliance,
            )}
            onChange={(option) =>
              handleChange("compliance", option?.value || "")
            }
            options={COMPLIANCE_OPTIONS}
            placeholder="Select compliance type"
            isClearable
            useBasicStyles
            menuPortalTarget={document.body}
          />
          {errors.compliance && (
            <FormHelperText color="red.500" fontSize="xs">
              {errors.compliance}
            </FormHelperText>
          )}
          {formData.compliance && (
            <FormHelperText fontSize="xs" mt={1}>
              {
                COMPLIANCE_OPTIONS.find(
                  (opt) => opt.value === formData.compliance,
                )?.description
              }
            </FormHelperText>
          )}
        </FormControl>

        {/* Title */}
        <FormControl isInvalid={!!errors.title}>
          <FormLabel fontSize="sm">Title</FormLabel>
          <Input
            size="sm"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Enter finding title"
          />
          {errors.title && (
            <FormHelperText color="red.500" fontSize="xs">
              {errors.title}
            </FormHelperText>
          )}
        </FormControl>

        {/* Details */}
        <FormControl isInvalid={!!errors.details}>
          <FormLabel fontSize="sm">Details</FormLabel>
          <Textarea
            size="sm"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
            placeholder="Enter detailed description of the finding"
            rows={3}
          />
          {errors.details && (
            <FormHelperText color="red.500" fontSize="xs">
              {errors.details}
            </FormHelperText>
          )}
        </FormControl>

        {/* Report Section - Only shown for Non-Conformity types */}
        {isNonConformity(formData.compliance) && (
          <>
            <Divider />
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Report Details (Required for Non-Conformity)
              </Text>

              {/* Report Number */}
              <FormControl isInvalid={!!errors["report.reportNo"]}>
                <FormLabel fontSize="sm">Report Number</FormLabel>
                <Input
                  size="sm"
                  value={formData.report.reportNo}
                  onChange={(e) =>
                    handleReportChange("reportNo", e.target.value)
                  }
                  placeholder="Enter report number"
                />
                {errors["report.reportNo"] && (
                  <FormHelperText color="red.500" fontSize="xs">
                    {errors["report.reportNo"]}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Report Details */}
              <FormControl isInvalid={!!errors["report.details"]}>
                <FormLabel fontSize="sm">Report Details</FormLabel>
                <Textarea
                  size="sm"
                  value={formData.report.details}
                  onChange={(e) =>
                    handleReportChange("details", e.target.value)
                  }
                  placeholder="Enter report details"
                  rows={3}
                />
                {errors["report.details"] && (
                  <FormHelperText color="red.500" fontSize="xs">
                    {errors["report.details"]}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Date Issued */}
              <FormControl>
                <FormLabel fontSize="sm">Date Issued</FormLabel>
                <SingleDatepicker
                  date={formData.report.date}
                  onDateChange={(date) => handleReportChange("date", date)}
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
              </FormControl>

              {/* Auditor */}
              <FormControl isInvalid={!!errors["report.auditor"]}>
                <FormLabel fontSize="sm">Auditor</FormLabel>
                <OrganizationAuditorsSelect
                  label=""
                  value={formData.report.auditor || []}
                  onChange={(users) => handleReportChange("auditor", users)}
                  placeholder="Select Auditor(s)"
                  displayMode="none"
                  organizationAuditors={organizationAuditors}
                />
                {errors["report.auditor"] && (
                  <FormHelperText color="red.500" fontSize="xs">
                    {errors["report.auditor"]}
                  </FormHelperText>
                )}
              </FormControl>

              {/* Auditee */}
              <FormControl isInvalid={!!errors["report.auditee"]}>
                <FormLabel fontSize="sm">Auditee</FormLabel>
                <TeamLeadersSelect
                  label=""
                  value={formData.report.auditee || []}
                  onChange={(users) => handleReportChange("auditee", users)}
                  placeholder="Select Auditee(s)"
                  displayMode="none"
                  team={team}
                />
                {errors["report.auditee"] && (
                  <FormHelperText color="red.500" fontSize="xs">
                    {errors["report.auditee"]}
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          </>
        )}

        {/* Action Buttons */}
        <HStack justify="flex-end" pt={2}>
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              leftIcon={<FiX />}
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            colorScheme="brandPrimary"
            leftIcon={<FiSave />}
            onClick={handleSubmit}
          >
            {mode === "edit" ? "Save Changes" : "Add Finding"}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default FindingsForm;
