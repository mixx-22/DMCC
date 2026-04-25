import {
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
  Collapse,
  Divider,
  Avatar,
  Tooltip,
  Stack,
  Wrap,
  WrapItem,
  Button,
  Center,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiCheckCircle,
  FiPlus,
  FiTool,
} from "react-icons/fi";
import moment from "moment";
import FindingsForm from "./FindingsForm";
import ActionPlanForm from "./ActionPlanForm";
import VerificationForm from "./VerificationForm";
import NotifBadge from "../../../components/NotifBadge";
import ResponsiveTabs, {
  ResponsiveTabList,
  ResponsiveTab,
  ResponsiveTabPanels,
  ResponsiveTabPanel,
} from "../../../components/common/ResponsiveTabs";
import Can from "../../../components/Can";

// Helper function to get user's full name from either format
const getUserFullName = (user) => {
  if (!user) return "";
  // Handle combined name field (API format)
  if (user.name) return user.name;
  // Handle separate firstName/lastName fields (legacy format)
  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
};

// Map compliance values to display names and colors
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

const FindingCard = ({
  finding,
  findingIndex = 1, // 1-based index of this finding in the list
  team, // NEW: Accept team object
  organizationAuditors = [], // NEW: Accept organization auditors
  auditStandardClauses, // Changed from teamObjectives to auditStandardClauses
  onEdit,
  onDelete,
  onSaveEdit,
  isScheduleOngoing,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingActionPlan, setIsEditingActionPlan] = useState(false);
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const reportBg = useColorModeValue("gray.50", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.800");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const complianceInfo =
    COMPLIANCE_DISPLAY[finding.compliance] || COMPLIANCE_DISPLAY.OBSERVATIONS;

  // Use currentCompliance if available, otherwise fallback to compliance
  const currentComplianceInfo =
    COMPLIANCE_DISPLAY[finding.currentCompliance || finding.compliance] ||
    COMPLIANCE_DISPLAY.OBSERVATIONS;

  // Check if finding should have action plan (MINOR_NC or MAJOR_NC with report)
  const shouldShowActionPlan =
    (finding.compliance === "MINOR_NC" || finding.compliance === "MAJOR_NC") &&
    finding.report;

  // Check if action plan is missing (no action plans at all)
  const needsActionPlan =
    shouldShowActionPlan &&
    (!finding.actionPlans || finding.actionPlans.length === 0);

  // Check if verification is needed (has action plans but latest one not verified)
  const needsVerification =
    shouldShowActionPlan &&
    finding.actionPlans &&
    finding.actionPlans.length > 0 &&
    (!finding.actionPlans[finding.actionPlans.length - 1].corrected ||
      finding.actionPlans[finding.actionPlans.length - 1].corrected === -1);

  const handleEditClick = () => {
    setIsEditing(true);
    setIsExpanded(true); // Expand when editing
    if (onEdit) {
      onEdit(finding);
    }
  };

  const handleSave = async (findingData) => {
    if (onSaveEdit) {
      await onSaveEdit(findingData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSaveActionPlan = async (actionPlanData) => {
    // Add new action plan to the actionPlans array
    const newActionPlan = {
      id: `action-plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actionPlan: actionPlanData,
      corrected: -1, // Not verified yet
      correctionDate: null,
      createdAt: new Date().toISOString(),
    };

    const updatedFinding = {
      ...finding,
      actionPlans: [...(finding.actionPlans || []), newActionPlan],
    };

    if (onSaveEdit) {
      await onSaveEdit(updatedFinding);
    }
    setIsEditingActionPlan(false);
  };

  const handleCancelActionPlan = () => {
    setIsEditingActionPlan(false);
  };

  const handleSaveVerification = async (
    verificationData,
    actionPlanIndex = null,
  ) => {
    // If no specific action plan index, use the last one
    const index =
      actionPlanIndex !== null
        ? actionPlanIndex
        : (finding.actionPlans?.length || 0) - 1;

    if (index < 0 || !finding.actionPlans || !finding.actionPlans[index]) {
      console.error("Invalid action plan index for verification");
      return;
    }

    // Update the specific action plan with verification data
    const updatedActionPlans = finding.actionPlans.map((ap, i) =>
      i === index
        ? {
            ...ap,
            corrected: verificationData.corrected,
            correctionDate: verificationData.correctionDate,
            remarks: verificationData.remarks,
          }
        : ap,
    );

    // Calculate currentCompliance based on the latest action plan's corrected status
    const latestActionPlan = updatedActionPlans[updatedActionPlans.length - 1];
    const currentCompliance =
      latestActionPlan.corrected === 2 ? "COMPLIANT" : finding.compliance;

    // Save updated action plans at finding level
    const updatedFinding = {
      ...finding,
      actionPlans: updatedActionPlans,
      currentCompliance: currentCompliance,
    };

    if (onSaveEdit) {
      await onSaveEdit(updatedFinding);
    }
    setIsEditingVerification(false);
  };

  const handleCancelVerification = () => {
    setIsEditingVerification(false);
  };

  // If in edit mode, show the form
  if (isEditing) {
    return (
      <Card
        size="sm"
        variant="outline"
        borderColor={borderColor}
        bg={cardBg}
        boxShadow="none"
      >
        <CardBody>
          <FindingsForm
            team={team} // NEW: Pass team object
            organizationAuditors={organizationAuditors} // NEW: Pass organization auditors
            auditStandardClauses={auditStandardClauses}
            initialData={finding}
            mode="edit"
            findingIndex={findingIndex}
            onAddFinding={handleSave}
            onCancel={handleCancel}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      size="sm"
      variant="outline"
      borderColor={borderColor}
      bg={cardBg}
      boxShadow="none"
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex={1}>
              <HStack spacing={2} flexWrap="wrap">
                {/* Show currentCompliance badge unless verification tab is being edited */}
                {!isEditingVerification && (
                  <Badge
                    colorScheme={currentComplianceInfo.color}
                    fontSize="xs"
                  >
                    {currentComplianceInfo.label}
                  </Badge>
                )}
                {/* Show original compliance when editing verification */}
                {isEditingVerification && (
                  <Badge colorScheme={complianceInfo.color} fontSize="xs">
                    {complianceInfo.label}
                  </Badge>
                )}
              </HStack>
              <HStack spacing={2} flexWrap="wrap">
                <Text fontWeight="semibold" fontSize="md">
                  {finding.title}
                </Text>
              </HStack>
              {/* Clauses Display */}
              {finding.clauses && finding.clauses.length > 0 && (
                <Box>
                  <Wrap spacing={1}>
                    {finding.clauses.map((clause, idx) => (
                      <WrapItem key={`clause-${clause.id}-${idx}`}>
                        <Badge fontSize="2xs" px={2} py={1} borderRadius="md">
                          {clause.name}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
              {/* Backward compatibility for old objectives */}
              {!finding.clauses &&
                finding.objectives &&
                finding.objectives.length > 0 && (
                  <Box>
                    <Wrap spacing={1}>
                      {finding.objectives.map((obj, idx) => (
                        <WrapItem key={`obj-${obj._id}-${idx}`}>
                          <Badge fontSize="2xs" px={2} py={1} borderRadius="md">
                            {obj.title}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
              {/* Backward compatibility for old single objective */}
              {!finding.clauses && !finding.objectives && finding.objective && (
                <Text fontSize="xs" color={labelColor}>
                  {finding.objective}
                </Text>
              )}
            </VStack>
            <HStack spacing={0}>
              <Box>
                <NotifBadge
                  mr={2}
                  show={needsActionPlan || needsVerification}
                  message={
                    needsVerification
                      ? "Verification Pending"
                      : needsActionPlan
                        ? "Action Plan Required"
                        : undefined
                  }
                />
              </Box>
              <IconButton
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              />
              <Can to="audit.findings.u">
                {isScheduleOngoing && onEdit && (
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    variant="ghost"
                    colorScheme="brandPrimary"
                    onClick={handleEditClick}
                    aria-label="Edit finding"
                  />
                )}
                {isScheduleOngoing && onDelete && (
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="error"
                    onClick={() => onDelete(finding)}
                    aria-label="Delete finding"
                  />
                )}
              </Can>
            </HStack>
          </HStack>

          {/* Collapsible Content */}
          <Collapse in={isExpanded} animateOpacity>
            <VStack align="stretch" spacing={3}>
              <Divider />

              {/* Details */}
              <Box>
                <Text
                  fontSize="xs"
                  color={labelColor}
                  fontWeight="semibold"
                  mb={1}
                >
                  Details
                </Text>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {finding.details}
                </Text>
              </Box>

              {finding.loggedBy && (
                <>
                  <Divider my={4} />
                  <HStack spacing={2}>
                    <Text fontSize="xs" color={labelColor} minW="80px">
                      Logged By:
                    </Text>
                    <Text fontSize="sm">
                      {getUserFullName(finding.loggedBy)}
                      {finding.loggedBy.email && (
                        <> ({finding.loggedBy.email})</>
                      )}
                    </Text>
                  </HStack>
                </>
              )}

              {/* Tabs for Report, Action Plan, and Verification - Only for MINOR_NC/MAJOR_NC with report */}
              {shouldShowActionPlan ? (
                <ResponsiveTabs
                  colorScheme="purple"
                  index={activeTabIndex}
                  onChange={(index) => setActiveTabIndex(index)}
                  triggerUpdate={isExpanded}
                >
                  <ResponsiveTabList>
                    <ResponsiveTab>
                      <HStack spacing={2}>
                        <FiFileText />
                        <Text>Report</Text>
                      </HStack>
                    </ResponsiveTab>
                    <ResponsiveTab>
                      <HStack spacing={2}>
                        <Center position="relative">
                          <FiTool />
                          <NotifBadge
                            bottom={-1}
                            right={-1}
                            boxSize={3}
                            position="absolute"
                            show={needsActionPlan}
                            message={"Action Plan Required"}
                          />
                        </Center>
                        <Text>Action Plan</Text>
                      </HStack>
                    </ResponsiveTab>
                    <ResponsiveTab>
                      <HStack spacing={2}>
                        <Center pos="relative">
                          <FiCheckCircle />
                          <NotifBadge
                            bottom={-1}
                            right={-1}
                            boxSize={3}
                            position="absolute"
                            show={needsVerification}
                            message={"Verification Pending"}
                          />
                        </Center>
                        <Text>Verification</Text>
                      </HStack>
                    </ResponsiveTab>
                  </ResponsiveTabList>

                  <ResponsiveTabPanels>
                    {/* Report Tab Panel */}
                    <ResponsiveTabPanel px={0} py={4}>
                      <Box
                        p={3}
                        bg={reportBg}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <VStack align="stretch" spacing={2}>
                          <HStack>
                            {/* Report Number */}
                            {finding.report.reportNo && (
                              <HStack flex={1} spacing={2}>
                                <Text
                                  fontSize="xs"
                                  color={labelColor}
                                  minW="80px"
                                >
                                  Report No:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {finding.report.reportNo}
                                </Text>
                              </HStack>
                            )}

                            {/* Date Issued */}
                            {finding.report.date && (
                              <HStack flex={1} spacing={2}>
                                <Text
                                  fontSize="xs"
                                  color={labelColor}
                                  minW="80px"
                                >
                                  Date Issued:
                                </Text>
                                <Text fontSize="sm">
                                  {moment(finding.report.date).format(
                                    "MMMM DD, YYYY",
                                  )}
                                </Text>
                              </HStack>
                            )}
                          </HStack>

                          <Divider my={4} />

                          {/* Report Details */}
                          {finding.report.details && (
                            <Box>
                              <Text fontSize="xs" color={labelColor} mb={1}>
                                Report Details:
                              </Text>
                              <Text fontSize="sm" whiteSpace="pre-wrap">
                                {finding.report.details}
                              </Text>
                            </Box>
                          )}

                          <Divider my={4} />

                          {/* Auditee and Auditor */}
                          <HStack alignItems="flex-start">
                            <Stack flex={1} spacing={2}>
                              <Text fontSize="xs" color={labelColor}>
                                Auditor/s:
                              </Text>
                              {finding?.report?.auditor?.length > 0 ? (
                                <Box>
                                  <Wrap>
                                    {finding?.report?.auditor?.map(
                                      (u, index) => {
                                        const fullName = getUserFullName(u);
                                        return (
                                          <WrapItem
                                            key={`auditor-${u.id}-${index}`}
                                          >
                                            <Tooltip label={fullName}>
                                              <Card
                                                variant="filled"
                                                shadow="none"
                                              >
                                                <CardBody px={2} py={1}>
                                                  <HStack spacing={1}>
                                                    <Avatar
                                                      size="xs"
                                                      name={fullName}
                                                    />
                                                    <Text fontSize="sm">
                                                      {fullName}
                                                    </Text>
                                                  </HStack>
                                                </CardBody>
                                              </Card>
                                            </Tooltip>
                                          </WrapItem>
                                        );
                                      },
                                    )}
                                  </Wrap>
                                </Box>
                              ) : (
                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                  opacity={0.5}
                                >
                                  No Auditors
                                </Text>
                              )}
                            </Stack>
                            <Stack flex={1} spacing={2}>
                              <Text fontSize="xs" color={labelColor}>
                                Auditee/s:
                              </Text>
                              {finding?.report?.auditee?.length > 0 ? (
                                <Box>
                                  <Wrap>
                                    {finding?.report?.auditee?.map(
                                      (u, index) => {
                                        const fullName = getUserFullName(u);
                                        return (
                                          <WrapItem
                                            key={`auditee-${u.id}-${index}`}
                                          >
                                            <Tooltip label={fullName}>
                                              <Card
                                                variant="filled"
                                                shadow="none"
                                              >
                                                <CardBody px={2} py={1}>
                                                  <HStack spacing={1}>
                                                    <Avatar
                                                      size="xs"
                                                      name={fullName}
                                                    />
                                                    <Text fontSize="sm">
                                                      {fullName}
                                                    </Text>
                                                  </HStack>
                                                </CardBody>
                                              </Card>
                                            </Tooltip>
                                          </WrapItem>
                                        );
                                      },
                                    )}
                                  </Wrap>
                                </Box>
                              ) : (
                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                  opacity={0.5}
                                >
                                  No Auditees
                                </Text>
                              )}
                            </Stack>
                          </HStack>
                        </VStack>
                      </Box>
                    </ResponsiveTabPanel>

                    {/* Action Plan Tab Panel */}
                    <ResponsiveTabPanel px={0} py={4}>
                      <VStack align="stretch" spacing={4}>
                        {/* Display existing action plans in conversation format */}
                        {finding.actionPlans &&
                          finding.actionPlans.length > 0 && (
                            <VStack align="stretch" spacing={3}>
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="info.700"
                              >
                                Action Plan History
                              </Text>
                              {finding.actionPlans.map(
                                (actionPlanItem, index) => (
                                  <Box
                                    key={actionPlanItem.id || index}
                                    p={3}
                                    bg={sectionBg}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                  >
                                    <VStack align="stretch" spacing={3}>
                                      <HStack
                                        justify="space-between"
                                        align="start"
                                      >
                                        <Badge colorScheme="info" fontSize="xs">
                                          Action Plan #{index + 1}
                                        </Badge>
                                        <Text fontSize="xs" color={labelColor}>
                                          {actionPlanItem.createdAt
                                            ? moment(
                                                actionPlanItem.createdAt,
                                              ).format("MMM DD, YYYY")
                                            : ""}
                                        </Text>
                                      </HStack>

                                      {/* Action Plan Details */}
                                      <ActionPlanForm
                                        initialData={actionPlanItem.actionPlan}
                                        organizationAuditors={
                                          organizationAuditors
                                        }
                                        team={team}
                                        readOnly={true}
                                      />

                                      {/* Verification Status */}
                                      {actionPlanItem.corrected !== undefined &&
                                        actionPlanItem.corrected !== -1 && (
                                          <Box
                                            mt={2}
                                            p={2}
                                            bg="green.50"
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor="green.200"
                                          >
                                            <VStack align="stretch" spacing={2}>
                                              <HStack justify="space-between">
                                                <Text
                                                  fontSize="xs"
                                                  fontWeight="semibold"
                                                  color="green.700"
                                                >
                                                  Verification Status
                                                </Text>
                                                <Badge
                                                  colorScheme={
                                                    actionPlanItem.corrected ===
                                                    2
                                                      ? "green"
                                                      : actionPlanItem.corrected ===
                                                          0
                                                        ? "red"
                                                        : "orange"
                                                  }
                                                  fontSize="xs"
                                                >
                                                  {actionPlanItem.corrected ===
                                                  2
                                                    ? "Corrected"
                                                    : actionPlanItem.corrected ===
                                                        0
                                                      ? "Not Corrected"
                                                      : "Pending"}
                                                </Badge>
                                              </HStack>

                                              {actionPlanItem.correctionDate && (
                                                <Text
                                                  fontSize="xs"
                                                  color={labelColor}
                                                >
                                                  Correction Date:{" "}
                                                  {moment(
                                                    actionPlanItem.correctionDate,
                                                  ).format("MMMM DD, YYYY")}
                                                </Text>
                                              )}

                                              {actionPlanItem.remarks && (
                                                <Box>
                                                  <Text
                                                    fontSize="xs"
                                                    color={labelColor}
                                                    mb={1}
                                                  >
                                                    Remarks:
                                                  </Text>
                                                  <Text
                                                    fontSize="sm"
                                                    whiteSpace="pre-wrap"
                                                  >
                                                    {actionPlanItem.remarks}
                                                  </Text>
                                                </Box>
                                              )}
                                            </VStack>
                                          </Box>
                                        )}
                                    </VStack>
                                  </Box>
                                ),
                              )}
                            </VStack>
                          )}

                        {/* Add new action plan */}
                        {isEditingActionPlan ? (
                          <ActionPlanForm
                            initialData={null}
                            organizationAuditors={organizationAuditors}
                            team={team}
                            onSave={handleSaveActionPlan}
                            onCancel={handleCancelActionPlan}
                            readOnly={false}
                          />
                        ) : (
                          <Center w="full" flexDir="column" minH="xs">
                            <Can
                              to="audit.response.c"
                              fallback={
                                <>
                                  <Text
                                    mb={2}
                                    fontSize="xs"
                                    color="gray.500"
                                    textAlign="center"
                                  >
                                    {finding.actionPlans &&
                                    finding.actionPlans.length > 0
                                      ? "No additional action plans needed."
                                      : "No Action Plan Set Yet. Wait for the team leader to add one."}
                                  </Text>
                                </>
                              }
                            >
                              <Text
                                mb={2}
                                fontSize="xs"
                                color="gray.500"
                                textAlign="center"
                              >
                                {finding.actionPlans &&
                                finding.actionPlans.length > 0
                                  ? "Add another action plan or update if needed."
                                  : "No Action Plan Set Yet. Add one now by clicking the button below."}
                              </Text>

                              <Button
                                size="sm"
                                leftIcon={<FiPlus />}
                                colorScheme="brandPrimary"
                                variant="outline"
                                onClick={() => setIsEditingActionPlan(true)}
                              >
                                {finding.actionPlans &&
                                finding.actionPlans.length > 0
                                  ? "Add Another Action Plan"
                                  : "Add Action Plan"}
                              </Button>
                            </Can>
                          </Center>
                        )}
                      </VStack>
                    </ResponsiveTabPanel>

                    {/* Verification Tab Panel */}
                    <ResponsiveTabPanel px={0} py={4}>
                      {needsActionPlan ? (
                        <Center w="full" flexDir="column" minH="xs">
                          <Text
                            mb={2}
                            fontSize="xs"
                            color="gray.500"
                            textAlign="center"
                          >
                            No Action Plan Yet.
                            <br />
                            This organization still doesn't have an Action Plan
                            set yet.
                          </Text>
                        </Center>
                      ) : (
                        <VStack align="stretch" spacing={4}>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="green.700"
                          >
                            Verification History
                          </Text>

                          {/* Show verification for each action plan */}
                          {finding.actionPlans &&
                            finding.actionPlans.map((actionPlanItem, index) => (
                              <Box
                                key={actionPlanItem.id || index}
                                p={3}
                                bg={sectionBg}
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor={borderColor}
                              >
                                <VStack align="stretch" spacing={3}>
                                  <HStack justify="space-between" align="start">
                                    <Badge colorScheme="green" fontSize="xs">
                                      Action Plan #{index + 1} Verification
                                    </Badge>
                                    {isScheduleOngoing &&
                                      (actionPlanItem.corrected === undefined ||
                                        actionPlanItem.corrected === -1) && (
                                        <Button
                                          size="xs"
                                          leftIcon={<FiPlus />}
                                          colorScheme="green"
                                          variant="outline"
                                          onClick={() => {
                                            setIsEditingVerification(true);
                                            // TODO: Set which action plan is being verified
                                          }}
                                        >
                                          Verify
                                        </Button>
                                      )}
                                  </HStack>

                                  {actionPlanItem.corrected !== undefined &&
                                  actionPlanItem.corrected !== -1 ? (
                                    <VerificationForm
                                      initialData={{
                                        corrected: actionPlanItem.corrected,
                                        correctionDate:
                                          actionPlanItem.correctionDate,
                                        remarks: actionPlanItem.remarks,
                                      }}
                                      readOnly={true}
                                    />
                                  ) : (
                                    <Text
                                      fontSize="sm"
                                      color="gray.500"
                                      textAlign="center"
                                    >
                                      Not verified yet
                                    </Text>
                                  )}
                                </VStack>
                              </Box>
                            ))}

                          {/* Edit verification form */}
                          {isEditingVerification && (
                            <VerificationForm
                              initialData={{
                                corrected: -1,
                                correctionDate: new Date(),
                                remarks: "",
                              }}
                              onSave={(data) =>
                                handleSaveVerification(
                                  data,
                                  finding.actionPlans?.length - 1,
                                )
                              }
                              onCancel={handleCancelVerification}
                              readOnly={false}
                            />
                          )}
                        </VStack>
                      )}
                    </ResponsiveTabPanel>
                  </ResponsiveTabPanels>
                </ResponsiveTabs>
              ) : (
                /* Report Section - For findings without tabs (non-NC or without report) */
                finding.report && (
                  <Box
                    p={3}
                    bg={reportBg}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <HStack spacing={2} mb={2}>
                      <FiFileText />
                      <Text fontSize="sm" fontWeight="semibold">
                        Report Details
                      </Text>
                    </HStack>

                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        {/* Report Number */}
                        {finding.report.reportNo && (
                          <HStack flex={1} spacing={2}>
                            <Text fontSize="xs" color={labelColor} minW="80px">
                              Report No:
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {finding.report.reportNo}
                            </Text>
                          </HStack>
                        )}

                        {/* Date Issued */}
                        {finding.report.date && (
                          <HStack flex={1} spacing={2}>
                            <Text fontSize="xs" color={labelColor} minW="80px">
                              Date Issued:
                            </Text>
                            <Text fontSize="sm">
                              {moment(finding.report.date).format(
                                "MMMM DD, YYYY",
                              )}
                            </Text>
                          </HStack>
                        )}
                      </HStack>

                      <Divider my={4} />

                      {/* Report Details */}
                      {finding.report.details && (
                        <Box>
                          <Text fontSize="xs" color={labelColor} mb={1}>
                            Report Details:
                          </Text>
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {finding.report.details}
                          </Text>
                        </Box>
                      )}

                      <Divider my={4} />

                      {/* Auditee and Auditor */}
                      <HStack alignItems="flex-start">
                        <Stack flex={1} spacing={2}>
                          <Text fontSize="xs" color={labelColor}>
                            Auditor/s:
                          </Text>
                          {finding?.report?.auditor?.length > 0 ? (
                            <Box>
                              <Wrap>
                                {finding?.report?.auditor?.map((u, index) => {
                                  const fullName = getUserFullName(u);
                                  return (
                                    <WrapItem key={`auditor-${u.id}-${index}`}>
                                      <Tooltip label={fullName}>
                                        <Card variant="filled" shadow="none">
                                          <CardBody px={2} py={1}>
                                            <HStack spacing={1}>
                                              <Avatar
                                                size="xs"
                                                name={fullName}
                                              />
                                              <Text fontSize="sm">
                                                {fullName}
                                              </Text>
                                            </HStack>
                                          </CardBody>
                                        </Card>
                                      </Tooltip>
                                    </WrapItem>
                                  );
                                })}
                              </Wrap>
                            </Box>
                          ) : (
                            <Text fontSize="xs" color="gray.500" opacity={0.5}>
                              No Auditors
                            </Text>
                          )}
                        </Stack>
                        <Stack flex={1} spacing={2}>
                          <Text fontSize="xs" color={labelColor}>
                            Auditee/s:
                          </Text>
                          {finding?.report?.auditee?.length > 0 ? (
                            <Box>
                              <Wrap>
                                {finding?.report?.auditee?.map((u, index) => {
                                  const fullName = getUserFullName(u);
                                  return (
                                    <WrapItem key={`auditee-${u.id}-${index}`}>
                                      <Tooltip label={fullName}>
                                        <Card variant="filled" shadow="none">
                                          <CardBody px={2} py={1}>
                                            <HStack spacing={1}>
                                              <Avatar
                                                size="xs"
                                                name={fullName}
                                              />
                                              <Text fontSize="sm">
                                                {fullName}
                                              </Text>
                                            </HStack>
                                          </CardBody>
                                        </Card>
                                      </Tooltip>
                                    </WrapItem>
                                  );
                                })}
                              </Wrap>
                            </Box>
                          ) : (
                            <Text fontSize="xs" color="gray.500" opacity={0.5}>
                              No Auditees
                            </Text>
                          )}
                        </Stack>
                      </HStack>
                    </VStack>
                  </Box>
                )
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

const FindingsList = ({
  findings = [],
  team = null, // NEW: Accept team object
  organizationAuditors = [], // NEW: Accept organization auditors
  auditStandardClauses = [], // Changed from teamObjectives to auditStandardClauses
  onEdit,
  onDelete,
  onSaveEdit,
  isScheduleOngoing,
}) => {
  if (!findings || findings.length === 0) {
    return null;
  }

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
        Findings ({findings.length})
      </Text>
      {findings.map((finding, index) => (
        <FindingCard
          key={finding._id || index}
          finding={finding}
          findingIndex={index + 1}
          team={team} // NEW: Pass team object
          organizationAuditors={organizationAuditors} // NEW: Pass organization auditors
          auditStandardClauses={auditStandardClauses}
          onEdit={onEdit}
          onDelete={onDelete}
          onSaveEdit={onSaveEdit}
          {...{ isScheduleOngoing }}
        />
      ))}
    </VStack>
  );
};

export default FindingsList;
