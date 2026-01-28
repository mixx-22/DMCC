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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Center,
  Stack,
  Icon,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiFolder,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import { useOrganizations, useDocuments } from "../../../context/_useContext";
import Timestamp from "../../../components/Timestamp";
import { GridView } from "../../../components/Document/GridView";

const OrganizationCard = ({
  schedule,
  setFormData: setScheduleFormData = () => {},
  organization,
  team,
  auditors = [],
  onEdit,
}) => {
  const { deleteOrganization } = useOrganizations();
  const {
    documents,
    loading: documentsLoading,
    fetchDocuments,
  } = useDocuments();
  const [isExpanded, setIsExpanded] = useState(true);
  const cardBg = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("error.600", "error.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const headerHoverBg = useColorModeValue("gray.100", "gray.650");
  const objectiveBg = useColorModeValue("gray.50", "gray.700");

  const WEIGHT_COLORS = {
    low: "green",
    medium: "yellow",
    high: "red",
  };

  // Fetch documents when folderId is available
  useEffect(() => {
    if (organization?.folderId && isExpanded) {
      fetchDocuments(organization.folderId);
    }
  }, [organization?.folderId, isExpanded, fetchDocuments]);

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
        const orgId = organization?._id || organization?.id;
        await deleteOrganization(orgId);

        // Update local schedule data to remove the organization ID
        if (schedule) {
          const updatedSchedule = {
            ...schedule,
            organizations: (schedule.organizations || []).filter(
              (orgId) => orgId !== orgId,
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
            <Box p={4} pt={0}>
              {/* Auditors Section - Always Visible */}
              <Box mb={4}>
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

              <Divider mb={4} />

              {/* Tabs Section */}
              <Tabs colorScheme="brandPrimary" size="sm">
                <TabList>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiCalendar} />
                      <Text>Visits</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiUsers} />
                      <Text>Team Details</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={1}>
                      <Icon as={FiFolder} />
                      <Text>Documents</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Visit Details Tab */}
                  <TabPanel px={0}>
                    {organization.visits && organization.visits.length > 0 ? (
                      <VStack align="stretch" spacing={2}>
                        {organization.visits.map((visit, index) => (
                          <Flex
                            key={index}
                            p={3}
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
                    ) : (
                      <Center minH="xs">
                        <Text color="gray.500" textAlign="center">
                          No visits scheduled
                        </Text>
                      </Center>
                    )}
                  </TabPanel>

                  {/* Team Details Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {/* Team Description */}
                      {team?.description && (
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" mb={2}>
                            Description
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {team.description}
                          </Text>
                        </Box>
                      )}

                      {/* Team Timestamps */}
                      <Flex gap={6} flexWrap="wrap">
                        {team?.createdAt && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Team Created
                            </Text>
                            <Text fontWeight="medium" fontSize="sm">
                              <Timestamp date={team.createdAt} />
                            </Text>
                          </Box>
                        )}
                        {team?.updatedAt && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Last Updated
                            </Text>
                            <Text fontWeight="medium" fontSize="sm">
                              <Timestamp date={team.updatedAt} />
                            </Text>
                          </Box>
                        )}
                      </Flex>

                      {/* Team Objectives */}
                      {team?.objectives && team.objectives.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" mb={2}>
                            Objectives
                          </Text>
                          <Stack spacing={3}>
                            {team.objectives.map((objective, index) => (
                              <Box
                                key={objective.id || `objective-${index}`}
                                p={3}
                                borderWidth={1}
                                borderRadius="md"
                                borderColor={borderColor}
                                bg={objectiveBg}
                              >
                                <Flex
                                  justify="space-between"
                                  align="start"
                                  mb={2}
                                >
                                  <Text fontWeight="bold" fontSize="sm">
                                    {objective.title}
                                  </Text>
                                  <Badge
                                    colorScheme={
                                      WEIGHT_COLORS[objective.weight]
                                    }
                                    fontSize="xs"
                                  >
                                    {objective.weight}
                                  </Badge>
                                </Flex>
                                <Text fontSize="sm" color="gray.600">
                                  {objective.description}
                                </Text>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* View Team Button */}
                      {team?._id && (
                        <Box>
                          <Button
                            as={RouterLink}
                            to={`/teams/${team._id}`}
                            target="_blank"
                            rightIcon={<FiExternalLink />}
                            variant="outline"
                            colorScheme="brandPrimary"
                            size="sm"
                            width="full"
                          >
                            View Team in New Tab
                          </Button>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Documents Tab */}
                  <TabPanel px={0}>
                    {organization?.folderId ? (
                      documentsLoading ? (
                        <Center minH="xs">
                          <Text color="gray.500">Loading documents...</Text>
                        </Center>
                      ) : documents && documents.length > 0 ? (
                        <GridView
                          documents={documents}
                          onDocumentClick={() => {}}
                          readOnly={true}
                        />
                      ) : (
                        <Center minH="xs">
                          <Text color="gray.500" textAlign="center">
                            No documents found
                          </Text>
                        </Center>
                      )
                    ) : (
                      <Center minH="xs">
                        <Text color="gray.500" textAlign="center">
                          No folder assigned to this organization
                        </Text>
                      </Center>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrganizationCard;
