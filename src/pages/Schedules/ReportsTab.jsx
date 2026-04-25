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
  Center,
  Avatar,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { FiFileText, FiTool } from "react-icons/fi";
import moment from "moment";
import { useOrganizations, useUser } from "../../context/_useContext";
import ActionPlanForm from "./Organizations/ActionPlanForm";
import VerificationForm from "./Organizations/VerificationForm";
import NotifBadge from "../../components/NotifBadge";
import Can from "../../components/Can";

const DATE_FORMAT_LONG = "MMMM DD, YYYY";

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

const getLatestActionPlan = (f) => f.actionPlans?.[f.actionPlans.length - 1];

const isNC = (f) => ["MINOR_NC", "MAJOR_NC"].includes(f.compliance);

const getFindingStatus = (f) => {
  const latest = getLatestActionPlan(f);
  const status = latest?.corrected;

  return {
    latest,
    needsActionPlan: !latest || status === 0,
    needsVerification: latest && (status === -1 || status === undefined),
    isResolved: status === 2,
  };
};

const ReportCard = ({ finding, organization, onSave, isScheduleOngoing }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const reportBg = useColorModeValue("gray.50", "gray.800");

  const actionModal = useDisclosure();
  const verifyModal = useDisclosure();

  const compliance = finding.currentCompliance || finding.compliance;
  const complianceInfo =
    COMPLIANCE_DISPLAY[compliance] || COMPLIANCE_DISPLAY.OBSERVATIONS;

  const { latest, needsActionPlan, needsVerification } =
    getFindingStatus(finding);

  const shouldHaveActionPlan = isNC(finding) && finding.report;

  const handleSaveActionPlan = async (data) => {
    const { visitIndex, organizationId, ...rest } = finding;

    const newPlan = {
      id: `ap-${Date.now()}`,
      actionPlan: data,
      corrected: -1,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...rest,
      actionPlans: [...(rest.actionPlans || []), newPlan],
    };

    await onSave?.({ ...updated, visitIndex, organizationId }, organization);
    actionModal.onClose();
  };

  const handleSaveVerification = async (data) => {
    const { visitIndex, organizationId, ...rest } = finding;

    const updatedPlans = (rest.actionPlans || []).map((ap, i, arr) =>
      i === arr.length - 1 ? { ...ap, ...data } : ap,
    );

    const latestPlan = updatedPlans.at(-1);

    const updated = {
      ...rest,
      actionPlans: updatedPlans,
      currentCompliance:
        latestPlan.corrected === 2 ? "COMPLIANT" : finding.compliance,
    };

    await onSave?.({ ...updated, visitIndex, organizationId }, organization);
    verifyModal.onClose();
  };

  return (
    <>
      <Card size="sm" variant="outline" borderColor={borderColor} bg={cardBg}>
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <VStack align="flex-start" flex={1}>
                <HStack spacing={1}>
                  <Badge colorScheme={complianceInfo.color} fontSize="xs">
                    {complianceInfo.label}
                  </Badge>

                  <NotifBadge
                    show={needsActionPlan || needsVerification}
                    message={
                      needsActionPlan
                        ? "Action Plan Required"
                        : needsVerification
                          ? "Verification Pending"
                          : ""
                    }
                  />
                </HStack>

                <Text fontWeight="semibold">{finding.title}</Text>

                {finding.objectives?.length > 0 && (
                  <Wrap>
                    {finding.objectives.map((o, i) => (
                      <WrapItem key={i}>
                        <Tooltip
                          label={moment(o.teamUpdatedAt).format(
                            DATE_FORMAT_LONG,
                          )}
                        >
                          <Badge fontSize="2xs">{o.title}</Badge>
                        </Tooltip>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </VStack>
            </HStack>

            <Text fontSize="sm" color={labelColor}>
              {finding.details}
            </Text>

            {shouldHaveActionPlan && finding.report && (
              <Box
                p={3}
                bg={reportBg}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <HStack mb={2}>
                  <FiFileText />
                  <Text fontWeight="semibold" fontSize="sm">
                    Report
                  </Text>
                </HStack>

                <Text fontSize="sm">Report No: {finding.report.reportNo}</Text>
                <Text fontSize="sm">
                  Date: {moment(finding.report.date).format(DATE_FORMAT_LONG)}
                </Text>
                <Text fontSize="sm">{finding.report.details}</Text>
              </Box>
            )}

            <Can to="audit.response.u">
              {shouldHaveActionPlan && isScheduleOngoing && (
                <HStack>
                  <Spacer />

                  {needsActionPlan && (
                    <Button
                      size="sm"
                      colorScheme="purple"
                      leftIcon={<FiTool />}
                      onClick={actionModal.onOpen}
                    >
                      {latest ? "Add Another Action Plan" : "Add Action Plan"}
                    </Button>
                  )}

                  {needsVerification && (
                    <Can to="audit.verify.u">
                      <Button size="sm" onClick={verifyModal.onOpen}>
                        Set Verification
                      </Button>
                    </Can>
                  )}
                </HStack>
              )}
            </Can>
          </VStack>
        </CardBody>
      </Card>

      {/* Modals unchanged */}
      <Modal
        size="lg"
        isOpen={actionModal.isOpen}
        onClose={actionModal.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Action Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ActionPlanForm
              mode="add"
              onSave={handleSaveActionPlan}
              onCancel={actionModal.onClose}
              team={organization.team}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={verifyModal.isOpen}
        onClose={verifyModal.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VerificationForm
              initialData={latest}
              onSave={handleSaveVerification}
              onCancel={verifyModal.onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
const ReportsTab = ({ schedule }) => {
  const { loading, organizations, updateOrganization } = useOrganizations();
  const { user } = useUser();

  const isOngoing = schedule?.status === 0;

  const teamIds = useMemo(() => {
    const teams = [].concat(user?.team || user?.teams || []);
    return teams.map((t) => String(t?._id || t));
  }, [user]);

  const visibleOrgs = useMemo(() => {
    if (!teamIds.length) return organizations || [];
    return organizations?.filter((o) => teamIds.includes(String(o.team?._id)));
  }, [organizations, teamIds]);

  const data = useMemo(() => {
    return visibleOrgs
      .map((org) => {
        const findings =
          org.visits?.flatMap((v, vi) =>
            (v.findings || [])
              .filter((f) => {
                if (!isNC(f) || !f.report?.reportNo) return false;

                const { needsActionPlan, needsVerification, isResolved } =
                  getFindingStatus(f);

                return !isResolved && (needsActionPlan || needsVerification);
              })
              .map((f) => ({
                ...f,
                visitIndex: vi,
                organizationId: org._id,
              })),
          ) || [];

        return { organization: org, findings };
      })
      .filter((d) => d.findings.length);
  }, [visibleOrgs]);

  const handleSave = async (updated, org) => {
    const { visitIndex, ...clean } = updated;

    const visits = org.visits.map((v, i) =>
      i === visitIndex
        ? {
            ...v,
            findings: v.findings.map((f) => (f._id === clean._id ? clean : f)),
          }
        : v,
    );

    await updateOrganization(org._id, { visits });
  };

  if (loading && !data.length) {
    return (
      <Flex justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (!data.length) {
    return (
      <Center p={8}>
        <Text color="gray.500">Everything is compliant</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md">Non-Conformity Items</Heading>

      {data.map(({ organization, findings }) => (
        <Box key={organization._id}>
          <HStack mb={3}>
            <Avatar size="sm" name={organization.team?.name} />
            <Text fontWeight="bold">{organization.team?.name}</Text>
            <Spacer />
            <Text color="gray.500" fontSize="xs">
              {findings.length} Finding
              {findings.length !== 1 ? "s" : ""}
            </Text>
          </HStack>

          <SimpleGrid columns={[1, 2]} spacing={3}>
            {findings.map((f) => (
              <ReportCard
                key={f._id}
                finding={f}
                organization={organization}
                onSave={handleSave}
                isScheduleOngoing={isOngoing}
              />
            ))}
          </SimpleGrid>

          <Divider mt={4} />
        </Box>
      ))}
    </VStack>
  );
};

export default ReportsTab;
