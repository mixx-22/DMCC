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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
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
  FiAlertCircle,
  FiTool,
} from "react-icons/fi";
import moment from "moment";
import FindingsForm from "./FindingsForm";
import ActionPlanForm from "./ActionPlanForm";
import VerificationForm from "./VerificationForm";

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
  teamObjectives,
  team, // NEW: Accept team object
  onEdit,
  onDelete,
  onSaveEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingActionPlan, setIsEditingActionPlan] = useState(false);
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const reportBg = useColorModeValue("gray.50", "gray.800");

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
    shouldShowActionPlan && finding.actionPlan && finding.corrected !== 1;

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
      verificationData.corrected === 1 ? "COMPLIANT" : finding.compliance;

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
            teamObjectives={teamObjectives}
            team={team} // NEW: Pass team object
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
              {/* Objectives Display */}
              {finding.objectives && finding.objectives.length > 0 && (
                <Box>
                  <Text fontSize="xs" color={labelColor} mb={1}>
                    Objectives:
                  </Text>
                  <Wrap spacing={1}>
                    {finding.objectives.map((obj, idx) => (
                      <WrapItem key={`obj-${obj._id}-${idx}`}>
                        <Tooltip
                          label={`Updated: ${moment(obj.teamUpdatedAt).format("MMMM DD, YYYY")}`}
                          placement="top"
                        >
                          <Badge
                            colorScheme="purple"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {obj.title}
                          </Badge>
                        </Tooltip>
                      </WrapItem>
                    ))}
                  </Wrap>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Last updated: {moment(finding.objectives[0]?.teamUpdatedAt).format("MMM DD, YYYY")}
                  </Text>
                </Box>
              )}
              {/* Backward compatibility for old single objective */}
              {!finding.objectives && finding.objective && (
                <Text fontSize="xs" color={labelColor}>
                  Objective: {finding.objective}
                </Text>
              )}
              <HStack spacing={2} flexWrap="wrap">
                <Text fontWeight="semibold" fontSize="md">
                  {finding.title}
                </Text>
              </HStack>
            </VStack>
            <HStack spacing={0}>
              {needsActionPlan && (
                <Badge colorScheme="orange" fontSize="xs" mr={2}>
                  <HStack spacing={1}>
                    <FiAlertCircle />
                    <Text>Action Plan Required</Text>
                  </HStack>
                </Badge>
              )}
              {needsVerification && (
                <Badge colorScheme="orange" fontSize="xs" mr={2}>
                  <HStack spacing={1}>
                    <FiAlertCircle />
                    <Text>Verification Pending</Text>
                  </HStack>
                </Badge>
              )}
              <IconButton
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              />
              {onEdit && (
                <IconButton
                  icon={<FiEdit />}
                  size="sm"
                  variant="ghost"
                  colorScheme="brandPrimary"
                  onClick={handleEditClick}
                  aria-label="Edit finding"
                />
              )}
              {onDelete && (
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="error"
                  onClick={() => onDelete(finding)}
                  aria-label="Delete finding"
                />
              )}
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
                <Tabs colorScheme="brandPrimary">
                  <TabList>
                    <Tab>
                      <HStack spacing={2}>
                        <FiFileText />
                        <Text>Report</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <FiTool />
                        <Text>Action Plan</Text>
                        {needsActionPlan && (
                          <Badge colorScheme="orange" fontSize="xs">
                            Required
                          </Badge>
                        )}
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <FiCheckCircle />
                        <Text>Verification</Text>
                        {needsVerification && (
                          <Badge colorScheme="orange" fontSize="xs">
                            Pending
                          </Badge>
                        )}
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Report Tab Panel */}
                    <TabPanel px={0} py={4}>
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
                                        return (
                                          <WrapItem
                                            key={`auditor-${u.id}-${index}`}
                                          >
                                            <Tooltip
                                              label={`${u.firstName} ${u.lastName}`}
                                            >
                                              <Card
                                                variant="filled"
                                                shadow="none"
                                              >
                                                <CardBody px={2} py={1}>
                                                  <HStack spacing={1}>
                                                    <Avatar
                                                      size="xs"
                                                      name={`${u.firstName} ${u.lastName}`}
                                                    />
                                                    <Text fontSize="sm">
                                                      {`${u.firstName} ${u.lastName}`}
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
                                        return (
                                          <WrapItem
                                            key={`auditee-${u.id}-${index}`}
                                          >
                                            <Tooltip
                                              label={`${u.firstName} ${u.lastName}`}
                                            >
                                              <Card
                                                variant="filled"
                                                shadow="none"
                                              >
                                                <CardBody px={2} py={1}>
                                                  <HStack spacing={1}>
                                                    <Avatar
                                                      size="xs"
                                                      name={`${u.firstName} ${u.lastName}`}
                                                    />
                                                    <Text fontSize="sm">
                                                      {`${u.firstName} ${u.lastName}`}
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
                    </TabPanel>

                    {/* Action Plan Tab Panel */}
                    <TabPanel px={0} py={4}>
                      {isEditingActionPlan ? (
                        <ActionPlanForm
                          initialData={finding.actionPlan}
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
                            onSave={handleSaveActionPlan}
                            onCancel={handleCancelActionPlan}
                            readOnly={true}
                          />
                        </Box>
                      ) : (
                        <Center w="full" flexDir="column" minH="xs">
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
                        </Center>
                      )}
                    </TabPanel>

                    {/* Verification Tab Panel */}
                    <TabPanel px={0} py={4}>
                      {isEditingVerification ? (
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
                      ) : finding.corrected === 1 ? (
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <HStack spacing={2}>
                              <FiCheckCircle />
                              <Text fontSize="sm" fontWeight="semibold">
                                Verification Details
                              </Text>
                            </HStack>
                            <IconButton
                              icon={<FiEdit />}
                              size="xs"
                              variant="ghost"
                              colorScheme="green"
                              onClick={() => setIsEditingVerification(true)}
                              aria-label="Edit verification"
                            />
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
                        <Center w="full" flexDir="column" minH="xs">
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
                          </Text>
                          <Button
                            size="sm"
                            leftIcon={<FiPlus />}
                            colorScheme="green"
                            variant="outline"
                            onClick={() => setIsEditingVerification(true)}
                          >
                            Add Verification
                          </Button>
                        </Center>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
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
                                  return (
                                    <WrapItem key={`auditor-${u.id}-${index}`}>
                                      <Tooltip
                                        label={`${u.firstName} ${u.lastName}`}
                                      >
                                        <Card variant="filled" shadow="none">
                                          <CardBody px={2} py={1}>
                                            <HStack spacing={1}>
                                              <Avatar
                                                size="xs"
                                                name={`${u.firstName} ${u.lastName}`}
                                              />
                                              <Text fontSize="sm">
                                                {`${u.firstName} ${u.lastName}`}
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
                                  return (
                                    <WrapItem key={`auditee-${u.id}-${index}`}>
                                      <Tooltip
                                        label={`${u.firstName} ${u.lastName}`}
                                      >
                                        <Card variant="filled" shadow="none">
                                          <CardBody px={2} py={1}>
                                            <HStack spacing={1}>
                                              <Avatar
                                                size="xs"
                                                name={`${u.firstName} ${u.lastName}`}
                                              />
                                              <Text fontSize="sm">
                                                {`${u.firstName} ${u.lastName}`}
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
  teamObjectives = [],
  team = null, // NEW: Accept team object
  onEdit,
  onDelete,
  onSaveEdit,
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
          teamObjectives={teamObjectives}
          team={team} // NEW: Pass team object
          onEdit={onEdit}
          onDelete={onDelete}
          onSaveEdit={onSaveEdit}
        />
      ))}
    </VStack>
  );
};

export default FindingsList;
