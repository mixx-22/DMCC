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
} from "@chakra-ui/react";
import {
  FiEdit,
  FiArrowLeft,
  FiMoreVertical,
  FiTrash2,
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
    deleteSchedule,
  } = useScheduleProfile();

  const errorColor = useColorModeValue("error.600", "error.400");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  const handleEdit = () => {
    navigate(`/audit-schedule/${id}/edit`);
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
            <Button
              leftIcon={<FiEdit />}
              onClick={handleEdit}
              colorScheme="brandPrimary"
            >
              Edit
            </Button>
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
            <Box>
              <Heading size="md" mb={4}>
                Basic Information
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                    Title
                  </Text>
                  <Text fontSize="md">{schedule.title}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
                    Description
                  </Text>
                  <Text fontSize="md" whiteSpace="pre-wrap">
                    {schedule.description}
                  </Text>
                </Box>
              </VStack>
            </Box>

            <Divider borderColor={dividerColor} />

            {/* Audit Details Section */}
            <Box>
              <Heading size="md" mb={4}>
                Audit Details
              </Heading>
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
            </Box>

            <Divider borderColor={dividerColor} />

            {/* Status Section */}
            <Box>
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
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default ScheduleViewPage;
