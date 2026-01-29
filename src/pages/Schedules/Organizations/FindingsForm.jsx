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
  Collapse,
  IconButton,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiSave, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import UserAsyncSelect from "../../../components/UserAsyncSelect";

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
];

const FindingsForm = ({ teamObjectives = [], onAddFinding, onCancel }) => {
  const bg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const borderColor = useColorModeValue("brandPrimary.200", "brandPrimary.700");
  const [showReportSection, setShowReportSection] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    details: "",
    objective: "",
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

  // Auto-show report section when Non-Conformity compliance type is selected
  useEffect(() => {
    if (isNonConformity(formData.compliance)) {
      setShowReportSection(true);
    }
  }, [formData.compliance]);

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
    if (!formData.objective) {
      newErrors.objective = "Objective is required";
    }
    if (!formData.compliance) {
      newErrors.compliance = "Compliance type is required";
    }

    // Validate report section if it's required for Non-Conformity OR if it's shown
    const isNCType = isNonConformity(formData.compliance);
    if (isNCType || showReportSection) {
      if (!formData.report.reportNo.trim()) {
        newErrors["report.reportNo"] = "Report number is required";
      }
      if (!formData.report.details.trim()) {
        newErrors["report.details"] = "Report details are required";
      }
      if (!formData.report.auditee) {
        newErrors["report.auditee"] = "Auditee is required";
      }
      if (!formData.report.auditor) {
        newErrors["report.auditor"] = "Auditor is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const findingData = {
        ...formData,
        report: showReportSection
          ? {
              ...formData.report,
              date: formData.report.date.toISOString().split("T")[0],
              auditee: formData.report.auditee
                ? {
                    id:
                      formData.report.auditee._id || formData.report.auditee.id,
                    _id:
                      formData.report.auditee._id || formData.report.auditee.id,
                    name: `${formData.report.auditee.firstName} ${formData.report.auditee.lastName}`,
                  }
                : null,
              auditor: formData.report.auditor
                ? {
                    id:
                      formData.report.auditor._id || formData.report.auditor.id,
                    _id:
                      formData.report.auditor._id || formData.report.auditor.id,
                    name: `${formData.report.auditor.firstName} ${formData.report.auditor.lastName}`,
                  }
                : null,
            }
          : undefined,
      };

      onAddFinding(findingData);

      // Reset form
      setFormData({
        title: "",
        details: "",
        objective: "",
        compliance: "",
        report: {
          reportNo: "",
          details: "",
          date: new Date(),
          auditee: null,
          auditor: null,
        },
      });
      setShowReportSection(false);
      setErrors({});
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
            Add New Finding
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

        {/* Objective Dropdown */}
        <FormControl isInvalid={!!errors.objective}>
          <FormLabel fontSize="sm">Objective</FormLabel>
          <Select
            size="sm"
            value={teamObjectives
              .map((obj) => ({
                value: obj._id || obj.title,
                label: obj.title,
              }))
              .find((opt) => opt.value === formData.objective)}
            onChange={(option) =>
              handleChange("objective", option?.value || "")
            }
            options={teamObjectives.map((obj) => ({
              value: obj._id || obj.title,
              label: obj.title,
            }))}
            placeholder="Select an objective"
            isClearable
            useBasicStyles
          />
          {errors.objective && (
            <FormHelperText color="red.500" fontSize="xs">
              {errors.objective}
            </FormHelperText>
          )}
        </FormControl>

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

        <Divider />

        {/* Report Section Toggle */}
        <HStack justify="space-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // Prevent hiding if it's a Non-Conformity type (required)
              if (!isNonConformity(formData.compliance)) {
                setShowReportSection(!showReportSection);
              }
            }}
            rightIcon={showReportSection ? <FiChevronUp /> : <FiChevronDown />}
            isDisabled={isNonConformity(formData.compliance) && showReportSection}
          >
            {showReportSection ? "Hide" : "Add"} Report Details
          </Button>
          {isNonConformity(formData.compliance) && (
            <Text fontSize="xs" color="red.500" fontWeight="medium">
              * Required for Non-Conformity
            </Text>
          )}
        </HStack>

        {/* Report Section */}
        <Collapse in={showReportSection} animateOpacity>
          <VStack align="stretch" spacing={4} pt={2}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Report Information
            </Text>

            {/* Report Number */}
            <FormControl isInvalid={!!errors["report.reportNo"]}>
              <FormLabel fontSize="sm">Report Number</FormLabel>
              <Input
                size="sm"
                value={formData.report.reportNo}
                onChange={(e) => handleReportChange("reportNo", e.target.value)}
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
                onChange={(e) => handleReportChange("details", e.target.value)}
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
              />
            </FormControl>

            {/* Auditee */}
            <FormControl isInvalid={!!errors["report.auditee"]}>
              <FormLabel fontSize="sm">Auditee</FormLabel>
              <UserAsyncSelect
                label=""
                value={formData.report.auditee ? [formData.report.auditee] : []}
                onChange={(users) =>
                  handleReportChange("auditee", users[0] || null)
                }
                isMulti={false}
                placeholder="Select Auditee"
              />
              {errors["report.auditee"] && (
                <FormHelperText color="red.500" fontSize="xs">
                  {errors["report.auditee"]}
                </FormHelperText>
              )}
            </FormControl>

            {/* Auditor */}
            <FormControl isInvalid={!!errors["report.auditor"]}>
              <FormLabel fontSize="sm">Auditor</FormLabel>
              <UserAsyncSelect
                label=""
                value={formData.report.auditor ? [formData.report.auditor] : []}
                onChange={(users) =>
                  handleReportChange("auditor", users[0] || null)
                }
                isMulti={false}
                placeholder="Select Auditor"
              />
              {errors["report.auditor"] && (
                <FormHelperText color="red.500" fontSize="xs">
                  {errors["report.auditor"]}
                </FormHelperText>
              )}
            </FormControl>
          </VStack>
        </Collapse>

        {/* Action Buttons */}
        <HStack justify="flex-end" pt={2}>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            colorScheme="brandPrimary"
            leftIcon={<FiSave />}
            onClick={handleSubmit}
          >
            Add Finding
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default FindingsForm;
