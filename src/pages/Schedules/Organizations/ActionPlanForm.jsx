import {
  VStack,
  HStack,
  Box,
  Text,
  FormLabel,
  Textarea,
  Button,
  FormControl,
  FormHelperText,
  useColorModeValue,
  Divider,
  Switch,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import UserAsyncSelect from "../../../components/UserAsyncSelect";

const ActionPlanForm = ({
  initialData = null,
  onSave,
  onCancel,
  readOnly = false,
}) => {
  const bg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("blue.200", "blue.700");
  const sectionBg = useColorModeValue("white", "gray.800");

  // Initialize form data
  const getInitialFormData = () => {
    if (initialData) {
      return {
        rootCause: initialData.rootCause || "",
        owner: initialData.owner || [],
        proposedDate: initialData.proposedDate
          ? new Date(initialData.proposedDate)
          : new Date(),
        correctiveAction: initialData.correctiveAction || "",
        takenBy: initialData.takenBy || [],
        corrected: initialData.corrected || 0,
        auditor: initialData.auditor || [],
        correctedDate: initialData.correctedDate
          ? new Date(initialData.correctedDate)
          : new Date(),
        comments: initialData.comments || "",
      };
    }
    return {
      rootCause: "",
      owner: [],
      proposedDate: new Date(),
      correctiveAction: "",
      takenBy: [],
      corrected: 0,
      auditor: [],
      correctedDate: new Date(),
      comments: "",
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

  const validateForm = () => {
    const newErrors = {};

    // Root Cause Analysis validation
    if (!formData.rootCause.trim()) {
      newErrors.rootCause = "Root cause is required";
    }
    if (!formData.owner || formData.owner.length === 0) {
      newErrors.owner = "At least one owner is required";
    }

    // Corrective Action validation
    if (!formData.correctiveAction.trim()) {
      newErrors.correctiveAction = "Corrective action is required";
    }
    if (!formData.takenBy || formData.takenBy.length === 0) {
      newErrors.takenBy = "At least one person responsible is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const actionPlanData = {
        ...formData,
        proposedDate: formData.proposedDate.toISOString().split("T")[0],
        correctedDate: formData.correctedDate.toISOString().split("T")[0],
      };

      if (onSave) {
        await onSave(actionPlanData);
      }
    }
  };

  if (readOnly) {
    // Read-only display mode
    return (
      <Box
        p={4}
        bg={sectionBg}
        borderWidth={1}
        borderRadius="md"
        borderColor={borderColor}
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="sm" color="blue.600">
            Action Plan
          </Heading>

          <Divider />

          {/* Root Cause Analysis Section */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={2}>
              Root Cause Analysis
            </Text>
            <VStack align="stretch" spacing={2}>
              {formData.rootCause && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Root Cause:
                  </Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {formData.rootCause}
                  </Text>
                </Box>
              )}
              {formData.owner && formData.owner.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Owner(s):
                  </Text>
                  <Text fontSize="sm">
                    {formData.owner.map((u) => u.name).join(", ")}
                  </Text>
                </Box>
              )}
              {formData.proposedDate && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Proposed Date:
                  </Text>
                  <Text fontSize="sm">
                    {new Date(formData.proposedDate).toLocaleDateString()}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          <Divider />

          {/* Corrective Action Section */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={2}>
              Corrective Action
            </Text>
            <VStack align="stretch" spacing={2}>
              {formData.correctiveAction && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Corrective Action:
                  </Text>
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {formData.correctiveAction}
                  </Text>
                </Box>
              )}
              {formData.takenBy && formData.takenBy.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Taken By:
                  </Text>
                  <Text fontSize="sm">
                    {formData.takenBy.map((u) => u.name).join(", ")}
                  </Text>
                </Box>
              )}
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  Status:
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={formData.corrected === 1 ? "green.600" : "orange.600"}
                >
                  {formData.corrected === 1 ? "Corrected" : "Not Corrected"}
                </Text>
              </Box>
              {formData.auditor && formData.auditor.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Verified By:
                  </Text>
                  <Text fontSize="sm">
                    {formData.auditor.map((u) => u.name).join(", ")}
                  </Text>
                </Box>
              )}
              {formData.correctedDate && (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Corrected Date:
                  </Text>
                  <Text fontSize="sm">
                    {new Date(formData.correctedDate).toLocaleDateString()}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          <Divider />

          {/* Comments Section */}
          {formData.comments && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={2}>
                Comments
              </Text>
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {formData.comments}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    );
  }

  // Edit mode
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
          <Heading size="sm" color="blue.600">
            {initialData ? "Edit Action Plan" : "Add Action Plan"}
          </Heading>
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiX />}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </HStack>

        <Divider />

        {/* Phase 1: Root Cause Analysis */}
        <Box p={3} bg={sectionBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={3}>
            Phase 1: Root Cause Analysis
          </Text>

          <VStack align="stretch" spacing={3}>
            {/* Root Cause */}
            <FormControl isInvalid={errors.rootCause}>
              <FormLabel fontSize="sm">Root Cause *</FormLabel>
              <Textarea
                value={formData.rootCause}
                onChange={(e) => handleChange("rootCause", e.target.value)}
                placeholder="Describe the root cause of the non-conformity..."
                size="sm"
                rows={4}
              />
              {errors.rootCause && (
                <FormHelperText color="error.500">
                  {errors.rootCause}
                </FormHelperText>
              )}
            </FormControl>

            {/* Owner */}
            <FormControl isInvalid={errors.owner}>
              <FormLabel fontSize="sm">Owner(s) *</FormLabel>
              <UserAsyncSelect
                label=""
                value={formData.owner || []}
                onChange={(users) => handleChange("owner", users)}
                placeholder="Select owner(s) responsible for resolution"
                displayMode="none"
              />
              {errors.owner && (
                <FormHelperText color="error.500">
                  {errors.owner}
                </FormHelperText>
              )}
            </FormControl>

            {/* Proposed Date */}
            <FormControl>
              <FormLabel fontSize="sm">Proposed Completion Date *</FormLabel>
              <SingleDatepicker
                date={formData.proposedDate}
                onDateChange={(date) => handleChange("proposedDate", date)}
                propsConfigs={{
                  inputProps: {
                    size: "sm",
                  },
                }}
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Phase 2: Corrective Action */}
        <Box p={3} bg={sectionBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={3}>
            Phase 2: Corrective Action
          </Text>

          <VStack align="stretch" spacing={3}>
            {/* Corrective Action */}
            <FormControl isInvalid={errors.correctiveAction}>
              <FormLabel fontSize="sm">Corrective Action *</FormLabel>
              <Textarea
                value={formData.correctiveAction}
                onChange={(e) =>
                  handleChange("correctiveAction", e.target.value)
                }
                placeholder="Describe the corrective action taken..."
                size="sm"
                rows={4}
              />
              {errors.correctiveAction && (
                <FormHelperText color="error.500">
                  {errors.correctiveAction}
                </FormHelperText>
              )}
            </FormControl>

            {/* Taken By */}
            <FormControl isInvalid={errors.takenBy}>
              <FormLabel fontSize="sm">Taken By *</FormLabel>
              <UserAsyncSelect
                label=""
                value={formData.takenBy || []}
                onChange={(users) => handleChange("takenBy", users)}
                placeholder="Select person(s) who implemented the action"
                displayMode="none"
              />
              {errors.takenBy && (
                <FormHelperText color="error.500">
                  {errors.takenBy}
                </FormHelperText>
              )}
            </FormControl>

            {/* Corrected Status */}
            <FormControl>
              <HStack spacing={3}>
                <FormLabel fontSize="sm" mb={0}>
                  Corrected Status
                </FormLabel>
                <Switch
                  isChecked={formData.corrected === 1}
                  onChange={(e) =>
                    handleChange("corrected", e.target.checked ? 1 : 0)
                  }
                  colorScheme="green"
                />
                <Text fontSize="sm" color="gray.600">
                  {formData.corrected === 1 ? "Corrected" : "Not Corrected"}
                </Text>
              </HStack>
            </FormControl>

            {/* Auditor */}
            <FormControl>
              <FormLabel fontSize="sm">Verified By (Auditor)</FormLabel>
              <UserAsyncSelect
                label=""
                value={formData.auditor || []}
                onChange={(users) => handleChange("auditor", users)}
                placeholder="Select auditor(s) who verified the correction"
                displayMode="none"
              />
            </FormControl>

            {/* Corrected Date */}
            <FormControl>
              <FormLabel fontSize="sm">Corrected Date</FormLabel>
              <SingleDatepicker
                date={formData.correctedDate}
                onDateChange={(date) => handleChange("correctedDate", date)}
                propsConfigs={{
                  inputProps: {
                    size: "sm",
                  },
                }}
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Phase 3: Comments */}
        <Box p={3} bg={sectionBg} borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={3}>
            Phase 3: Additional Comments
          </Text>

          <FormControl>
            <FormLabel fontSize="sm">Comments</FormLabel>
            <Textarea
              value={formData.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
              placeholder="Any additional comments or notes..."
              size="sm"
              rows={3}
            />
          </FormControl>
        </Box>

        {/* Submit Button */}
        <HStack justify="flex-end">
          <Button
            leftIcon={<FiSave />}
            colorScheme="blue"
            size="sm"
            onClick={handleSubmit}
          >
            Save Action Plan
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ActionPlanForm;
