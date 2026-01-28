import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  HStack,
  Badge,
  Divider,
  Editable,
  EditableTextarea,
  EditablePreview,
  FormControl,
  FormLabel,
  Select,
  Input,
  Card,
  CardBody,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
  FiSave,
  FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import ScheduleSkeleton from "../../components/ScheduleSkeleton";
import { useScheduleProfile } from "../../context/_useContext";
import { getAuditTypeLabel } from "../../utils/auditHelpers";

const ScheduleViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    schedule,
    loading,
    fetchSchedule,
    updateSchedule,
    deleteSchedule,
    saving,
  } = useScheduleProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  
  const titleTextareaRef = useRef(null);
  const descriptionTextareaRef = useRef(null);

  const errorColor = useColorModeValue("error.600", "error.400");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  // Fetch schedule data on mount
  useEffect(() => {
    if (id && id !== "new") {
      fetchSchedule(id);
    }
  }, [id, fetchSchedule]);

  // Initialize edited data when schedule loads or editing starts
  useEffect(() => {
    if (schedule && isEditing) {
      setEditedData({
        auditCode: schedule.auditCode || "",
        auditType: schedule.auditType || "",
        standard: schedule.standard || "",
      });
    }
  }, [schedule, isEditing]);

  const handleTitleBlur = async (newTitle) => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      toast.error("Validation Error", {
        description: "Title cannot be empty. Reverted to previous value.",
        duration: 3000,
      });
      return;
    }

    if (trimmedTitle === schedule?.title) {
      return;
    }

    try {
      await updateSchedule(id, { ...schedule, title: trimmedTitle });
      await fetchSchedule(id);
      toast.success("Title Updated", {
        description: "Schedule title has been updated",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: "Failed to update title",
        duration: 3000,
      });
    }
  };

  const handleDescriptionBlur = async (newDescription) => {
    if (newDescription === schedule?.description) {
      return;
    }

    try {
      await updateSchedule(id, { ...schedule, description: newDescription });
      await fetchSchedule(id);
      toast.success("Description Updated", {
        description: "Schedule description has been updated",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: "Failed to update description",
        duration: 3000,
      });
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Start editing
      setEditedData({
        auditCode: schedule?.auditCode || "",
        auditType: schedule?.auditType || "",
        standard: schedule?.standard || "",
      });
    } else {
      // Cancel editing
      setEditedData({});
    }
    setIsEditing(!isEditing);
  };

  const handleSaveEdits = async () => {
    // Validate required fields
    if (!editedData.auditCode?.trim()) {
      toast.error("Validation Error", {
        description: "Audit code is required",
        duration: 3000,
      });
      return;
    }

    if (!editedData.auditType) {
      toast.error("Validation Error", {
        description: "Audit type is required",
        duration: 3000,
      });
      return;
    }

    try {
      await updateSchedule(id, {
        ...schedule,
        auditCode: editedData.auditCode,
        auditType: editedData.auditType,
        standard: editedData.standard,
      });
      await fetchSchedule(id);
      setIsEditing(false);
      setEditedData({});
      toast.success("Audit Details Updated", {
        description: "Audit details have been updated successfully",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: error.message || "Failed to update audit details",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Audit Schedule?",
      text: `Are you sure you want to delete "${schedule?.title}"? This action cannot be undone.`,
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
        toast.success("Audit Schedule Deleted", {
          description: `"${schedule?.title}" has been deleted`,
          duration: 3000,
        });
        navigate("/audit-schedules");
      } catch (error) {
        toast.error("Delete Failed", {
          description: error.message || "Failed to delete audit schedule",
          duration: 3000,
        });
      }
    }
  };

  const handleBack = () => {
    navigate("/audit-schedules");
  };

  if (loading) {
    return <ScheduleSkeleton />;
  }

  if (!schedule) {
    return (
      <Box p={8} textAlign="center">
        <Text>Audit schedule not found</Text>
        <Button mt={4} onClick={handleBack}>
          Back to Audit Schedules
        </Button>
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
              onClick={handleBack}
              aria-label="Back to audit schedules"
              variant="ghost"
            />
            <Heading variant="pageTitle" noOfLines={1}>
              {schedule.title}
            </Heading>
          </HStack>
          <HStack>
            {isEditing ? (
              <>
                <Button
                  leftIcon={<FiX />}
                  onClick={handleEditToggle}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<FiSave />}
                  onClick={handleSaveEdits}
                  colorScheme="brandPrimary"
                  isLoading={saving}
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                leftIcon={<FiEdit />}
                onClick={handleEditToggle}
                colorScheme="brandPrimary"
              >
                Edit
              </Button>
            )}
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
          </HStack>
        </Flex>
      </PageHeader>

      <Flex justify="center" w="full">
        <Box
          maxW="900px"
          w="full"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          p={8}
          mx={4}
        >
          <VStack spacing={6} align="stretch">
            {/* Basic Information Section */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Basic Information
                </Heading>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                      Title
                    </Text>
                    <Editable
                      key={`title-${schedule?._id || schedule?.id}`}
                      defaultValue={schedule?.title || "Untitled"}
                      onSubmit={handleTitleBlur}
                      fontSize="lg"
                      fontWeight="medium"
                      w="full"
                      isPreviewFocusable={true}
                      submitOnBlur={true}
                      selectAllOnFocus={false}
                    >
                      <EditablePreview
                        w="full"
                        py={2}
                        px={2}
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
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                      />
                    </Editable>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                      Description
                    </Text>
                    <Editable
                      key={`description-${schedule?._id || schedule?.id}`}
                      defaultValue={schedule?.description || ""}
                      onSubmit={handleDescriptionBlur}
                      placeholder="Add a description..."
                      fontSize="md"
                      w="full"
                      isPreviewFocusable={true}
                      submitOnBlur={true}
                      selectAllOnFocus={false}
                    >
                      <EditablePreview
                        py={2}
                        px={2}
                        w="full"
                        borderRadius="md"
                        color={schedule?.description ? "inherit" : "gray.400"}
                        whiteSpace="pre-wrap"
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
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                      />
                    </Editable>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Audit Details Section */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Audit Details
                </Heading>
                {isEditing ? (
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor}>
                        Audit Code
                      </FormLabel>
                      <Input
                        value={editedData.auditCode || ""}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            auditCode: e.target.value,
                          }))
                        }
                        placeholder="Enter audit code"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor}>
                        Audit Type
                      </FormLabel>
                      <Select
                        value={editedData.auditType || ""}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            auditType: e.target.value,
                          }))
                        }
                        placeholder="Select audit type"
                      >
                        <option value="internal">Internal Audit</option>
                        <option value="external">External Audit</option>
                        <option value="compliance">Compliance Audit</option>
                        <option value="financial">Financial Audit</option>
                        <option value="operational">Operational Audit</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color={labelColor}>
                        Standard
                      </FormLabel>
                      <Input
                        value={editedData.standard || ""}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            standard: e.target.value,
                          }))
                        }
                        placeholder="Enter standard (optional)"
                      />
                    </FormControl>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                        Audit Code
                      </Text>
                      <Text fontSize="md">{schedule.auditCode}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                        Audit Type
                      </Text>
                      <Text fontSize="md">
                        {schedule.auditType ? getAuditTypeLabel(schedule.auditType) : "-"}
                      </Text>
                    </Box>
                    {schedule.standard && (
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                          Standard
                        </Text>
                        <Text fontSize="md">{schedule.standard}</Text>
                      </Box>
                    )}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Status Section */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Status
                </Heading>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={2}>
                    Current Status
                  </Text>
                  {schedule.status === 1 ? (
                    <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                      Closed
                    </Badge>
                  ) : (
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                      Ongoing
                    </Badge>
                  )}
                </Box>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default ScheduleViewPage;
