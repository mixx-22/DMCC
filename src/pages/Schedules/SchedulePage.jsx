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
  Divider,
  Stack,
  Editable,
  EditableTextarea,
  EditablePreview,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiChevronRight,
  FiChevronLeft,
  FiEdit,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import {
  useScheduleProfile,
  useOrganizations,
} from "../../context/_useContext";
import { getAuditTypeLabel } from "../../utils/auditHelpers";
import { validateAuditScheduleClosure } from "../../utils/helpers";
import EditAuditDetailsModal from "./EditAuditDetailsModal";
import CloseAuditModal from "./CloseAuditModal";
import { OrganizationsProvider } from "../../context/OrganizationsContext";
import Timestamp from "../../components/Timestamp";
import Organizations from "./Organizations";

// Inner component that uses organizations context
const SchedulePageContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    schedule,
    initialScheduleData,
    loading,
    updateSchedule,
    createSchedule,
    deleteSchedule,
  } = useScheduleProfile();
  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);

  // Get organizations from context
  const { organizations } = useOrganizations();

  const errorColor = useColorModeValue("error.600", "error.400");
  const summaryCardBg = useColorModeValue("gray.50", "gray.700");

  const isNewSchedule = id === "new";
  const [formData, setFormData] = useState(initialScheduleData);
  const [validationErrors, setValidationErrors] = useState({});
  const titleTextareaRef = useRef(null);
  const descriptionTextareaRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // Modal state for editing audit details
  const {
    isOpen: isEditDetailsOpen,
    onOpen: onEditDetailsOpen,
    onClose: onEditDetailsClose,
  } = useDisclosure();

  // Modal state for closing audit
  const {
    isOpen: isCloseAuditOpen,
    onOpen: onCloseAuditOpen,
    onClose: onCloseAuditClose,
  } = useDisclosure();

  const [isClosingAudit, setIsClosingAudit] = useState(false);

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
      // Don't force re-render on every update - only on initial load
      // Editable components will update naturally via formData changes
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
        if (result?.id || result?._id) {
          navigate(`/audit-schedule/${result.id || result._id}`, {
            replace: true,
          });
        } else {
          navigate("/audit-schedules");
        }
      } else {
        await updateSchedule(id, formData);
        // Stay on current page - context is already updated
      }
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to save schedule:", error);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Schedule?",
      text: `Are you sure you want to delete "${formData.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "danger",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteSchedule(id, formData.title);
        navigate("/audit-schedules");
      } catch (error) {
        // Error toast is handled by context
        console.error("Failed to delete schedule:", error);
      }
    }
  };

  const handleCancel = () => {
    navigate("/audit-schedules");
  };

  // Helper function to build update payload with only business fields
  const buildUpdatePayload = (overrides = {}) => {
    return {
      title: formData.title,
      description: formData.description,
      auditCode: formData.auditCode,
      auditType: formData.auditType,
      standard: formData.standard,
      status: formData.status,
      ...overrides,
    };
  };

  const handleTitleBlur = async (newTitle) => {
    const trimmedTitle = newTitle?.trim();

    if (!trimmedTitle) {
      // Title cannot be empty - will revert via schedule key
      return;
    }

    if (trimmedTitle === formData?.title) {
      return;
    }

    // Cancel any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    try {
      const updatePayload = buildUpdatePayload({ title: trimmedTitle });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to update title:", error);
      // Editable will revert via schedule key
    }
  };

  const handleDescriptionBlur = async (newDescription) => {
    const trimmedDescription = newDescription?.trim() || "";

    if (trimmedDescription === (formData?.description?.trim() || "")) {
      return;
    }

    // Cancel any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    try {
      const updatePayload = buildUpdatePayload({
        description: trimmedDescription,
      });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to update description:", error);
      // Editable will revert via schedule key
    }
  };

  const handleSaveAuditDetails = async (detailsData) => {
    try {
      const updatePayload = buildUpdatePayload({
        auditCode: detailsData.auditCode,
        auditType: detailsData.auditType,
        standard: detailsData.standard,
        previousAudit: detailsData.previousAudit,
      });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
      onEditDetailsClose();
    } catch (error) {
      // Error toast is handled by context
      console.error("Failed to update audit details:", error);
      // Don't close modal on error so user can retry
    }
  };

  const handleCloseAudit = async () => {
    setIsClosingAudit(true);
    try {
      const updatePayload = buildUpdatePayload({ status: 1 });
      const updatedSchedule = await updateSchedule(id, updatePayload);
      setFormData((prev) => ({ ...prev, ...updatedSchedule }));
      onCloseAuditClose();
    } catch (error) {
      console.error("Failed to close audit schedule:", error);
    } finally {
      setIsClosingAudit(false);
    }
  };

  const handleReopenAudit = async () => {
    const result = await Swal.fire({
      title: "Reopen Audit Schedule?",
      text: "This will set the audit schedule status back to Ongoing.",
      icon: "question",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: "Yes, reopen it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "warning inverted",
      },
    });

    if (result.isConfirmed) {
      try {
        const updatePayload = buildUpdatePayload({ status: 0 });
        const updatedSchedule = await updateSchedule(id, updatePayload);
        setFormData((prev) => ({ ...prev, ...updatedSchedule }));
      } catch (error) {
        console.error("Failed to reopen audit schedule:", error);
      }
    }
  };

  // Validate if audit can be closed
  const auditValidation = validateAuditScheduleClosure(organizations);

  if (loading) {
    return (
      <Box>
        <PageHeader>
          <Heading variant="pageTitle">
            {isNewSchedule ? "Create Audit Schedule" : "Schedule Details"}
          </Heading>
        </PageHeader>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brandPrimary.500" />
        </Flex>
      </Box>
    );
  }

  // Render multi-step form for new schedules
  if (isNewSchedule) {
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
              <Heading variant="pageTitle">Create New Schedule</Heading>
            </HStack>
          </Flex>
        </PageHeader>

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
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      placeholder="e.g., Annual Financial Audit 2024"
                    />
                    <FormErrorMessage>
                      {validationErrors.title}
                    </FormErrorMessage>
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
                          <Badge colorScheme="warning">Ongoing</Badge>
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
              {activeStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  leftIcon={<FiChevronLeft />}
                >
                  Previous
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
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
                  isLoading={loading}
                  leftIcon={<FiSave />}
                >
                  Create Audit Schedule
                </Button>
              )}
            </HStack>
          </Flex>
        </PageFooter>
      </Box>
    );
  }

  // Render folder-like layout for existing schedules
  return (
    <>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <HStack>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={handleCancel}
              aria-label="Back to schedules"
              variant="ghost"
            />
            <Heading variant="pageTitle">{formData.title}</Heading>
          </HStack>
        </Flex>
      </PageHeader>

      <Box flex="1">
        <Flex
          gap={4}
          maxW="container.xl"
          flexDir={{ base: "column", lg: "row" }}
        >
          {/* Left Column - Main Audit Information */}
          <Stack spacing={4} w="full" maxW={{ base: "unset", lg: "xs" }}>
            {/* Main Audit Info Card */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Editable
                    isDisabled={!isScheduleOngoing}
                    key={`title-${schedule?.id || schedule?._id}`}
                    defaultValue={schedule?.title || "Untitled"}
                    onSubmit={handleTitleBlur}
                    fontSize="2xl"
                    fontWeight="bold"
                    w="full"
                    isPreviewFocusable={true}
                    submitOnBlur={true}
                    selectAllOnFocus={false}
                  >
                    <EditablePreview
                      w="full"
                      borderRadius="md"
                      _hover={{
                        background: "gray.100",
                        cursor: "pointer",
                      }}
                    />
                    <EditableTextarea
                      ref={titleTextareaRef}
                      py={2}
                      px={2}
                      resize="vertical"
                      minH="auto"
                      rows={1}
                      onFocus={(e) => {
                        // Auto-resize on focus
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onInput={(e) => {
                        // Continue resizing as user types
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </Editable>

                  <HStack mt={-4}>
                    {formData.status === 1 ? (
                      <Badge colorScheme="green">Closed</Badge>
                    ) : (
                      <Badge colorScheme="warning">Ongoing</Badge>
                    )}
                  </HStack>

                  <Divider />

                  {/* Editable Description */}
                  <Editable
                    w="full"
                    isDisabled={!isScheduleOngoing}
                    key={`description-${schedule?.id || schedule?._id}`}
                    defaultValue={schedule?.description || ""}
                    onSubmit={handleDescriptionBlur}
                    placeholder="Add a description..."
                    isPreviewFocusable={true}
                    submitOnBlur={true}
                    selectAllOnFocus={false}
                  >
                    <EditablePreview
                      py={2}
                      w="full"
                      borderRadius="md"
                      color={schedule?.description ? "gray.700" : "gray.400"}
                      _hover={{
                        background: "gray.100",
                        cursor: "pointer",
                      }}
                    />
                    <EditableTextarea
                      ref={descriptionTextareaRef}
                      py={2}
                      px={2}
                      minH="60px"
                      resize="vertical"
                      onFocus={(e) => {
                        // Auto-resize on focus
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onInput={(e) => {
                        // Continue resizing as user types
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </Editable>

                  <Divider />

                  {/* Timestamps */}
                  <HStack>
                    {formData?.createdAt && (
                      <Box flex={1}>
                        <Text fontSize="sm" color="gray.600">
                          Created At
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          <Timestamp date={formData.createdAt} />
                        </Text>
                      </Box>
                    )}

                    {formData?.updatedAt && (
                      <Box flex={1}>
                        <Text fontSize="sm" color="gray.600">
                          Last Modified
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          <Timestamp date={formData.updatedAt} />
                        </Text>
                      </Box>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Audit Details Card */}
            <Card>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="semibold">Audit Details</Text>
                  {isScheduleOngoing && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="brandPrimary"
                      leftIcon={<FiEdit />}
                      onClick={onEditDetailsOpen}
                    >
                      Edit
                    </Button>
                  )}
                </Flex>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Audit Code
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.auditCode || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Type
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.auditType
                        ? getAuditTypeLabel(formData.auditType)
                        : "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Standard
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.standard || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Previous Audit
                    </Text>
                    <Text fontSize="sm" mt={1} fontWeight="medium">
                      {formData.previousAudit?.title ||
                        formData.previousAudit?.auditCode ||
                        "-"}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Close Audit Schedule Card */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="semibold">Audit Status</Text>
                    {formData.status === 1 ? (
                      <Badge colorScheme="green" fontSize="sm">
                        Closed
                      </Badge>
                    ) : (
                      <Badge colorScheme="warning" fontSize="sm">
                        Ongoing
                      </Badge>
                    )}
                  </Flex>

                  <Text fontSize="sm" color="gray.600">
                    {formData.status === 1
                      ? "This audit schedule has been closed. All findings have been resolved and verdicts have been set."
                      : "Close this audit schedule when all findings are resolved and verdicts are set for all organizations."}
                  </Text>

                  {formData.status === 1 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="brandPrimary"
                      leftIcon={<FiEdit />}
                      onClick={handleReopenAudit}
                    >
                      Reopen Audit Schedule
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<FiCheckCircle />}
                      onClick={onCloseAuditOpen}
                    >
                      Close Audit Schedule
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </Stack>

          {/* Right Column - Organizations */}
          <Stack spacing={4} flex={1}>
            <Organizations schedule={schedule ?? {}} {...{ setFormData }} />
          </Stack>
        </Flex>
      </Box>

      {/* PageFooter with More Options */}
      <PageFooter>
        <HStack spacing={3} w="full">
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FiMoreVertical />}
              variant="ghost"
            >
              More Options
            </MenuButton>
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
        </HStack>
      </PageFooter>

      {/* Edit Audit Details Modal */}
      <EditAuditDetailsModal
        isOpen={isEditDetailsOpen}
        onClose={onEditDetailsClose}
        auditData={formData}
        onSave={handleSaveAuditDetails}
        isSaving={loading}
        currentScheduleId={id}
      />

      {/* Close Audit Modal */}
      <CloseAuditModal
        isOpen={isCloseAuditOpen}
        onClose={onCloseAuditClose}
        validation={auditValidation}
        onConfirmClose={handleCloseAudit}
        isClosing={isClosingAudit}
      />
    </>
  );
};

// Wrapper component with OrganizationsProvider
const SchedulePage = () => {
  const { id } = useParams();

  return (
    <OrganizationsProvider scheduleId={id}>
      <SchedulePageContent />
    </OrganizationsProvider>
  );
};

export default SchedulePage;
