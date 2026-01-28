import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  IconButton,
  CardBody,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Textarea,
  Select,
  HStack,
  FormHelperText,
  Badge,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepSeparator,
  useSteps,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import { useScheduleProfile } from "../../context/_useContext";
import { getAuditTypeLabel } from "../../utils/auditHelpers";

const SchedulePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    schedule,
    initialScheduleData,
    loading,
    saving,
    updateSchedule,
    createSchedule,
    deleteSchedule,
  } = useScheduleProfile();
  const errorColor = useColorModeValue("error.600", "error.400");
  const summaryCardBg = useColorModeValue("gray.50", "gray.700");

  const isNewSchedule = id === "new";
  const [formData, setFormData] = useState(initialScheduleData);
  const [validationErrors, setValidationErrors] = useState({});

  const steps = [
    { title: "Basic Information", fields: ["title", "description"] },
    {
      title: "Audit Details",
      fields: ["auditCode", "auditType", "standard"],
    },
    { title: "Review", fields: [] },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  useEffect(() => {
    if (schedule && !isNewSchedule) {
      setFormData({
        ...initialScheduleData,
        ...schedule,
      });
    }
  }, [schedule, isNewSchedule, initialScheduleData]);

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

  const validateStep = (step) => {
    const errors = {};
    const currentFields = steps[step]?.fields || [];

    currentFields.forEach((field) => {
      if (field === "title" && !formData.title.trim()) {
        errors.title = "Title is required";
      }
      if (field === "description" && !formData.description.trim()) {
        errors.description = "Description is required";
      }
      if (field === "auditCode" && !formData.auditCode.trim()) {
        errors.auditCode = "Audit code is required";
      }
      if (field === "auditType" && !formData.auditType) {
        errors.auditType = "Audit type is required";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      if (isNewSchedule) {
        const result = await createSchedule(formData);
        toast.success("Schedule Created", {
          description: `"${formData.title}" has been successfully created`,
          duration: 3000,
        });
        if (result?.id || result?._id) {
          navigate(`/schedules/${result.id || result._id}`, { replace: true });
        } else {
          navigate("/schedules");
        }
      } else {
        await updateSchedule(id, formData);
        toast.success("Schedule Updated", {
          description: `"${formData.title}" has been successfully updated`,
          duration: 3000,
        });
        navigate("/schedules");
      }
    } catch (error) {
      toast.error("Operation Failed", {
        description: error.message || "An error occurred. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Schedule?",
      text: `Are you sure you want to delete "${formData.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteSchedule(id);
        toast.success("Schedule Deleted", {
          description: `"${formData.title}" has been deleted`,
          duration: 3000,
        });
        navigate("/schedules");
      } catch (error) {
        toast.error("Delete Failed", {
          description: error.message || "Failed to delete schedule",
          duration: 3000,
        });
      }
    }
  };

  const handleCancel = () => {
    navigate("/schedules");
  };

  if (loading) {
    return (
      <Box>
        <PageHeader>
          <Heading variant="pageTitle">
            {isNewSchedule ? "Create Schedule" : "Schedule Details"}
          </Heading>
        </PageHeader>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brandPrimary.500" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <HStack>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={handleCancel}
              aria-label="Back to schedules"
              variant="ghost"
            />
            <Heading variant="pageTitle">
              {isNewSchedule ? "Create New Schedule" : formData.title}
            </Heading>
          </HStack>
          {!isNewSchedule && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                aria-label="More options"
              />
              <MenuList>
                <MenuItem
                  icon={<FiTrash2 />}
                  onClick={handleDelete}
                  color={errorColor}
                >
                  Delete Schedule
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </PageHeader>

      {isNewSchedule && (
        <Stepper index={activeStep} colorScheme="brandPrimary" mb={6}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      )}

      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <>
                <Heading size="md" mb={2}>
                  Basic Information
                </Heading>
                <FormControl isRequired isInvalid={!!validationErrors.title}>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="e.g., Annual Financial Audit 2024"
                  />
                  <FormErrorMessage>{validationErrors.title}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={!!validationErrors.description}
                >
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Describe the purpose and scope of this audit"
                    rows={5}
                  />
                  <FormErrorMessage>
                    {validationErrors.description}
                  </FormErrorMessage>
                </FormControl>
              </>
            )}

            {/* Step 2: Audit Details */}
            {activeStep === 1 && (
              <>
                <Heading size="md" mb={2}>
                  Audit Details
                </Heading>
                <FormControl
                  isRequired
                  isInvalid={!!validationErrors.auditCode}
                >
                  <FormLabel>Audit Code</FormLabel>
                  <Input
                    value={formData.auditCode}
                    onChange={(e) =>
                      handleFieldChange("auditCode", e.target.value)
                    }
                    placeholder="e.g., AUD-2024-001"
                  />
                  <FormHelperText>
                    Unique identifier for this audit schedule
                  </FormHelperText>
                  <FormErrorMessage>
                    {validationErrors.auditCode}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={!!validationErrors.auditType}
                >
                  <FormLabel>Audit Type</FormLabel>
                  <Select
                    value={formData.auditType}
                    onChange={(e) =>
                      handleFieldChange("auditType", e.target.value)
                    }
                    placeholder="Select audit type"
                  >
                    <option value="internal">Internal Audit</option>
                    <option value="external">External Audit</option>
                    <option value="compliance">Compliance Audit</option>
                    <option value="financial">Financial Audit</option>
                    <option value="operational">Operational Audit</option>
                  </Select>
                  <FormErrorMessage>
                    {validationErrors.auditType}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Standard</FormLabel>
                  <Input
                    value={formData.standard}
                    onChange={(e) =>
                      handleFieldChange("standard", e.target.value)
                    }
                    placeholder="e.g., ISO 9001, SOX, ISO 27001"
                  />
                  <FormHelperText>
                    The audit standard or framework being followed (optional)
                  </FormHelperText>
                </FormControl>
              </>
            )}

            {/* Step 3: Review */}
            {activeStep === 2 && (
              <>
                <Heading size="md" mb={2}>
                  Review
                </Heading>

                {/* Summary Card */}
                <Box
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg={summaryCardBg}
                >
                  <Text fontWeight="bold" mb={3}>
                    Review Your Schedule
                  </Text>
                  <VStack align="stretch" spacing={2} fontSize="sm">
                    <HStack>
                      <Text fontWeight="semibold" minW="120px">
                        Title:
                      </Text>
                      <Text>{formData.title || "-"}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold" minW="120px">
                        Audit Code:
                      </Text>
                      <Text>{formData.auditCode || "-"}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold" minW="120px">
                        Type:
                      </Text>
                      <Text>
                        {formData.auditType
                          ? getAuditTypeLabel(formData.auditType)
                          : "-"}
                      </Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold" minW="120px">
                        Standard:
                      </Text>
                      <Text>{formData.standard || "-"}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold" minW="120px">
                        Status:
                      </Text>
                      {formData.status === 1 ? (
                        <Badge colorScheme="green">Closed</Badge>
                      ) : (
                        <Badge colorScheme="blue">Ongoing</Badge>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>

      <PageFooter>
        <Flex justify="space-between" w="full">
          <Button variant="ghost" onClick={handleCancel} leftIcon={<FiX />}>
            Cancel
          </Button>
          <HStack>
            {isNewSchedule && activeStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                leftIcon={<FiChevronLeft />}
              >
                Previous
              </Button>
            )}
            {isNewSchedule && activeStep < steps.length - 1 ? (
              <Button
                colorScheme="brandPrimary"
                onClick={handleNext}
                rightIcon={<FiChevronRight />}
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme="brandPrimary"
                onClick={handleSubmit}
                isLoading={saving}
                leftIcon={<FiSave />}
              >
                {isNewSchedule ? "Create Schedule" : "Save Changes"}
              </Button>
            )}
          </HStack>
        </Flex>
      </PageFooter>
    </Box>
  );
};

export default SchedulePage;
