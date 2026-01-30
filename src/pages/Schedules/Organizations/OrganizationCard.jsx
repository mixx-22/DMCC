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
  cssVar,
  useToken,
  Hide,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Spacer,
  AccordionIcon,
  Divider,
  CardHeader,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiPlus,
  FiCalendar,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useOrganizations,
  useDocuments,
  useLayout,
} from "../../../context/_useContext";
import Timestamp from "../../../components/Timestamp";
import { GridView } from "../../../components/Document/GridView";
import { formatDateRange } from "../../../utils/helpers";
import DocumentDrawer from "../../../components/Document/DocumentDrawer";
import FindingsForm from "./FindingsForm";
import FindingsList from "./FindingsList";
import VisitManager from "./VisitManager";
import VisitComplianceForm from "./VisitComplianceForm";
import {
  getStatusDisplay,
  canEdit,
  canAddVisit,
  canCloseVisit,
  isCurrentVisit,
  allFindingsHaveActionPlans,
  allFindingsVerified,
} from "../../../utils/organizationStatus";

const OrganizationCard = ({
  loading = false,
  organization,
  team,
  auditors = [],
  onEdit,
  isExpanded = false,
  onToggleExpanded = () => {},
}) => {
  const { deleteOrganization, updateOrganization, dispatch } =
    useOrganizations();
  const {
    documents,
    loading: documentsLoading,
    fetchDocuments,
  } = useDocuments();
  const { selectedDocument, closeDocumentDrawer, handleDocumentClick } =
    useLayout();
  const cardBg = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("error.600", "error.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const headerHoverBg = useColorModeValue("gray.100", "gray.650");
  const objectiveBg = useColorModeValue("gray.50", "gray.700");
  const currentVisitBg = useColorModeValue("purple.50", "purple.900");
  const [tabColor] = useToken("colors", ["gray.500"]);
  const $tabColor = cssVar("tabs-color");

  const WEIGHT_COLORS = {
    low: "green",
    medium: "yellow",
    high: "red",
  };

  const COMPLIANCE_DISPLAY = {
    OBSERVATIONS: { label: "Observations", color: "brandPrimary" },
    OPPORTUNITIES_FOR_IMPROVEMENTS: {
      label: "Opportunities for Improvements",
      color: "brandSecondary",
    },
    NON_CONFORMITY: { label: "Non-Conformity", color: "warning" },
    MINOR_NC: { label: "Minor Non-Conformity", color: "warning" },
    MAJOR_NC: { label: "Major Non-Conformity", color: "error" },
    COMPLIANT: { label: "Compliant", color: "green" },
  };

  // State to track which visit's finding form is shown (visitIndex -> boolean)
  const [showFindingFormFor, setShowFindingFormFor] = useState(new Set());

  // State to track if visit form is visible
  const [showVisitForm, setShowVisitForm] = useState(false);

  // State to track active tab index
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // State to track which visit's compliance form is shown (visitIndex)
  const [editingVisitComplianceFor, setEditingVisitComplianceFor] =
    useState(null);

  useEffect(() => {
    // Only fetch documents if organization is expanded AND user is on Documents tab (index 3)
    if (organization?.team?.folderId && isExpanded && activeTabIndex === 3) {
      fetchDocuments(organization?.team?.folderId);
    }
  }, [
    organization?.team?.folderId,
    isExpanded,
    activeTabIndex,
    fetchDocuments,
  ]);

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
        // Context reducer handles updating the organizations list
      } catch (error) {
        console.error("Failed to delete organization:", error);
      }
    }
  };

  const handleDeleteFinding = async (finding, visitIndex) => {
    // Calculate updated visits without the deleted finding
    const updatedVisits = organization.visits.map((v, i) => {
      if (i === visitIndex) {
        return {
          ...v,
          findings: (v.findings || []).filter((f) => f._id !== finding._id),
        };
      }
      return v;
    });

    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: updatedVisits,
        team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: updatedVisits,
      });
    } catch (error) {
      console.error("Failed to delete finding:", error);
      // Could refetch or show error
    }
  };

  const handleEditFinding = async (updatedFinding, visitIndex) => {
    // Calculate updated visits with the edited finding
    const updatedVisits = organization.visits.map((v, i) => {
      if (i === visitIndex) {
        return {
          ...v,
          findings: (v.findings || []).map((f) =>
            f._id === updatedFinding._id ? updatedFinding : f,
          ),
        };
      }
      return v;
    });

    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: updatedVisits,
        teamId: organization.teamId || team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: updatedVisits,
      });
    } catch (error) {
      console.error("Failed to update finding:", error);
      throw error;
    }
  };

  const handleAddVisit = async (newVisits) => {
    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: newVisits,
        teamId: organization.teamId || team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: newVisits,
      });

      // Hide form after successful add
      setShowVisitForm(false);
    } catch (error) {
      console.error("Failed to add visit:", error);
    }
  };

  const handleSaveVisitCompliance = async (visitIndex, complianceData) => {
    // Update the specific visit with compliance data
    const updatedVisits = organization.visits.map((v, i) => {
      if (i === visitIndex) {
        return {
          ...v,
          compliance: complianceData.compliance,
          complianceUser: complianceData.complianceUser,
          complianceSetAt: complianceData.complianceSetAt,
        };
      }
      return v;
    });

    // Update organization in context
    dispatch({
      type: "UPDATE_ORGANIZATION",
      payload: {
        ...organization,
        visits: updatedVisits,
        teamId: organization.teamId || team,
      },
    });

    try {
      // Persist to server
      await updateOrganization(organization._id, {
        ...organization,
        teamId: organization.teamId || team,
        visits: updatedVisits,
      });

      // Hide compliance form after successful save
      setEditingVisitComplianceFor(null);
    } catch (error) {
      console.error("Failed to save visit compliance:", error);
    }
  };

  const latestVisitDate = (() => {
    const { visits = [] } = organization;
    if (!visits?.length) return "";

    const latestVisit = visits[visits.length - 1];
    const { start, end } = latestVisit.date;

    const isOngoing = latestVisit.compliance === null;

    const formatted = formatDateRange(start, isOngoing ? new Date() : end);

    return isOngoing ? `${formatted} (Ongoing)` : formatted;
  })();

  // Get status display information
  const orgStatus = organization.status ?? 0;
  const statusDisplay = getStatusDisplay(orgStatus, organization.visits);
  const isReadOnly = !canEdit(orgStatus);

  return (
    <>
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <CardHeader p={0}>
          <HStack
            p={4}
            spacing={4}
            align="center"
            cursor="pointer"
            justify="space-between"
            onClick={onToggleExpanded}
            _hover={{ bg: headerHoverBg }}
            transition="background 0.2s"
          >
            <HStack align="center" spacing={2}>
              <Avatar size="sm" name={team.name} />
              <Text fontWeight="bold" fontSize="lg">
                {team?.name || "Unknown Team"}
              </Text>
              {loading && <Spinner size="sm" />}
            </HStack>
            <HStack align="center" spacing={2}>
              {!isExpanded && (
                <>
                  <Hide below="md">
                    <Badge colorScheme={statusDisplay.colorScheme}>
                      {statusDisplay.label}
                    </Badge>
                  </Hide>
                  <Hide below="md">
                    <Badge>{latestVisitDate}</Badge>
                  </Hide>
                </>
              )}
              <IconButton
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded();
                }}
              />
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
                    isDisabled={isReadOnly}
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
                    isDisabled={isReadOnly}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>{" "}
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <Collapse in={isExpanded} animateOpacity>
            <Box pt={0}>
              {/* Tabs Section */}
              <Tabs
                colorScheme="brandPrimary"
                onChange={(index) => setActiveTabIndex(index)}
              >
                <TabList>
                  <Tab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Visits</Text>
                    </HStack>
                  </Tab>
                  <Tab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Auditors</Text>
                    </HStack>
                  </Tab>
                  <Tab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Hide below="md">
                        <Text>Team Details</Text>
                      </Hide>
                      <Hide above="sm">
                        <Text>Details</Text>
                      </Hide>
                    </HStack>
                  </Tab>
                  <Tab
                    sx={{ [$tabColor.variable]: tabColor }}
                    fontWeight={"normal"}
                  >
                    <HStack spacing={1}>
                      <Text>Documents</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Visit Details Tab */}
                  <TabPanel p={0}>
                    {!showVisitForm && (
                      <>
                        {organization?.visits?.length > 0 ? (
                          <Accordion allowToggle>
                            {organization.visits.map((visit, index) => {
                              const hasMajorNC = visit?.findings
                                ?.map((f) => f.compliance)
                                ?.includes("MAJOR_NC");
                              const hasMinorNC = visit?.findings
                                ?.map((f) => f.compliance)
                                ?.includes("MINOR_NC");
                              const isCurrent = isCurrentVisit(index, orgStatus);
                              const visitHasActionPlans = allFindingsHaveActionPlans(visit);
                              const visitVerified = allFindingsVerified(visit);
                              const canClose = canCloseVisit(visit);
                              return (
                                <AccordionItem 
                                  key={index} 
                                  border="none"
                                  bg={isCurrent ? currentVisitBg : undefined}
                                >
                                  {({ isExpanded }) => (
                                    <>
                                      {/* Visit Date Header */}
                                      <AccordionButton py={4}>
                                        <HStack w="full" alignItems="center">
                                          <Box pos="relative">
                                            {index !== 0 && (
                                              <Box
                                                w={6}
                                                h={4}
                                                pos="absolute"
                                                zIndex={1}
                                                top={-4}
                                                left={"calc(50% - 1px)"}
                                              >
                                                <Box
                                                  w="2px"
                                                  h="full"
                                                  bg={objectiveBg}
                                                ></Box>
                                              </Box>
                                            )}
                                            {index !==
                                              organization.visits?.length -
                                                1 && (
                                              <Box
                                                w={6}
                                                h={4}
                                                pos="absolute"
                                                zIndex={1}
                                                bottom={-4}
                                                left={"calc(50% - 1px)"}
                                              >
                                                <Box
                                                  w="2px"
                                                  h="full"
                                                  bg={objectiveBg}
                                                ></Box>
                                              </Box>
                                            )}
                                            <Badge
                                              pos="relative"
                                              zIndex={2}
                                              boxSize={6}
                                              borderRadius="full"
                                              colorScheme={isCurrent ? "purple" : "gray"}
                                              justifyContent="center"
                                              alignItems="center"
                                              display="flex"
                                            >
                                              #{index + 1}
                                            </Badge>
                                          </Box>
                                          <Badge
                                            colorScheme={
                                              hasMajorNC
                                                ? "error"
                                                : hasMinorNC
                                                  ? "warning"
                                                  : undefined
                                            }
                                          >
                                            {formatDateRange(
                                              visit?.date?.start,
                                              visit?.date?.end,
                                            )}
                                          </Badge>

                                          {/* Current Visit Indicator */}
                                          {isCurrent && (
                                            <Badge colorScheme="purple" fontSize="xs">
                                              CURRENT
                                            </Badge>
                                          )}

                                          {/* Visit Compliance Badge */}
                                          {visit?.compliance && (
                                            <Badge
                                              colorScheme={
                                                visit.compliance === "COMPLIANT"
                                                  ? "green"
                                                  : visit.compliance ===
                                                      "MAJOR_NC"
                                                    ? "red"
                                                    : visit.compliance ===
                                                        "MINOR_NC"
                                                      ? "orange"
                                                      : "blue"
                                              }
                                              fontSize="xs"
                                            >
                                              {visit.compliance === "COMPLIANT"
                                                ? "✓ COMPLIANT"
                                                : COMPLIANCE_DISPLAY[visit.compliance]?.label || visit.compliance}
                                            </Badge>
                                          )}

                                          <Spacer />
                                          {!isExpanded && (
                                            <Text
                                              fontSize="sm"
                                              color="gray.500"
                                            >
                                              ({visit?.findings?.length || 0})
                                            </Text>
                                          )}
                                          <AccordionIcon />
                                        </HStack>
                                      </AccordionButton>

                                      <AccordionPanel px={4} py={0}>
                                        <Flex gap={0}>
                                          <Box
                                            minW={6}
                                            display="flex"
                                            justifyContent="center"
                                          >
                                            {index !==
                                              organization.visits.length -
                                                1 && (
                                              <Box
                                                w="2px"
                                                h="full"
                                                bg={objectiveBg}
                                              />
                                            )}
                                          </Box>
                                          <Stack flex={1} py={4} pl={2} pr={0}>
                                            <Box>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.500"
                                                mb={1}
                                              >
                                                Visit Date/s
                                              </Text>
                                              <Text fontSize="sm">
                                                {formatDateRange(
                                                  visit?.date?.start,
                                                  visit?.date?.end,
                                                )}
                                              </Text>
                                            </Box>

                                            {/* Visit Compliance Section */}
                                            <Box mt={4}>
                                              <Text
                                                fontSize="sm"
                                                fontWeight="semibold"
                                                color="gray.500"
                                                mb={2}
                                              >
                                                Visit Compliance
                                              </Text>

                                              {editingVisitComplianceFor ===
                                              index ? (
                                                <VisitComplianceForm
                                                  visit={visit}
                                                  onSave={(complianceData) => {
                                                    handleSaveVisitCompliance(
                                                      index,
                                                      complianceData,
                                                    );
                                                  }}
                                                  onCancel={() => {
                                                    setEditingVisitComplianceFor(
                                                      null,
                                                    );
                                                  }}
                                                  readOnly={false}
                                                />
                                              ) : visit?.compliance ? (
                                                <VisitComplianceForm
                                                  visit={visit}
                                                  onSave={() => {}}
                                                  onCancel={() => {
                                                    setEditingVisitComplianceFor(
                                                      index,
                                                    );
                                                  }}
                                                  readOnly={true}
                                                />
                                              ) : (
                                                <Tooltip
                                                  label={
                                                    !visitHasActionPlans
                                                      ? "All findings must have action plans before closing this visit"
                                                      : !visitVerified
                                                        ? "All findings must be verified before closing this visit"
                                                        : "Set compliance status for this visit"
                                                  }
                                                  isDisabled={canClose && !isReadOnly}
                                                  shouldWrapChildren
                                                >
                                                  <Button
                                                    size="sm"
                                                    leftIcon={<FiPlus />}
                                                    colorScheme="green"
                                                    variant="outline"
                                                    onClick={() => {
                                                      setEditingVisitComplianceFor(
                                                        index,
                                                      );
                                                    }}
                                                    w="full"
                                                    isDisabled={!canClose || isReadOnly}
                                                  >
                                                    Set Visit Compliance
                                                  </Button>
                                                </Tooltip>
                                              )}
                                            </Box>

                                            <Divider my={4} />
                                            {/* Findings List */}
                                            {visit.findings &&
                                              visit.findings.length > 0 && (
                                                <FindingsList
                                                  findings={visit.findings}
                                                  teamObjectives={
                                                    team?.objectives || []
                                                  }
                                                  team={team} // NEW: Pass full team object
                                                  onEdit={() => {
                                                    // onEdit is called but inline editing handles the UI
                                                  }}
                                                  onDelete={(finding) => {
                                                    handleDeleteFinding(
                                                      finding,
                                                      index,
                                                    );
                                                  }}
                                                  onSaveEdit={(
                                                    updatedFinding,
                                                  ) => {
                                                    handleEditFinding(
                                                      updatedFinding,
                                                      index,
                                                    );
                                                  }}
                                                />
                                              )}

                                            {/* Add Finding Form or Button */}
                                            {!visit?.findings ||
                                            visit.findings?.length < 1 ||
                                            showFindingFormFor.has(index) ? (
                                              <FindingsForm
                                                teamObjectives={
                                                  team?.objectives || []
                                                }
                                                team={team} // NEW: Pass full team object
                                                onAddFinding={async (
                                                  findingData,
                                                ) => {
                                                  // Calculate updated visits with new finding
                                                  const updatedVisits =
                                                    organization.visits.map(
                                                      (v, i) => {
                                                        if (i === index) {
                                                          return {
                                                            ...v,
                                                            findings: [
                                                              ...(v.findings ||
                                                                []),
                                                              findingData,
                                                            ],
                                                          };
                                                        }
                                                        return v;
                                                      },
                                                    );

                                                  // Update organization in context
                                                  dispatch({
                                                    type: "UPDATE_ORGANIZATION",
                                                    payload: {
                                                      ...organization,
                                                      visits: updatedVisits,
                                                      teamId:
                                                        organization.teamId ||
                                                        team,
                                                    },
                                                  });

                                                  try {
                                                    // Persist to server
                                                    await updateOrganization(
                                                      organization._id,
                                                      {
                                                        ...organization,
                                                        visits: updatedVisits,
                                                        teamId:
                                                          organization.teamId ||
                                                          team,
                                                      },
                                                    );

                                                    // Hide form after successful add
                                                    setShowFindingFormFor(
                                                      (prev) => {
                                                        const newSet = new Set(
                                                          prev,
                                                        );
                                                        newSet.delete(index);
                                                        return newSet;
                                                      },
                                                    );
                                                  } catch (error) {
                                                    console.error(
                                                      "Failed to add finding:",
                                                      error,
                                                    );
                                                    // Could refetch or show error
                                                  }
                                                }}
                                                onCancel={
                                                  visit.findings?.length > 0
                                                    ? () => {
                                                        setShowFindingFormFor(
                                                          (prev) => {
                                                            const newSet =
                                                              new Set(prev);
                                                            newSet.delete(
                                                              index,
                                                            );
                                                            return newSet;
                                                          },
                                                        );
                                                      }
                                                    : undefined
                                                }
                                              />
                                            ) : (
                                              <Button
                                                size="sm"
                                                leftIcon={<FiPlus />}
                                                onClick={() => {
                                                  setShowFindingFormFor(
                                                    (prev) => {
                                                      const newSet = new Set(
                                                        prev,
                                                      );
                                                      newSet.add(index);
                                                      return newSet;
                                                    },
                                                  );
                                                }}
                                                colorScheme="brandPrimary"
                                                variant="outline"
                                                isDisabled={isReadOnly}
                                              >
                                                Add Finding
                                              </Button>
                                            )}
                                          </Stack>
                                        </Flex>
                                      </AccordionPanel>
                                    </>
                                  )}
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        ) : (
                          <Center minH="xs">
                            <Text color="gray.500" textAlign="center">
                              No visits scheduled
                            </Text>
                          </Center>
                        )}
                      </>
                    )}

                    {/* Add Visit Section */}
                    <Box p={4} pt={2}>
                      {showVisitForm ? (
                        <VisitManager
                          label=""
                          visits={organization.visits || []}
                          onChange={handleAddVisit}
                          onCancel={() => setShowVisitForm(false)}
                        />
                      ) : (
                        <Flex justifyContent="flex-end">
                          <Tooltip
                            label={
                              !canAddVisit(organization)
                                ? "Current visit must be closed before adding a new visit"
                                : "Add a new visit to this organization"
                            }
                            isDisabled={canAddVisit(organization) && !isReadOnly}
                            shouldWrapChildren
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="purple"
                              leftIcon={<FiCalendar />}
                              onClick={() => setShowVisitForm(true)}
                              isDisabled={!canAddVisit(organization) || isReadOnly}
                            >
                              Add Visit
                            </Button>
                          </Tooltip>
                        </Flex>
                      )}
                    </Box>
                  </TabPanel>
                  {/* Team Details Tab */}
                  <TabPanel>
                    {/* Auditors Section - Always Visible */}
                    <Box mb={4}>
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Auditors ({auditors.length})
                      </Text>
                      {auditors && auditors.length > 0 ? (
                        <Wrap>
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
                                      {email && (
                                        <Text fontSize="xs">{email}</Text>
                                      )}
                                      {employeeId && (
                                        <Text fontSize="xs">{employeeId}</Text>
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
                                            {employeeId}
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
                  </TabPanel>
                  {/* Team Details Tab */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {/* Team Description */}
                      {team?.description && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Description
                          </Text>
                          <Text fontSize="sm">{team.description}</Text>
                        </Box>
                      )}

                      {/* Team Objectives */}
                      {team?.objectives && team.objectives.length > 0 && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>
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

                      {/* Team Timestamps */}
                      <Flex gap={6} flexWrap="wrap">
                        {team?.createdAt && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Team Created
                            </Text>
                            <Text fontSize="sm">
                              <Timestamp date={team.createdAt} />
                            </Text>
                          </Box>
                        )}
                        {team?.updatedAt && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Last Updated
                            </Text>
                            <Text fontSize="sm">
                              <Timestamp date={team.updatedAt} />
                            </Text>
                          </Box>
                        )}
                      </Flex>

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
                  <TabPanel px={4}>
                    {organization?.team?.folderId ? (
                      documentsLoading ? (
                        <Center minH="xs">
                          <Text color="gray.500">Loading documents...</Text>
                        </Center>
                      ) : documents && documents.length > 0 ? (
                        <GridView
                          mini={true}
                          documents={documents}
                          selectedDocument={selectedDocument}
                          onDocumentClick={(doc) => {
                            handleDocumentClick(doc);
                          }}
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
        </CardBody>
      </Card>
      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={closeDocumentDrawer}
      />
    </>
  );
};

export default OrganizationCard;
