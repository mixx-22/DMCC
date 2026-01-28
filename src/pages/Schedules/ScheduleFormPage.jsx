import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  IconButton,
  CardBody,
  Card,
  Flex,
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
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import ScheduleSkeleton from "../../components/ScheduleSkeleton";
import { useScheduleProfile } from "../../context/_useContext";
import { getAuditTypeLabel } from "../../utils/auditHelpers";

const ScheduleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    schedule,
    initialScheduleData,
    loading,
    saving,
    updateSchedule,
    createSchedule,
  } = useScheduleProfile();

  const summaryCardBg = useColorModeValue("gray.50", "gray.700");

  const isNewSchedule = id === "new";
  const isEditMode = id && id !== "new";
  
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
    if (schedule && isEditMode) {
      setFormData({
        ...initialScheduleData,
        ...schedule,
      });
    }
  }, [schedule, isEditMode, initialScheduleData]);

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

  const validateAllFields = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.auditCode.trim()) {
      errors.auditCode = "Audit code is required";
    }
    if (!formData.auditType) {
      errors.auditType = "Audit type is required";
    }

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
    // For new schedules with stepper, validate current step
    if (isNewSchedule && activeStep < steps.length - 1) {
      if (!validateStep(activeStep)) {
        return;
      }
    }

    // For edit mode or final step, validate all fields
    if (!validateAllFields()) {
      return;
    }

    try {
      if (isNewSchedule) {
        const result = await createSchedule(formData);
        toast.success("Audit Schedule Created", {
          description: `"${formData.title}" has been successfully created`,
          duration: 3000,
        });
        if (result?.id || result?._id) {
          navigate(`/audit-schedule/${result.id || result._id}`, { replace: true });
        } else {
          navigate("/audit-schedules");
        }
      } else {
        await updateSchedule(id, formData);
        toast.success("Audit Schedule Updated", {
          description: `"${formData.title}" has been successfully updated`,
          duration: 3000,
        });
        navigate(`/audit-schedule/${id}`);
      }
    } catch (error) {
      toast.error("Operation Failed", {
        description: error.message || "An error occurred. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/audit-schedule/${id}`);
    } else {
      navigate("/audit-schedules");
    }
  };

  if (loading && isEditMode) {
    return <ScheduleSkeleton />;
  }

  const pageTitle = isNewSchedule
    ? "Create New Audit Schedule"
    : "Edit Audit Schedule";

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <HStack>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={handleCancel}
              aria-label={isEditMode ? "Back to schedule" : "Back to schedules"}
              variant="ghost"
            />
            <Heading variant="pageTitle">{pageTitle}</Heading>
          </HStack>
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
            {/* For edit mode, show all fields at once */}
            {isEditMode && (
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

                <Heading size="md" mb={2} mt={4}>
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

            {/* For new schedules, show step-by-step with stepper */}
            {isNewSchedule && (
              <>
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
                        Review Your Audit Schedule
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
                {isNewSchedule ? "Create Audit Schedule" : "Save Changes"}
              </Button>
            )}
          </HStack>
        </Flex>
      </PageFooter>
    </Box>
  );
};

export default ScheduleFormPage;
