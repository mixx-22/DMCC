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
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import UserAsyncSelect from "../../../components/UserAsyncSelect";
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
];

const FindingsForm = ({ teamObjectives = [], initialData = null, mode = "add", onAddFinding, onCancel }) => {
  const bg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const borderColor = useColorModeValue("brandPrimary.200", "brandPrimary.700");
  const { pageRef } = useLayout();

  // Initialize form data based on mode
  const getInitialFormData = () => {
    if (mode === "edit" && initialData) {
      return {
        _id: initialData._id,
        title: initialData.title || "",
        details: initialData.details || "",
        objective: initialData.objective || "",
        compliance: initialData.compliance || "",
        report: initialData.report ? {
          reportNo: initialData.report.reportNo || "",
          details: initialData.report.details || "",
          date: initialData.report.date ? new Date(initialData.report.date) : new Date(),
          auditee: initialData.report.auditee || null,
          auditor: initialData.report.auditor || null,
        } : {
          reportNo: "",
          details: "",
          date: new Date(),
          auditee: null,
          auditor: null,
        },
      };
    }
    return {
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
    if (!formData.objective) {
      newErrors.objective = "Objective is required";
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

  // Generate unique client-side ID for finding
  const generateFindingId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `finding-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const findingData = {
        _id: generateFindingId(), // Client-side ID for tracking
        id: generateFindingId(), // Backup ID field
        ...formData,
        createdAt: new Date().toISOString(), // Timestamp for ordering
        report: isNonConformity(formData.compliance)
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
                    employeeId: formData.report.auditee?.employeeId,
                  }
                : null,
              auditor: formData.report.auditor
                ? {
                    id:
                      formData.report.auditor._id || formData.report.auditor.id,
                    _id:
                      formData.report.auditor._id || formData.report.auditor.id,
                    name: `${formData.report.auditor.firstName} ${formData.report.auditor.lastName}`,
                    employeeId: formData.report.auditor?.employeeId,
                  }
                : null,
            }
          : undefined,
      };

      try {
        await onAddFinding(findingData);

        // Reset form only on successful add
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
        setErrors({});
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

              {/* Auditee */}
              <FormControl isInvalid={!!errors["report.auditee"]}>
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
                  <FormHelperText color="red.500" fontSize="xs">
                    {errors["report.auditor"]}
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          </>
        )}

        {/* Action Buttons */}
        <HStack justify="flex-end" pt={2}>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel} leftIcon={<FiX />}>
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
