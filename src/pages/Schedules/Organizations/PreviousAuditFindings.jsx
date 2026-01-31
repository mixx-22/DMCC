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

const PreviousAuditFindings = ({ auditScheduleId, isActive = false }) => {
  const [loading, setLoading] = useState(false);
  const [previousOrganizations, setPreviousOrganizations] = useState([]);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const objectiveBg = useColorModeValue("gray.50", "gray.700");

  const fetchPreviousAuditFindings = useCallback(async () => {
    if (!auditScheduleId) {
      return;
    }

    setLoading(true);
    setError(null);

    if (!USE_API) {
      // Mock data for development
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
                  compliance: "MINOR_NC",
                  description: "Sample finding from previous audit",
                  report: "This is a sample finding report from the previous audit cycle.",
                  objectives: ["obj-1"],
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
      const response = await apiService.request(
        `/organizations?auditScheduleId=${auditScheduleId}`,
        { method: "GET" }
      );
      setPreviousOrganizations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch previous audit findings:", error);
      setError(error.message || "Failed to load previous audit findings");
    } finally {
      setLoading(false);
    }
  }, [auditScheduleId]);

  useEffect(() => {
    // Only fetch if component is active and we have an auditScheduleId
    if (isActive && auditScheduleId) {
      fetchPreviousAuditFindings();
    }
  }, [isActive, auditScheduleId, fetchPreviousAuditFindings]);

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
    (org) => getAllFindings(org).length > 0
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
            <AccordionItem key={organization._id} border="1px" borderColor={borderColor} mb={2}>
              <AccordionButton>
                <HStack flex="1" textAlign="left" spacing={2}>
                  <Avatar size="sm" name={organization.team?.name || "Unknown"} />
                  <Text fontWeight="medium">
                    {organization.team?.name || "Unknown Team"}
                  </Text>
                  <Badge colorScheme="gray" fontSize="xs">
                    {findings.length} {findings.length === 1 ? "Finding" : "Findings"}
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
                            {/* Header with compliance badge */}
                            <HStack justify="space-between">
                              <Badge colorScheme={complianceInfo.color} fontSize="xs">
                                {complianceInfo.label}
                              </Badge>
                              {finding.visitDate && (
                                <Text fontSize="xs" color={labelColor}>
                                  {moment(finding.visitDate.start).format("MMM D, YYYY")}
                                  {finding.visitDate.end &&
                                    ` - ${moment(finding.visitDate.end).format("MMM D, YYYY")}`}
                                </Text>
                              )}
                            </HStack>

                            {/* Objectives */}
                            {finding.objectives && finding.objectives.length > 0 && (
                              <Box>
                                <Text fontSize="xs" color={labelColor} mb={1}>
                                  Related Objectives:
                                </Text>
                                <Wrap>
                                  {finding.objectives.map((objective, idx) => (
                                    <WrapItem key={idx}>
                                      <Badge
                                        bg={objectiveBg}
                                        color={labelColor}
                                        fontSize="xs"
                                      >
                                        {objective.name || objective}
                                      </Badge>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              </Box>
                            )}

                            {/* Description */}
                            {finding.description && (
                              <Box>
                                <Text fontSize="xs" color={labelColor} mb={1}>
                                  Description:
                                </Text>
                                <Text fontSize="sm">{finding.description}</Text>
                              </Box>
                            )}

                            {/* Report */}
                            {finding.report && (
                              <Box>
                                <Text fontSize="xs" color={labelColor} mb={1}>
                                  Report:
                                </Text>
                                <Text fontSize="sm" whiteSpace="pre-wrap">
                                  {finding.report}
                                </Text>
                              </Box>
                            )}

                            {/* Action Plan (if exists) */}
                            {finding.actionPlan && (
                              <>
                                <Divider />
                                <Box>
                                  <Text fontSize="xs" color={labelColor} mb={1}>
                                    Action Plan:
                                  </Text>
                                  <Text fontSize="sm" whiteSpace="pre-wrap">
                                    {finding.actionPlan}
                                  </Text>
                                </Box>
                              </>
                            )}

                            {/* Verification (if exists) */}
                            {finding.corrected !== undefined &&
                              finding.corrected !== -1 && (
                                <>
                                  <Divider />
                                  <Box>
                                    <HStack spacing={2}>
                                      <Badge
                                        colorScheme={
                                          finding.corrected === 1 ? "green" : "red"
                                        }
                                        fontSize="xs"
                                      >
                                        {finding.corrected === 1
                                          ? "Corrected"
                                          : "Not Corrected"}
                                      </Badge>
                                    </HStack>
                                    {finding.verification && (
                                      <Text fontSize="sm" mt={2} whiteSpace="pre-wrap">
                                        {finding.verification}
                                      </Text>
                                    )}
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
