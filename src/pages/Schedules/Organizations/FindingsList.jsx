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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiTrash2,
  FiFileText,
} from "react-icons/fi";
import moment from "moment";

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
};

const FindingCard = ({ finding, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const reportBg = useColorModeValue("gray.50", "gray.800");

  const complianceInfo =
    COMPLIANCE_DISPLAY[finding.compliance] || COMPLIANCE_DISPLAY.OBSERVATIONS;

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
              <Badge colorScheme={complianceInfo.color} fontSize="xs">
                {complianceInfo.label}
              </Badge>
              {finding.objective && (
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
            <HStack spacing={1}>
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
                  onClick={() => onEdit(finding)}
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

              {/* Report Section */}
              {finding.report && (
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
                    {/* Report Number */}
                    {finding.report.reportNo && (
                      <HStack spacing={2}>
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
                      <HStack spacing={2}>
                        <Text fontSize="xs" color={labelColor} minW="80px">
                          Date Issued:
                        </Text>
                        <Text fontSize="sm">
                          {moment(finding.report.date).format("MMMM DD, YYYY")}
                        </Text>
                      </HStack>
                    )}

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

                    {/* Auditee and Auditor */}
                    <Wrap spacing={4} pt={1}>
                      {finding.report.auditee && (
                        <WrapItem>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color={labelColor}>
                              Auditee:
                            </Text>
                            <Tooltip label={finding.report.auditee.name}>
                              <HStack spacing={1}>
                                <Avatar
                                  size="xs"
                                  name={finding.report.auditee.name}
                                />
                                <Text fontSize="sm">
                                  {finding.report.auditee.name}
                                </Text>
                              </HStack>
                            </Tooltip>
                          </HStack>
                        </WrapItem>
                      )}
                      {finding.report.auditor && (
                        <WrapItem>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color={labelColor}>
                              Auditor:
                            </Text>
                            <Tooltip label={finding.report.auditor.name}>
                              <HStack spacing={1}>
                                <Avatar
                                  size="xs"
                                  name={finding.report.auditor.name}
                                />
                                <Text fontSize="sm">
                                  {finding.report.auditor.name}
                                </Text>
                              </HStack>
                            </Tooltip>
                          </HStack>
                        </WrapItem>
                      )}
                    </Wrap>
                  </VStack>
                </Box>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
};

const FindingsList = ({ findings = [], onEdit, onDelete }) => {
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
          key={index}
          finding={finding}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </VStack>
  );
};

export default FindingsList;
