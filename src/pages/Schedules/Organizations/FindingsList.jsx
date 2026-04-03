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

  // Check if action plan is missing
  const needsActionPlan = shouldShowActionPlan && !finding.actionPlan;

  // Check if verification is needed (has action plan but not verified)
  const needsVerification =
    shouldShowActionPlan && finding.actionPlan && finding.corrected === -1;

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
    // Save action plan as part of the finding
    const updatedFinding = {
      ...finding,
      actionPlan: actionPlanData,
    };

    if (onSaveEdit) {
      await onSaveEdit(updatedFinding);
    }
    setIsEditingActionPlan(false);
  };

  const handleCancelActionPlan = () => {
    setIsEditingActionPlan(false);
  };

  const handleSaveVerification = async (verificationData) => {
    // Calculate currentCompliance based on corrected status
    const currentCompliance =
      verificationData.corrected === 2 ? "COMPLIANT" : finding.compliance;

    // Save verification data at finding level
    const updatedFinding = {
      ...finding,
      corrected: verificationData.corrected,
      correctionDate: verificationData.correctionDate,
      remarks: verificationData.remarks,
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
                      {isEditingActionPlan ? (
                        <ActionPlanForm
                          initialData={finding.actionPlan}
                          organizationAuditors={organizationAuditors} // NEW: Pass organization auditors
                          team={team} // NEW: Pass team for leaders
                          onSave={handleSaveActionPlan}
                          onCancel={handleCancelActionPlan}
                          readOnly={false}
                        />
                      ) : finding.actionPlan ? (
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <HStack spacing={2}>
                              <FiCheckCircle />
                              <Text fontSize="sm" fontWeight="semibold">
                                Action Plan Details
                              </Text>
                            </HStack>
                            <IconButton
                              icon={<FiEdit />}
                              size="xs"
                              variant="ghost"
                              colorScheme="brandPrimary"
                              onClick={() => setIsEditingActionPlan(true)}
                              aria-label="Edit action plan"
                            />
                          </HStack>
                          <ActionPlanForm
                            initialData={finding.actionPlan}
                            organizationAuditors={organizationAuditors} // NEW: Pass organization auditors
                            team={team} // NEW: Pass team for leaders
                            onSave={handleSaveActionPlan}
                            onCancel={handleCancelActionPlan}
                            readOnly={true}
                          />
                        </Box>
                      ) : (
                        <Center w="full" flexDir="column" minH="xs">
                          {" "}
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
                                  No Action Plan Set Yet.
                                  <br />
                                  Wait for the team leader to add one.
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
                              No Action Plan Set Yet.
                              <br />
                              Add one now by clicking the button below.
                            </Text>

                            <Button
                              size="sm"
                              leftIcon={<FiPlus />}
                              colorScheme="brandPrimary"
                              variant="outline"
                              onClick={() => setIsEditingActionPlan(true)}
                            >
                              Add Action Plan
                            </Button>
                          </Can>
                        </Center>
                      )}
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
                            This organization still doesn&apos;t have an Action
                            Plan set yet.
                          </Text>
                        </Center>
                      ) : isEditingVerification ? (
                        <VerificationForm
                          initialData={{
                            corrected: finding.corrected,
                            correctionDate: finding.correctionDate,
                            remarks: finding.remarks,
                          }}
                          onSave={handleSaveVerification}
                          onCancel={handleCancelVerification}
                          readOnly={false}
                        />
                      ) : finding.corrected === 0 ||
                        finding.corrected === 2 ||
                        finding.corrected === 1 ? (
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <HStack spacing={2}>
                              <FiCheckCircle />
                              <Text fontSize="sm" fontWeight="semibold">
                                Verification Details
                              </Text>
                            </HStack>
                            {isScheduleOngoing && (
                              <IconButton
                                icon={<FiEdit />}
                                size="xs"
                                variant="ghost"
                                colorScheme={
                                  finding.corrected === 2
                                    ? "green"
                                    : finding.corrected === 0
                                      ? "red"
                                      : "warning"
                                }
                                onClick={() => setIsEditingVerification(true)}
                                aria-label="Edit verification"
                              />
                            )}
                          </HStack>
                          <VerificationForm
                            initialData={{
                              corrected: finding.corrected,
                              correctionDate: finding.correctionDate,
                              remarks: finding.remarks,
                            }}
                            onSave={handleSaveVerification}
                            onCancel={handleCancelVerification}
                            readOnly={true}
                          />
                        </Box>
                      ) : (
                        <Center
                          w="full"
                          flexDir="column"
                          minH="xs"
                          sx={{
                            ">div": {
                              display: "flex",
                              flexDir: "column",
                              alignItems: "center",
                            },
                          }}
                        >
                          <Can
                            to="audit.findings.c"
                            fallback={
                              <>
                                <Text
                                  mb={2}
                                  fontSize="xs"
                                  color="gray.500"
                                  textAlign="center"
                                >
                                  No Verification Set Yet.
                                  <br />
                                  Wait for the auditors verification.
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
                              No Verification Yet.
                              <br />
                              Verify this finding now by clicking the button
                              below.
                              <br />
                              This action is irreversible to its pending status
                              once saved
                            </Text>
                            <Button
                              size="sm"
                              leftIcon={<FiPlus />}
                              colorScheme="green"
                              variant="outline"
                              onClick={() => setIsEditingVerification(true)}
                            >
                              Set Verification
                            </Button>
                          </Can>
                        </Center>
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
