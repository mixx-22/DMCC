import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Divider,
  Box,
  useColorModeValue,
  Tooltip,
  Wrap,
  WrapItem,
  Flex,
  Collapse,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useState } from "react";
import Swal from "sweetalert2";
import { useOrganizations } from "../../../context/_useContext";

const OrganizationCard = ({
  schedule,
  setFormData: setScheduleFormData = () => {},
  organization,
  team,
  auditors = [],
  onEdit,
}) => {
  const { deleteOrganization } = useOrganizations();
  const [isExpanded, setIsExpanded] = useState(true);
  const cardBg = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("error.600", "error.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const headerHoverBg = useColorModeValue("gray.100", "gray.650");

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to check if visit is same day
  const isSameDay = (visit) => {
    return visit.date?.start === visit.date?.end;
  };

  const handleDeleteOrganization = async (organization) => {
    const result = await Swal.fire({
      title: "Delete Organization?",
      text: `Are you sure you want to remove this team from the audit schedule? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteOrganization(organization._id);

        // Update local schedule data to remove the organization ID
        if (schedule) {
          const updatedSchedule = {
            ...schedule,
            organizations: (schedule.organizations || []).filter(
              (orgId) => orgId !== organization._id,
            ),
          };
          setScheduleFormData((prev) => ({ ...prev, ...updatedSchedule }));
        }
      } catch (error) {
        console.error("Failed to delete organization:", error);
      }
    }
  };

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
      <CardBody p={0}>
        <VStack align="stretch" spacing={0}>
          {/* Collapsible Header */}
          <HStack
            justify="space-between"
            align="center"
            p={4}
            cursor="pointer"
            onClick={() => setIsExpanded(!isExpanded)}
            _hover={{ bg: headerHoverBg }}
            transition="background 0.2s"
          >
            <HStack spacing={3} flex={1}>
              <IconButton
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontWeight="bold" fontSize="lg" color="brandPrimary.600">
                  {team?.name || "Unknown Team"}
                </Text>
              </VStack>
            </HStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                aria-label="More options"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                <MenuItem
                  icon={<FiEdit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(organization);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrganization(organization);
                  }}
                  color={errorColor}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Collapsible Content */}
          <Collapse in={isExpanded} animateOpacity>
            <VStack align="stretch" spacing={4} p={4} pt={0}>
              {/* Team Description */}
              {team?.description && (
                <>
                  <Text fontSize="sm" color="gray.600">
                    {team.description}
                  </Text>
                  <Divider />
                </>
              )}

              {/* Auditors Section */}
              <Box>
                <HStack mb={3} spacing={2}>
                  <FiUsers />
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Auditors ({auditors.length})
                  </Text>
                </HStack>
                {auditors && auditors.length > 0 ? (
                  <Wrap spacing={2}>
                    {auditors.map((auditor, index) => {
                      const userId = auditor._id || auditor.id || auditor;
                      const fullName =
                        auditor.firstName && auditor.lastName
                          ? `${auditor.firstName} ${auditor.lastName}`
                          : auditor.name || `User ${index + 1}`;
                      const employeeId = auditor.employeeId;
                      const email = auditor.email;

                      return (
                        <WrapItem key={userId || index}>
                          <Tooltip
                            label={
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold">{fullName}</Text>
                                {email && <Text fontSize="xs">{email}</Text>}
                                {employeeId && (
                                  <Text fontSize="xs">ID: {employeeId}</Text>
                                )}
                              </VStack>
                            }
                            hasArrow
                            placement="top"
                          >
                            <Box
                              px={3}
                              py={2}
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor={borderColor}
                              _hover={{ bg: hoverBg }}
                              cursor="pointer"
                              transition="all 0.2s"
                            >
                              <HStack spacing={2}>
                                <Avatar name={fullName} size="xs" />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {fullName}
                                  </Text>
                                  {employeeId && (
                                    <Text fontSize="xs" color="gray.500">
                                      ID: {employeeId}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Box>
                          </Tooltip>
                        </WrapItem>
                      );
                    })}
                  </Wrap>
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No auditors assigned
                  </Text>
                )}
              </Box>

              {/* Visits Section */}
              {organization.visits && organization.visits.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <HStack mb={3} spacing={2}>
                      <FiCalendar />
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Scheduled Visits ({organization.visits.length})
                      </Text>
                    </HStack>
                    <VStack align="stretch" spacing={2}>
                      {organization.visits.map((visit, index) => (
                        <Flex
                          key={index}
                          p={2}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={borderColor}
                          align="center"
                          justify="space-between"
                        >
                          {isSameDay(visit) ? (
                            <HStack spacing={2}>
                              <Badge colorScheme="green" fontSize="xs">
                                Single Day
                              </Badge>
                              <Text fontSize="sm" fontWeight="medium">
                                {formatDate(visit.date?.start)}
                              </Text>
                            </HStack>
                          ) : (
                            <HStack spacing={2} fontSize="sm">
                              <Text fontWeight="medium">
                                {formatDate(visit.date?.start)}
                              </Text>
                              <Text color="gray.500">→</Text>
                              <Text fontWeight="medium">
                                {formatDate(visit.date?.end)}
                              </Text>
                              <Badge colorScheme="blue" fontSize="xs">
                                Multi-day
                              </Badge>
                            </HStack>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrganizationCard;
