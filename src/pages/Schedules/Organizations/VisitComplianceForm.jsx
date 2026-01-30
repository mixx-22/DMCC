import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  Badge,
  Avatar,
  Tooltip,
  Card,
  CardBody,
  Wrap,
  WrapItem,
  Divider,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState, useEffect } from "react";
import { FiSave, FiX, FiEdit } from "react-icons/fi";
import moment from "moment";
import { useUser } from "../../../context/_useContext";

// Compliance options matching FindingsForm
const COMPLIANCE_OPTIONS = [
  {
    value: "OBSERVATIONS",
    label: "OBSERVATIONS",
  },
  {
    value: "OPPORTUNITIES_FOR_IMPROVEMENTS",
    label: "OPPORTUNITIES FOR IMPROVEMENTS",
  },
  {
    value: "MINOR_NC",
    label: "MINOR NON-CONFORMITY",
  },
  {
    value: "MAJOR_NC",
    label: "MAJOR NON-CONFORMITY",
  },
  {
    value: "COMPLIANT",
    label: "COMPLIANT",
  },
];

const COMPLIANCE_DISPLAY = {
  OBSERVATIONS: { label: "OBSERVATIONS", color: "blue" },
  OPPORTUNITIES_FOR_IMPROVEMENTS: {
    label: "OPPORTUNITIES FOR IMPROVEMENTS",
    color: "yellow",
  },
  MINOR_NC: { label: "MINOR NON-CONFORMITY", color: "orange" },
  MAJOR_NC: { label: "MAJOR NON-CONFORMITY", color: "red" },
  COMPLIANT: { label: "COMPLIANT", color: "green" },
};

const VisitComplianceForm = ({ visit, onSave, onCancel, readOnly = false }) => {
  const bg = useColorModeValue("green.50", "green.900");
  const borderColor = useColorModeValue("green.200", "green.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  
  // Get current user from context
  const { user: currentUser } = useUser();

  const getInitialFormData = () => {
    // If editing existing compliance, use existing user
    // Otherwise, auto-populate with current logged-in user
    const defaultUser = currentUser ? [{
      _id: currentUser._id || currentUser.id,
      id: currentUser._id || currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
    }] : [];
    
    return {
      compliance: visit?.compliance || "",
      complianceUser: visit?.complianceUser || defaultUser,
      complianceSetAt: visit?.complianceSetAt || null,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(getInitialFormData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.compliance) {
      newErrors.compliance = "Compliance status is required";
    }

    // User is auto-populated from context, but check just in case
    if (!formData.complianceUser || formData.complianceUser.length === 0) {
      newErrors.complianceUser = "User information is missing";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const complianceData = {
      compliance: formData.compliance,
      complianceUser: formData.complianceUser,
      complianceSetAt: new Date().toISOString(),
    };

    onSave(complianceData);
  };

  // Read-only display mode
  if (readOnly && visit?.compliance) {
    const complianceInfo = COMPLIANCE_DISPLAY[visit.compliance] || {
      label: visit.compliance,
      color: "gray",
    };

    return (
      <Card variant="outline" borderColor={borderColor} bg={bg} shadow="none">
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="semibold" color={labelColor}>
                Visit Compliance Status
              </Text>
              <Button
                size="sm"
                leftIcon={<FiEdit />}
                onClick={onCancel}
                variant="ghost"
                colorScheme="green"
              >
                Edit
              </Button>
            </HStack>

            <Divider />

            {/* Compliance Status */}
            <Box>
              <Text fontSize="xs" color={labelColor} mb={1}>
                Status:
              </Text>
              <Badge
                colorScheme={complianceInfo.color}
                fontSize="sm"
                px={3}
                py={1}
              >
                {complianceInfo.label}
              </Badge>
            </Box>

            {/* Set By */}
            {visit.complianceUser && visit.complianceUser.length > 0 && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={1}>
                  Set By:
                </Text>
                <Wrap spacing={1}>
                  {visit.complianceUser.map((user, idx) => (
                    <WrapItem key={`user-${user._id || user.id}-${idx}`}>
                      <Tooltip label={`${user.firstName} ${user.lastName}`}>
                        <Card variant="filled" shadow="none">
                          <CardBody px={2} py={1}>
                            <HStack spacing={1}>
                              <Avatar
                                size="xs"
                                name={`${user.firstName} ${user.lastName}`}
                              />
                              <Text fontSize="sm">
                                {user.firstName} {user.lastName}
                              </Text>
                            </HStack>
                          </CardBody>
                        </Card>
                      </Tooltip>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            {/* Set At */}
            {visit.complianceSetAt && (
              <Box>
                <Text fontSize="xs" color={labelColor} mb={1}>
                  Set On:
                </Text>
                <Text fontSize="sm">
                  {moment(visit.complianceSetAt).format(
                    "MMMM DD, YYYY [at] h:mm A",
                  )}
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // Edit form mode
  return (
    <Card variant="outline" borderColor={borderColor} bg={bg} shadow="none">
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color={labelColor}>
              Set Visit Compliance Status
            </Text>
            <Button
              size="sm"
              leftIcon={<FiX />}
              onClick={onCancel}
              variant="ghost"
              colorScheme="gray"
            >
              Cancel
            </Button>
          </HStack>

          <Divider />

          {/* Compliance Selection */}
          <FormControl isInvalid={!!errors.compliance}>
            <FormLabel fontSize="sm">Compliance Status *</FormLabel>
            <Select
              options={COMPLIANCE_OPTIONS}
              value={COMPLIANCE_OPTIONS.find(
                (opt) => opt.value === formData.compliance,
              )}
              onChange={(option) =>
                handleChange("compliance", option?.value || "")
              }
              placeholder="Select compliance status"
              colorScheme="green"
              size="sm"
            />
            {errors.compliance && (
              <Text fontSize="xs" color="red.500" mt={1}>
                {errors.compliance}
              </Text>
            )}
          </FormControl>

          {/* Current User Display (Auto-populated) */}
          <Box>
            <Text fontSize="sm" color={labelColor} mb={2}>
              Set By:
            </Text>
            {formData.complianceUser && formData.complianceUser.length > 0 ? (
              <Wrap spacing={1}>
                {formData.complianceUser.map((user, idx) => (
                  <WrapItem key={`user-${user._id || user.id}-${idx}`}>
                    <Card variant="filled" shadow="none" bg="green.100">
                      <CardBody px={2} py={1}>
                        <HStack spacing={1}>
                          <Avatar
                            size="xs"
                            name={`${user.firstName} ${user.lastName}`}
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Text>
                        </HStack>
                      </CardBody>
                    </Card>
                  </WrapItem>
                ))}
              </Wrap>
            ) : (
              <Text fontSize="sm" color="red.500">
                Current user not available
              </Text>
            )}
            <Text fontSize="xs" color={labelColor} mt={1}>
              Automatically set to current logged-in user
            </Text>
          </Box>

          {/* Action Buttons */}
          <HStack justify="flex-end" spacing={2}>
            <Button
              size="sm"
              leftIcon={<FiX />}
              onClick={onCancel}
              variant="outline"
              colorScheme="gray"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon={<FiSave />}
              onClick={handleSubmit}
              colorScheme="green"
            >
              Save Compliance Status
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default VisitComplianceForm;
