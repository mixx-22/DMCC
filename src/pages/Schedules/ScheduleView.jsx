import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Spinner,
  Badge,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
  FiPlus,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import { useScheduleProfile } from "../../context/_useContext";
import { getAuditTypeLabel } from "../../utils/auditHelpers";
import OrganizationsList from "./OrganizationsList";
import AddOrganizationModal from "./AddOrganizationModal";

const ScheduleView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    schedule,
    loading,
    deleteSchedule,
    fetchSchedule,
  } = useScheduleProfile();
  const errorColor = useColorModeValue("error.600", "error.400");
  const {
    isOpen: isAddOrgOpen,
    onOpen: onAddOrgOpen,
    onClose: onAddOrgClose,
  } = useDisclosure();

  useEffect(() => {
    if (id && id !== "new") {
      fetchSchedule(id);
    }
  }, [id, fetchSchedule]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Schedule?",
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
        toast.success("Schedule Deleted", {
          description: `"${schedule?.title}" has been deleted`,
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

  const handleEdit = () => {
    navigate(`/schedules/${id}/edit`);
  };

  if (loading) {
    return (
      <Box>
        <PageHeader>
          <Heading variant="pageTitle">Schedule Details</Heading>
        </PageHeader>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brandPrimary.500" />
        </Flex>
      </Box>
    );
  }

  if (!schedule) {
    return (
      <Box>
        <PageHeader>
          <Heading variant="pageTitle">Schedule Not Found</Heading>
        </PageHeader>
        <Box textAlign="center" py={10}>
          <Text>The schedule you are looking for does not exist.</Text>
          <Button mt={4} onClick={() => navigate("/schedules")}>
            Back to Schedules
          </Button>
        </Box>
      </Box>
    );
  }

  const getStatusBadge = (status) => {
    if (status === 1) {
      return (
        <Badge colorScheme="green" fontSize="sm">
          Closed
        </Badge>
      );
    }
    return (
      <Badge colorScheme="blue" fontSize="sm">
        Ongoing
      </Badge>
    );
  };

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <HStack>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={() => navigate("/schedules")}
              aria-label="Back to schedules"
              variant="ghost"
            />
            <Heading variant="pageTitle">{schedule.title}</Heading>
          </HStack>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiMoreVertical />}
              variant="ghost"
              aria-label="More options"
            />
            <MenuList>
              <MenuItem icon={<FiEdit />} onClick={handleEdit}>
                Edit Schedule
              </MenuItem>
              <MenuItem
                icon={<FiTrash2 />}
                onClick={handleDelete}
                color={errorColor}
              >
                Delete Schedule
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </PageHeader>

      {/* Schedule Information - Centered Display */}
      <Box maxW="800px" mx="auto" mb={8}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              {schedule.title}
            </Heading>
            {getStatusBadge(schedule.status)}
          </Box>

          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                Description
              </Text>
              <Text>{schedule.description || "-"}</Text>
            </Box>

            <HStack spacing={8}>
              <Box flex="1">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={1}
                >
                  Audit Code
                </Text>
                <Text>{schedule.auditCode || "-"}</Text>
              </Box>
              <Box flex="1">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={1}
                >
                  Audit Type
                </Text>
                <Text>
                  {schedule.auditType
                    ? getAuditTypeLabel(schedule.auditType)
                    : "-"}
                </Text>
              </Box>
            </HStack>

            {schedule.standard && (
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={1}
                >
                  Standard
                </Text>
                <Text>{schedule.standard}</Text>
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>

      <Divider mb={6} />

      {/* Organizations Section */}
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Organizations</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            size="sm"
            onClick={onAddOrgOpen}
          >
            Add Organization
          </Button>
        </Flex>
        <OrganizationsList scheduleId={id} />
      </Box>

      <AddOrganizationModal
        isOpen={isAddOrgOpen}
        onClose={onAddOrgClose}
        scheduleId={id}
      />
    </Box>
  );
};

export default ScheduleView;
