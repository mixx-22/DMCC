import {
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
  Avatar,
  Wrap,
  WrapItem,
  Center,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { FiAlertCircle } from "react-icons/fi";
import moment from "moment";
import apiService from "../../../services/api";

const USE_API = import.meta.env.VITE_USE_API !== "false";

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

const PreviousAuditFindings = ({
  schedule = {},
  organization = {},
  isActive = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [previousOrganizations, setPreviousOrganizations] = useState([]);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const objectiveBg = useColorModeValue("gray.50", "gray.700");

  const { previousAudit = {} } = schedule;
  const { team = {} } = organization;

  const fetchPreviousAuditFindings = useCallback(async () => {
    if (!previousAudit?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    if (!USE_API) {
      // Mock data for development - matches new API structure
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPreviousOrganizations([
        {
          _id: "prev-org-1",
          team: {
            _id: "team-1",
            name: "Sample Team from Previous Audit",
          },
          visits: [
            {
              date: {
                start: "2023-12-01",
                end: "2023-12-02",
              },
              findings: [
                {
                  _id: "finding-1",
                  id: "finding-1",
                  title: "Sample Finding Title",
                  details: "Sample finding details from previous audit",
                  compliance: "MAJOR_NC",
                  currentCompliance: "MINOR_NC",
                  objectives: [
                    {
                      _id: "obj-1",
                      title: "Clause 8.5.1",
                    },
                  ],
                  report: {
                    reportNo: "RPT-2023-001",
                    details: "This is a sample finding report from the previous audit cycle.",
                    date: "2023-12-02",
                    auditee: [
                      {
                        id: "user-1",
                        firstName: "John",
                        lastName: "Doe",
                        employeeId: "12345",
                      },
                    ],
                    auditor: [
                      {
                        id: "user-2",
                        firstName: "Jane",
                        lastName: "Smith",
                        employeeId: "67890",
                      },
                    ],
                  },
                  actionPlan: {
                    rootCause: "Lack of proper documentation process",
                    correctiveAction: "Implement new documentation workflow",
                    proposedDate: "2024-01-15",
                    owner: [
                      {
                        id: "user-1",
                        firstName: "John",
                        lastName: "Doe",
                        employeeId: "12345",
                      },
                    ],
                    takenBy: [
                      {
                        id: "user-1",
                        firstName: "John",
                        lastName: "Doe",
                        employeeId: "12345",
                      },
                    ],
                  },
                  corrected: 1,
                  correctionDate: "2024-01-20",
                  remarks: "Corrected and verified",
                  createdAt: "2023-12-02",
                },
              ],
            },
          ],
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const params = {
        auditScheduleId: previousAudit?.id,
        teamId: team?.id,
      };
      const response = await apiService.request(`/organizations`, {
        method: "GET",
        params,
      });
      setPreviousOrganizations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch previous audit findings:", error);
      setError(error.message || "Failed to load previous audit findings");
    } finally {
      setLoading(false);
    }
  }, [previousAudit, team?.id]);

  useEffect(() => {
    // Only fetch if component is active and we have an previousAudit
    if (isActive && previousAudit?.id) {
      fetchPreviousAuditFindings();
    }
  }, [isActive, previousAudit, fetchPreviousAuditFindings]);

  // Helper to get all findings from all visits
  const getAllFindings = (organization) => {
    const findings = [];
    if (organization.visits) {
      organization.visits.forEach((visit) => {
        if (visit.findings && visit.findings.length > 0) {
          visit.findings.forEach((finding) => {
            findings.push({
              ...finding,
              visitDate: visit.date,
            });
          });
        }
      });
    }
    return findings;
  };

  if (loading) {
    return (
      <Center minH="xs" py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" color="brandPrimary.500" />
          <Text color="gray.500">Loading previous audit findings...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="xs" py={8}>
        <VStack spacing={2}>
          <FiAlertCircle size={40} color="gray" />
          <Text color="gray.500">{error}</Text>
        </VStack>
      </Center>
    );
  }

  // Filter organizations that have findings
  const organizationsWithFindings = previousOrganizations.filter(
    (org) => getAllFindings(org).length > 0,
  );

  if (organizationsWithFindings.length === 0) {
    return (
      <Center minH="xs" py={8}>
        <VStack spacing={2}>
          <FiAlertCircle size={40} color="gray" />
          <Text color="gray.500">No previous audit findings found</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={4}>
      <Text fontSize="sm" color={labelColor} mb={4}>
        Findings from previous audit schedule
      </Text>
      <Accordion allowMultiple>
        {organizationsWithFindings.map((organization) => {
          const findings = getAllFindings(organization);
          return (
            <AccordionItem
              key={organization._id}
              border="1px"
              borderColor={borderColor}
              mb={2}
            >
              <AccordionButton>
                <HStack flex="1" textAlign="left" spacing={2}>
                  <Avatar
                    size="sm"
                    name={organization.team?.name || "Unknown"}
                  />
                  <Text fontWeight="medium">
                    {organization.team?.name || "Unknown Team"}
                  </Text>
                  <Badge colorScheme="gray" fontSize="xs">
                    {findings.length}{" "}
                    {findings.length === 1 ? "Finding" : "Findings"}
                  </Badge>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  {findings.map((finding) => {
                    const complianceInfo =
                      COMPLIANCE_DISPLAY[finding.compliance] ||
                      COMPLIANCE_DISPLAY.OBSERVATIONS;
                    return (
                      <Card
                        key={finding._id}
                        bg={cardBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        size="sm"
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            {/* Header with compliance badge and title */}
                            <HStack justify="space-between" align="flex-start">
                              <VStack align="flex-start" spacing={1} flex={1}>
                                <Badge
                                  colorScheme={complianceInfo.color}
                                  fontSize="xs"
                                >
                                  {complianceInfo.label}
                                </Badge>
                                {finding.title && (
                                  <Text fontWeight="semibold" fontSize="sm">
                                    {finding.title}
                                  </Text>
                                )}
                              </VStack>
                              {finding.visitDate && (
                                <Text fontSize="xs" color={labelColor} whiteSpace="nowrap">
                                  {moment(finding.visitDate.start).format(
                                    "MMM D, YYYY",
                                  )}
                                  {finding.visitDate.end &&
                                    ` - ${moment(finding.visitDate.end).format("MMM D, YYYY")}`}
                                </Text>
                              )}
                            </HStack>

                            {/* Objectives */}
                            {finding.objectives &&
                              finding.objectives.length > 0 && (
                                <Box>
                                  <Text fontSize="xs" color={labelColor} mb={1}>
                                    Related Objectives:
                                  </Text>
                                  <Wrap>
                                    {finding.objectives.map(
                                      (objective, idx) => (
                                        <WrapItem key={idx}>
                                          <Badge
                                            bg={objectiveBg}
                                            color={labelColor}
                                            fontSize="xs"
                                          >
                                            {objective.title || objective._id || objective}
                                          </Badge>
                                        </WrapItem>
                                      ),
                                    )}
                                  </Wrap>
                                </Box>
                              )}

                            {/* Details */}
                            {finding.details && (
                              <Box>
                                <Text fontSize="xs" color={labelColor} mb={1}>
                                  Details:
                                </Text>
                                <Text fontSize="sm" whiteSpace="pre-wrap">
                                  {finding.details}
                                </Text>
                              </Box>
                            )}

                            {/* Report (if exists and is an object) */}
                            {finding.report && typeof finding.report === 'object' && (
                              <>
                                <Divider />
                                <Box>
                                  <Text fontSize="xs" color={labelColor} mb={2} fontWeight="semibold">
                                    Report:
                                  </Text>
                                  <VStack align="stretch" spacing={2}>
                                    {finding.report.reportNo && (
                                      <HStack>
                                        <Text fontSize="xs" color={labelColor} minW="80px">
                                          Report No:
                                        </Text>
                                        <Text fontSize="sm">{finding.report.reportNo}</Text>
                                      </HStack>
                                    )}
                                    {finding.report.date && (
                                      <HStack>
                                        <Text fontSize="xs" color={labelColor} minW="80px">
                                          Date:
                                        </Text>
                                        <Text fontSize="sm">
                                          {moment(finding.report.date).format("MMM D, YYYY")}
                                        </Text>
                                      </HStack>
                                    )}
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
                                    {finding.report.auditee && finding.report.auditee.length > 0 && (
                                      <Box>
                                        <Text fontSize="xs" color={labelColor} mb={1}>
                                          Auditee(s):
                                        </Text>
                                        <Wrap>
                                          {finding.report.auditee.map((person, idx) => (
                                            <WrapItem key={idx}>
                                              <Badge colorScheme="blue" fontSize="xs">
                                                {person.firstName} {person.lastName}
                                                {person.employeeId && ` (${person.employeeId})`}
                                              </Badge>
                                            </WrapItem>
                                          ))}
                                        </Wrap>
                                      </Box>
                                    )}
                                    {finding.report.auditor && finding.report.auditor.length > 0 && (
                                      <Box>
                                        <Text fontSize="xs" color={labelColor} mb={1}>
                                          Auditor(s):
                                        </Text>
                                        <Wrap>
                                          {finding.report.auditor.map((person, idx) => (
                                            <WrapItem key={idx}>
                                              <Badge colorScheme="purple" fontSize="xs">
                                                {person.firstName} {person.lastName}
                                                {person.employeeId && ` (${person.employeeId})`}
                                              </Badge>
                                            </WrapItem>
                                          ))}
                                        </Wrap>
                                      </Box>
                                    )}
                                  </VStack>
                                </Box>
                              </>
                            )}

                            {/* Action Plan (if exists and is an object) */}
                            {finding.actionPlan && typeof finding.actionPlan === 'object' && (
                              <>
                                <Divider />
                                <Box>
                                  <Text fontSize="xs" color={labelColor} mb={2} fontWeight="semibold">
                                    Action Plan:
                                  </Text>
                                  <VStack align="stretch" spacing={2}>
                                    {finding.actionPlan.rootCause && (
                                      <Box>
                                        <Text fontSize="xs" color={labelColor} mb={1}>
                                          Root Cause:
                                        </Text>
                                        <Text fontSize="sm" whiteSpace="pre-wrap">
                                          {finding.actionPlan.rootCause}
                                        </Text>
                                      </Box>
                                    )}
                                    {finding.actionPlan.correctiveAction && (
                                      <Box>
                                        <Text fontSize="xs" color={labelColor} mb={1}>
                                          Corrective Action:
                                        </Text>
                                        <Text fontSize="sm" whiteSpace="pre-wrap">
                                          {finding.actionPlan.correctiveAction}
                                        </Text>
                                      </Box>
                                    )}
                                    {finding.actionPlan.proposedDate && (
                                      <HStack>
                                        <Text fontSize="xs" color={labelColor} minW="100px">
                                          Proposed Date:
                                        </Text>
                                        <Text fontSize="sm">
                                          {moment(finding.actionPlan.proposedDate).format("MMM D, YYYY")}
                                        </Text>
                                      </HStack>
                                    )}
                                    {finding.actionPlan.owner && finding.actionPlan.owner.length > 0 && (
                                      <Box>
                                        <Text fontSize="xs" color={labelColor} mb={1}>
                                          Owner(s):
                                        </Text>
                                        <Wrap>
                                          {finding.actionPlan.owner.map((person, idx) => (
                                            <WrapItem key={idx}>
                                              <Badge colorScheme="green" fontSize="xs">
                                                {person.firstName} {person.lastName}
                                                {person.employeeId && ` (${person.employeeId})`}
                                              </Badge>
                                            </WrapItem>
                                          ))}
                                        </Wrap>
                                      </Box>
                                    )}
                                    {finding.actionPlan.takenBy && finding.actionPlan.takenBy.length > 0 && (
                                      <Box>
                                        <Text fontSize="xs" color={labelColor} mb={1}>
                                          Action Taken By:
                                        </Text>
                                        <Wrap>
                                          {finding.actionPlan.takenBy.map((person, idx) => (
                                            <WrapItem key={idx}>
                                              <Badge colorScheme="teal" fontSize="xs">
                                                {person.firstName} {person.lastName}
                                                {person.employeeId && ` (${person.employeeId})`}
                                              </Badge>
                                            </WrapItem>
                                          ))}
                                        </Wrap>
                                      </Box>
                                    )}
                                  </VStack>
                                </Box>
                              </>
                            )}

                            {/* Correction Status */}
                            {finding.corrected !== undefined &&
                              finding.corrected !== -1 && (
                                <>
                                  <Divider />
                                  <Box>
                                    <Text fontSize="xs" color={labelColor} mb={2} fontWeight="semibold">
                                      Correction Status:
                                    </Text>
                                    <VStack align="stretch" spacing={2}>
                                      <HStack spacing={2}>
                                        <Badge
                                          colorScheme={
                                            finding.corrected === 1
                                              ? "green"
                                              : "red"
                                          }
                                          fontSize="xs"
                                        >
                                          {finding.corrected === 1
                                            ? "Corrected"
                                            : "Not Corrected"}
                                        </Badge>
                                        {finding.correctionDate && (
                                          <Text fontSize="xs" color={labelColor}>
                                            on {moment(finding.correctionDate).format("MMM D, YYYY")}
                                          </Text>
                                        )}
                                      </HStack>
                                      {finding.remarks && (
                                        <Box>
                                          <Text fontSize="xs" color={labelColor} mb={1}>
                                            Remarks:
                                          </Text>
                                          <Text fontSize="sm" whiteSpace="pre-wrap">
                                            {finding.remarks}
                                          </Text>
                                        </Box>
                                      )}
                                    </VStack>
                                  </Box>
                                </>
                              )}
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};

export default PreviousAuditFindings;
