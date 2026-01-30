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
  Switch,
  Heading,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { useLayout } from "../../../context/_useContext";
import moment from "moment";

const VerificationForm = ({
  initialData = null,
  onSave,
  onCancel,
  readOnly = false,
}) => {
  const bg = useColorModeValue("green.50", "green.900");
  const borderColor = useColorModeValue("green.200", "green.700");
  const sectionBg = useColorModeValue("white", "gray.800");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const { pageRef } = useLayout();

  // Initialize form data
  const getInitialFormData = () => {
    if (initialData) {
      return {
        corrected: initialData.corrected !== undefined ? initialData.corrected : -1,
        correctionDate: initialData.correctionDate
          ? new Date(initialData.correctionDate)
          : new Date(),
        remarks: initialData.remarks || "",
      };
    }
    return {
      corrected: -1,
      correctionDate: new Date(),
      remarks: "",
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

    // Validation is optional - no required fields for verification
    // Users can save partial verification data

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const verificationData = {
        corrected: formData.corrected,
        correctionDate: formData.correctionDate
          ? formData.correctionDate.toISOString().split("T")[0]
          : null,
        remarks: formData.remarks,
      };

      if (onSave) {
        await onSave(verificationData);
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
          <HStack justify="space-between">
            <Heading size="sm" color="green.600">
              Verification
            </Heading>
            <Badge colorScheme={formData.corrected === 2 ? "green" : formData.corrected === 0 ? "red" : "orange"}>
              {formData.corrected === 2 ? "Corrected" : formData.corrected === 0 ? "Not Corrected" : "Pending"}
            </Badge>
          </HStack>

          <VStack align="stretch" spacing={3}>
            <Box>
              <Text fontSize="xs" color={labelColor} mb={1}>
                Status:
              </Text>
              <Badge
                colorScheme={formData.corrected === 2 ? "green" : formData.corrected === 0 ? "red" : "orange"}
                fontSize="sm"
              >
                {formData.corrected === 2 ? "Corrected" : formData.corrected === 0 ? "Not Corrected" : "Pending Verification"}
              </Badge>
            </Box>

            {formData.correctionDate && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={1}>
                  Correction Date:
                </Text>
                <Text fontSize="sm">
                  {moment(formData.correctionDate).format("MMMM DD, YYYY")}
                </Text>
              </Box>
            )}

            {formData.remarks && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={1}>
                  Remarks:
                </Text>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {formData.remarks}
                </Text>
              </Box>
            )}
          </VStack>
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
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <Text fontWeight="semibold" fontSize="md" color="green.700">
            Verification
          </Text>
          {onCancel && (
            <Button
              size="xs"
              leftIcon={<FiX />}
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.600">
          Verify if the corrective action has been implemented and the finding
          is now compliant.
        </Text>

        {/* Verification Form */}
        <VStack align="stretch" spacing={4}>
          {/* Corrected Status */}
          <FormControl>
            <HStack spacing={3}>
              <FormLabel fontSize="sm" mb={0}>
                Corrected Status
              </FormLabel>
              <Switch
                isChecked={formData.corrected === 2}
                onChange={(e) =>
                  handleChange("corrected", e.target.checked ? 2 : 0)
                }
                colorScheme="green"
              />
              <Text fontSize="sm" fontWeight="medium" color={formData.corrected === 2 ? "green.600" : formData.corrected === 0 ? "red.600" : "orange.600"}>
                {formData.corrected === 2 ? "Corrected" : formData.corrected === 0 ? "Not Corrected" : "Pending"}
              </Text>
            </HStack>
            <FormHelperText>
              {formData.corrected === 2 
                ? "✓ Finding will be marked as COMPLIANT" 
                : formData.corrected === 0
                  ? "✗ Finding verified as not corrected"
                  : "⚠ Verification pending - use switch to mark as corrected or not corrected"}
            </FormHelperText>
          </FormControl>

          {/* Correction Date */}
          <FormControl>
            <FormLabel fontSize="sm">Correction Date</FormLabel>
            <SingleDatepicker
              date={formData.correctionDate}
              onDateChange={(date) => handleChange("correctionDate", date)}
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
            <FormHelperText>
              Date when the corrective action was completed
            </FormHelperText>
          </FormControl>

          {/* Remarks */}
          <FormControl>
            <FormLabel fontSize="sm">Remarks</FormLabel>
            <Textarea
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              placeholder="Add any verification notes, observations, or comments..."
              size="sm"
              rows={4}
            />
            <FormHelperText>
              Optional: Add notes about the verification or any additional
              observations
            </FormHelperText>
          </FormControl>
        </VStack>

        {/* Submit Button */}
        <HStack justify="flex-end">
          <Button
            leftIcon={<FiSave />}
            colorScheme="green"
            size="sm"
            onClick={handleSubmit}
          >
            Save Verification
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default VerificationForm;
