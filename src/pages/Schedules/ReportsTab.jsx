import {
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Heading,
  Spinner,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Wrap,
  WrapItem,
  Tooltip,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { FiFileText, FiTool, FiCheckCircle } from "react-icons/fi";
import moment from "moment";
import { useOrganizations } from "../../context/_useContext";
import ActionPlanForm from "./Organizations/ActionPlanForm";
import VerificationForm from "./Organizations/VerificationForm";
import NotifBadge from "../../components/NotifBadge";

// Constants
const DATE_FORMAT_LONG = "MMMM DD, YYYY";

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

// Helper function to check if finding should have action plan
const isNonConformityWithReport = (finding) =>
  (finding.compliance === "MINOR_NC" || finding.compliance === "MAJOR_NC") &&
  finding.report;

const ReportCard = ({ finding, organization, onSave, isScheduleOngoing }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const reportBg = useColorModeValue("gray.50", "gray.800");

  const {
    isOpen: isActionPlanOpen,
    onOpen: onActionPlanOpen,
    onClose: onActionPlanClose,
  } = useDisclosure();
  const {
    isOpen: isVerificationOpen,
    onOpen: onVerificationOpen,
    onClose: onVerificationClose,
  } = useDisclosure();

  // Use currentCompliance if available, otherwise fallback to compliance
  const currentComplianceInfo =
    COMPLIANCE_DISPLAY[finding.currentCompliance || finding.compliance] ||
    COMPLIANCE_DISPLAY.OBSERVATIONS;

  // Check if finding should have action plan (MINOR_NC or MAJOR_NC with report)
  const shouldShowActionPlan = isNonConformityWithReport(finding);

  // Check if action plan is missing
  const needsActionPlan = shouldShowActionPlan && !finding.actionPlan;

  // Check if verification is needed (has action plan but not verified)
  const needsVerification =
    shouldShowActionPlan && finding.actionPlan && finding.corrected === -1;

  const handleSaveActionPlan = async (actionPlanData) => {
    // Save action plan as part of the finding
    const { visitIndex, organizationId, ...findingData } = finding;
    const updatedFinding = {
      ...findingData,
      actionPlan: actionPlanData,
    };

    if (onSave) {
      // Pass finding with temporary routing properties for handleSaveFinding
      await onSave(
        { ...updatedFinding, visitIndex, organizationId },
        organization,
      );
    }
    onActionPlanClose();
  };

  const handleSaveVerification = async (verificationData) => {
    // Calculate currentCompliance based on corrected status
    const currentCompliance =
      verificationData.corrected === 2 ? "COMPLIANT" : finding.compliance;

    // Save verification data at finding level
    const { visitIndex, organizationId, ...findingData } = finding;
    const updatedFinding = {
      ...findingData,
      corrected: verificationData.corrected,
      correctionDate: verificationData.correctionDate,
      remarks: verificationData.remarks,
      currentCompliance: currentCompliance,
    };

    if (onSave) {
      // Pass finding with temporary routing properties for handleSaveFinding
      await onSave(
        { ...updatedFinding, visitIndex, organizationId },
        organization,
      );
    }
    onVerificationClose();
  };

  return (
    <>
      <Card
        size="sm"
        variant="outline"
        borderColor={borderColor}
        bg={cardBg}
        boxShadow="sm"
        _hover={{ boxShadow: "md" }}
      >
        <CardBody>
          <VStack align="stretch" spacing={3}>
            {/* Header */}
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1} flex={1}>
                <HStack spacing={2} flexWrap="wrap">
                  <Badge
                    colorScheme={currentComplianceInfo.color}
                    fontSize="xs"
                  >
                    {currentComplianceInfo.label}
                  </Badge>
                </HStack>
                <Text fontWeight="semibold" fontSize="md">
                  {finding.title}
                </Text>
                {/* Objectives Display */}
                {finding.objectives && finding.objectives.length > 0 && (
                  <Box>
                    <Wrap spacing={1}>
                      {finding.objectives.map((obj, idx) => (
                        <WrapItem key={`obj-${obj._id}-${idx}`}>
                          <Tooltip
                            label={`Updated: ${moment(obj.teamUpdatedAt).format(DATE_FORMAT_LONG)}`}
                            placement="top"
                          >
                            <Badge
                              fontSize="2xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {obj.title}
                            </Badge>
                          </Tooltip>
                        </WrapItem>
                      ))}
                      <WrapItem>
                        <Text as="span" fontSize="xs" color="gray.500" mt={1}>
                          {moment(finding.objectives[0]?.teamUpdatedAt).format(
                            "MMM DD, YYYY",
                          )}
                        </Text>
                      </WrapItem>
                    </Wrap>
                  </Box>
                )}
              </VStack>
              <Box>
                <NotifBadge
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
            </HStack>

            {/* Details */}
            <Box>
              <Text fontSize="sm" whiteSpace="pre-wrap" color={labelColor}>
                {finding.details}
              </Text>
            </Box>

            {/* Report Section - Only for MINOR_NC/MAJOR_NC with report */}
            {shouldShowActionPlan && finding.report && (
              <Box
                p={3}
                bg={reportBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="semibold" fontSize="sm">
                      Report
                    </Text>
                  </HStack>
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
                        {moment(finding.report.date).format(DATE_FORMAT_LONG)}
                      </Text>
                    </HStack>
                  )}

                  {/* Report Details */}
                  {finding.report.details && (
                    <Box>
                      <Text fontSize="xs" color={labelColor} mb={1}>
                        Details:
                      </Text>
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {finding.report.details}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {/* Action Buttons */}
            {shouldShowActionPlan && isScheduleOngoing && (
              <HStack spacing={2}>
                <Button
                  leftIcon={<FiTool />}
                  size="sm"
                  colorScheme="brandPrimary"
                  variant={needsActionPlan ? "solid" : "outline"}
                  onClick={onActionPlanOpen}
                >
                  {finding.actionPlan ? "Edit Action Plan" : "Add Action Plan"}
                </Button>
                {finding.actionPlan && (
                  <Button
                    leftIcon={<FiCheckCircle />}
                    size="sm"
                    colorScheme="green"
                    variant={needsVerification ? "solid" : "outline"}
                    onClick={onVerificationOpen}
                  >
                    {finding.corrected === -1
                      ? "Set Verification"
                      : "Edit Verification"}
                  </Button>
                )}
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Action Plan Modal */}
      <Modal isOpen={isActionPlanOpen} onClose={onActionPlanClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {finding.actionPlan ? "Edit Action Plan" : "Add Action Plan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ActionPlanForm
              initialData={finding.actionPlan}
              mode={finding.actionPlan ? "edit" : "add"}
              onSave={handleSaveActionPlan}
              onCancel={onActionPlanClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Verification Modal */}
      <Modal
        isOpen={isVerificationOpen}
        onClose={onVerificationClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VerificationForm
              initialData={{
                corrected: finding.corrected,
                correctionDate: finding.correctionDate,
                remarks: finding.remarks,
              }}
              onSave={handleSaveVerification}
              onCancel={onVerificationClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const ReportsTab = ({ schedule }) => {
  const { loading, organizations, updateOrganization } = useOrganizations();
  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);
  const organizationColor = useColorModeValue("purple.600", "purple.200");

  // Collect all findings grouped by organization
  const organizationsWithFindings = useMemo(() => {
    if (!organizations || organizations.length === 0) return [];

    return organizations
      .map((org) => {
        // Collect all findings from all visits for this organization
        const findings =
          org?.visits?.flatMap((visit, visitIndex) =>
            (visit.findings || []).map((finding) => ({
              ...finding,
              visitIndex, // Store visit index for updates
              organizationId: org._id,
            })),
          ) || [];

        return {
          organization: org,
          findings,
        };
      })
      .filter((item) => item.findings.length > 0); // Only include orgs with findings
  }, [organizations]);

  const handleSaveFinding = async (updatedFinding, organization) => {
    // Find the visit index from the finding
    const visitIndex = updatedFinding.visitIndex;

    // Remove temporary routing properties before persisting
    // eslint-disable-next-line no-unused-vars
    const { visitIndex: _visitIndex, organizationId: _organizationId, ...cleanFinding } = updatedFinding;

    // Calculate updated visits with the edited finding
    const updatedVisits = organization.visits.map((v, i) => {
      if (i === visitIndex) {
        return {
          ...v,
          findings: (v.findings || []).map((f) =>
            f._id === cleanFinding._id ? cleanFinding : f,
          ),
        };
      }
      return v;
    });

    // Update organization with new visits
    await updateOrganization(organization._id, {
      visits: updatedVisits,
    });
  };

  if (loading && organizations?.length < 1) {
    return (
      <Flex justify="center" py={8}>
        <Spinner size="md" />
      </Flex>
    );
  }

  if (organizationsWithFindings.length === 0) {
    return (
      <Card>
        <CardBody>
          <VStack spacing={3} py={8}>
            <FiFileText size={48} opacity={0.3} />
            <Text fontSize="lg" fontWeight="medium" color="gray.500">
              No findings to display
            </Text>
            <Text fontSize="sm" color="gray.400">
              Add organizations and findings to see them here
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Flex justify="space-between" align="center">
        <Heading size="md">All Reports</Heading>
        <Text fontSize="xs" color="gray.500">
          {organizationsWithFindings.reduce(
            (acc, item) => acc + item.findings.length,
            0,
          )}{" "}
          Total Findings
        </Text>
      </Flex>

      {organizationsWithFindings.map(({ organization, findings }) => (
        <Box key={organization._id}>
          {/* Organization Header */}
          <HStack mb={3} spacing={3}>
            <Heading size="sm" color={organizationColor}>
              {organization.team?.name ||
                organization.teamName ||
                "Unknown Team"}
            </Heading>
            <Spacer />
            <Badge colorScheme="gray" fontSize="xs">
              {findings.length} Finding{findings.length !== 1 ? "s" : ""}
            </Badge>
          </HStack>

          {/* Findings List */}
          <SimpleGrid columns={[1, 1, 2]} spacing={3} mb={6}>
            {findings.map((finding) => (
              <ReportCard
                key={finding._id}
                finding={finding}
                organization={organization}
                onSave={handleSaveFinding}
                isScheduleOngoing={isScheduleOngoing}
              />
            ))}
          </SimpleGrid>

          <Divider />
        </Box>
      ))}
    </VStack>
  );
};

export default ReportsTab;
