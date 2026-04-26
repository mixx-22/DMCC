import { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  Spinner,
  HStack,
  useColorModeValue,
  Avatar,
  SimpleGrid,
  Spacer,
  Tooltip,
  Badge,
  Flex,
  Stack,
  Center,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import apiService from "../services/api";
import { useUser } from "../context/_useContext";

// Compliance badge display (copied from ReportsTab)
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

// Utility: filter only pending MINOR_NC and MAJOR_NC findings
const filterPendingNCFindings = (findings) =>
  findings.filter((f) => {
    const compliance = f.currentCompliance || f.compliance;
    if (compliance !== "MINOR_NC" && compliance !== "MAJOR_NC") return false;
    const latest = f.actionPlans?.[f.actionPlans.length - 1];
    const status = latest?.corrected;
    return !latest || status === 0 || status === -1;
  });

const normalizeRoles = (user) => {
  const roles = [].concat(user?.role || user?.roles || []);
  return roles.filter(Boolean);
};

const isTeamLeader = (user) =>
  normalizeRoles(user).some((role) => {
    if (!role) return false;
    const roleTypes = []
      .concat(role?.roleTypes || role?.type || [])
      .map((value) => String(value).toLowerCase());
    if (roleTypes.includes("teamleader")) return true;

    const title =
      typeof role === "string" ? role : role?.title || role?.name || role?.role;
    const normalizedTitle = String(title || "").toLowerCase();
    return (
      normalizedTitle.includes("team leader") ||
      normalizedTitle.includes("teamlead")
    );
  }) ||
  String(user?.position || "").toLowerCase().includes("team leader");

const pickUserDepartmentCandidates = (user) => {
  const teams = []
    .concat(user?.team || user?.teams || [])
    .filter(Boolean)
    .flatMap((team) => {
      if (typeof team === "object") {
        return [
          team?.teamId,
          team?.id,
          team?._id,
          team?.name,
          team?.department,
        ].filter(Boolean);
      }
      return [team];
    });

  return [...teams, user?.department, user?.teamId]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
};

const organizationMatchesDepartment = (org, departmentCandidates) => {
  if (!departmentCandidates.length) return true;
  const team =
    typeof org?.team === "object"
      ? org.team
      : { id: org?.team, teamId: org?.teamId, name: org?.teamName };
  const orgCandidates = [
    team?.id,
    team?._id,
    team?.name,
    team?.teamId,
    org?.teamId,
    org?.teamName,
    org?.department,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return orgCandidates.some((candidate) =>
    departmentCandidates.includes(candidate),
  );
};

const OngoingReportsWidget = ({ limit = 3, showAllButton = true }) => {
  const { user } = useUser();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [columns, setColumns] = useState(1);
  const widgetRef = useRef();

  const itemBg = useColorModeValue("gray.50", "gray.900");
  const itemHoverBg = useColorModeValue("gray.100", "gray.700");
  const titleColor = useColorModeValue("purple.700", "purple.200");
  const folderBg = useColorModeValue("pink.300", "pink.600");
  const folderText = useColorModeValue("gray.700", "gray.700");
  const folderBorder = useColorModeValue("pink.400", "pink.700");
  const minimalistBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    function handleResize() {
      if (!widgetRef.current) return;
      const width = widgetRef.current.offsetWidth;
      if (width < 400) setColumns(1);
      else if (width < 700) setColumns(2);
      else setColumns(3);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService
      .request("/schedules", {
        method: "GET",
        params: { page: 1, limit: 20, status: 0 },
      })
      .then(async (res) => {
        if (!mounted) return;
        const data = res.data || res.schedules || [];
        const userIsTeamLeader = isTeamLeader(user);
        const departmentCandidates = pickUserDepartmentCandidates(user);
        // For each audit, fetch organizations and filter for pending MINOR_NC/MAJOR_NC reports
        const auditsWithReports = await Promise.all(
          data.map(async (audit) => {
            try {
              const orgRes = await apiService.request("/organizations", {
                method: "GET",
                params: { auditScheduleId: audit._id || audit.id },
              });
              const orgs = orgRes.data || orgRes.organizations || [];
              const scopedOrgs = userIsTeamLeader
                ? orgs.filter((org) =>
                    organizationMatchesDepartment(org, departmentCandidates),
                  )
                : orgs;
              // Collect all findings for all organizations
              const findings = scopedOrgs.flatMap((org) =>
                (org.visits || []).flatMap((v, vi) =>
                  (v.findings || []).map((f) => ({
                    ...f,
                    visitIndex: vi,
                    organizationId: org._id,
                    team: org.team,
                  })),
                ),
              );
              // Only keep audits with pending MINOR_NC/MAJOR_NC findings
              const pendingFindings = filterPendingNCFindings(findings);
              return pendingFindings.length
                ? {
                    ...audit,
                    findings: pendingFindings,
                    organizations: scopedOrgs,
                  }
                : null;
            } catch {
              return null;
            }
          }),
        );
        const filtered = auditsWithReports.filter(Boolean);
        setAudits(filtered);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load audits or reports");
        setAudits([]);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [user]);

  const auditsToShow = showAll ? audits : audits.slice(0, limit);

  return (
    <Box
      ref={widgetRef}
      borderRadius="2xl"
      borderWidth={2}
      borderColor={folderBorder}
      bg={folderBg}
      p={0}
      w="full"
      boxShadow="md"
      overflow="hidden"
      position="relative"
    >
      <HStack p={4} justify="space-between">
        <HStack spacing={2}>
          <Box
            bg={folderText}
            color={folderBg}
            px={2}
            py={0.5}
            borderRadius="md"
            fontWeight="bold"
            fontSize="xs"
            letterSpacing="wide"
            textTransform="uppercase"
          >
            Ongoing
          </Box>
          <Heading size="sm" color={folderText} fontWeight="bold">
            Reports
          </Heading>
        </HStack>
        {showAllButton && audits.length > limit && (
          <Button
            size="sm"
            colorScheme="gray"
            variant="ghost"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show Less" : "Show All"}
          </Button>
        )}
      </HStack>
      <Box bg={minimalistBg}>
        {loading ? (
          <HStack justify="center" py={8}>
            <Spinner size="lg" />
          </HStack>
        ) : error ? (
          <Text color="red.500" py={6} align="center">
            {error}
          </Text>
        ) : auditsToShow.length === 0 ? (
          <Text color="gray.500" py={6} align="center">
            No ongoing reports found.
          </Text>
        ) : (
          <VStack align="stretch" spacing={4} mb={showAllButton ? 4 : 0}>
            {auditsToShow.map((audit) => (
              <Box
                key={audit._id || audit.id}
                bg={itemBg}
                _hover={{ bg: itemHoverBg }}
                p={4}
                transition="background 0.2s"
              >
                <HStack mb={2} align="center">
                  <Text fontWeight="bold" color={titleColor} fontSize="md">
                    {audit.title ||
                      audit.name ||
                      `Audit #${audit._id || audit.id}`}
                  </Text>
                  <Spacer />
                  <Button
                    as={RouterLink}
                    to={`/audit-schedule/${audit._id || audit.id}`}
                    size="sm"
                    colorScheme="purple"
                    variant="ghost"
                  >
                    View Audit
                  </Button>
                </HStack>
                {(() => {
                  const orgMap = {};
                  audit.findings.forEach((finding) => {
                    const compliance =
                      finding.currentCompliance || finding.compliance;
                    if (compliance !== "MINOR_NC" && compliance !== "MAJOR_NC")
                      return;
                    const orgId = finding.organizationId;
                    if (!orgMap[orgId]) orgMap[orgId] = [];
                    orgMap[orgId].push(finding);
                  });
                  const orgs = Object.entries(orgMap);
                  const showOrgs = orgs.slice(0, 2);
                  const moreOrgsCount = orgs.length - showOrgs.length;
                  return (
                    <>
                      {showOrgs.map(([orgId, findings]) => {
                        const org =
                          (audit.organizations || []).find(
                            (o) => o._id === orgId,
                          ) || {};
                        const orgName =
                          org.team?.name || org.name || "Organization";
                        const showFindings = findings.slice(0, 2);
                        const moreCount = findings.length - showFindings.length;
                        return (
                          <Box key={orgId} mb={0} _notLast={{ mb: 4 }}>
                            <Flex mb={1}>
                              <HStack flex={1}>
                                <Avatar size="xs" name={orgName} />
                                <Text fontWeight="bold">
                                  {orgName}
                                  <Text
                                    as="span"
                                    color="gray.500"
                                    fontWeight="normal"
                                    fontSize="sm"
                                    ml={2}
                                  >
                                    ({findings.length})
                                  </Text>
                                </Text>
                              </HStack>
                              <Center ml={2}>
                                <Tooltip label="Go to Audit">
                                  <Button
                                    as={RouterLink}
                                    to={`/audit-schedule/${audit._id || audit.id}?org=${org?.team?.id}`}
                                    aria-label="Go to Audit"
                                    rightIcon={<FiArrowRight />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="purple"
                                    borderRadius="full"
                                    sx={
                                      moreCount < 1
                                        ? { ">span": { ml: 0 } }
                                        : {}
                                    }
                                  >
                                    {moreCount > 0
                                      ? `View ${moreCount} more report $s{moreCount > 1 ? "s" : ""} for ${orgName}`
                                      : ``}
                                  </Button>
                                </Tooltip>
                              </Center>
                            </Flex>
                            <SimpleGrid columns={columns} spacing={1}>
                              {showFindings.map((finding, idx) => {
                                const compliance =
                                  finding.currentCompliance ||
                                  finding.compliance;
                                const complianceInfo =
                                  COMPLIANCE_DISPLAY[compliance] ||
                                  COMPLIANCE_DISPLAY.OBSERVATIONS;
                                return (
                                  <Box
                                    py={1}
                                    px={2}
                                    key={finding._id || idx}
                                    borderRadius="md"
                                    bg={minimalistBg}
                                    borderWidth={1}
                                    borderColor={itemHoverBg}
                                  >
                                    <Stack spacing={1} flex="1">
                                      <Box>
                                        <Badge
                                          size="xs"
                                          fontSize="2xs"
                                          colorScheme={complianceInfo.color}
                                        >
                                          {complianceInfo.label}
                                        </Badge>
                                      </Box>
                                      <Text
                                        fontWeight="semibold"
                                        fontSize="xs"
                                        noOfLines={2}
                                      >
                                        {finding.title}
                                      </Text>
                                    </Stack>
                                  </Box>
                                );
                              })}
                            </SimpleGrid>
                          </Box>
                        );
                      })}
                      {moreOrgsCount > 0 && (
                        <Button
                          w="full"
                          as={RouterLink}
                          to={`/audit-schedule/${audit._id || audit.id}`}
                          size="sm"
                          colorScheme="purple"
                          variant="ghost"
                          color={titleColor}
                          mt={2}
                        >
                          View {moreOrgsCount} More Organization
                          {moreOrgsCount > 1 ? "s" : ""}
                        </Button>
                      )}
                    </>
                  );
                })()}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default OngoingReportsWidget;
