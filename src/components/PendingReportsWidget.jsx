import { useEffect, useRef, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  HStack,
  useColorModeValue,
  SimpleGrid,
  Center,
  Tooltip,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import apiService from "../services/api";
import TooltipAvatar from "./TooltipAvatar";
import moment from "moment";
// import FindingsList from "../pages/Schedules/Organizations/FindingsList";

// Utility: filter organizations (teams) with no verdict
const filterOrganizationsWithNoVerdict = (orgs) =>
  orgs.filter((org) => !org.verdict || org.verdict === "");

const PendingReportsWidget = ({ limit = 3, showAllButton = true }) => {
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
        // For each audit, fetch organizations and filter for those with no verdict
        const auditsWithOrgs = await Promise.all(
          data.map(async (audit) => {
            try {
              const orgRes = await apiService.request("/organizations", {
                method: "GET",
                params: { auditScheduleId: audit._id || audit.id },
              });
              const orgs = orgRes.data || orgRes.organizations || [];
              const orgsNoVerdict = filterOrganizationsWithNoVerdict(orgs);
              return orgsNoVerdict.length
                ? {
                    ...audit,
                    organizations: orgsNoVerdict,
                  }
                : null;
            } catch {
              return null;
            }
          }),
        );
        const filtered = auditsWithOrgs.filter(Boolean);
        setAudits(filtered);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load audits or organizations");
        setAudits([]);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const auditsToShow = showAll ? audits : audits.slice(0, limit);

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
      mb={8}
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
            Pending
          </Box>
          <Heading size="sm" color={folderText} fontWeight="bold">
            Reports
          </Heading>
        </HStack>
        {showAllButton && audits.length > limit && (
          <Box>
            <Text
              as="button"
              color="purple.600"
              fontWeight="bold"
              onClick={() => setShowAll((v) => !v)}
              _hover={{ textDecoration: "underline" }}
            >
              {showAll ? "Show Less" : "Show All"}
            </Text>
          </Box>
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
            No organizations with pending verdict found.
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
                <SimpleGrid columns={columns} spacing={2}>
                  {audit.organizations.map((org) => {
                    // Get leader info for avatar (first leader or fallback)
                    const teamId = org.team?.id || org.id || "Organization";
                    const teamImage =
                      org.team?.image || org.image || "Organization";
                    const teamName =
                      org.team?.name || org.name || "Organization";
                    // Get all findings for this org (from all visits)
                    const findings = (org.visits || []).flatMap(
                      (v) => v.findings || [],
                    );
                    // Get latest visit by date
                    let visit = null;
                    if (org.visits && org.visits.length > 0) {
                      visit = org.visits.reduce((latest, v) => {
                        const date = v?.date?.start;
                        if (!date) return latest;
                        if (!latest) return v;
                        return moment(date).isAfter(moment(latest.date?.start))
                          ? v
                          : latest;
                      }, null);
                    }
                    const visitDate = visit?.date?.start || null;
                    let isPast = false;
                    if (visitDate) {
                      isPast = moment(visitDate).isBefore(moment(), "day");
                    }
                    return (
                      <Box
                        key={org._id || org.id}
                        borderRadius="md"
                        borderWidth={1}
                        borderColor={itemHoverBg}
                        bg={minimalistBg}
                        p={3}
                      >
                        <HStack align="center" spacing={3}>
                          <TooltipAvatar
                            size="sm"
                            name={teamName}
                            id={teamId}
                            image={teamImage}
                            label={teamName}
                          />
                          <Box flex={1}>
                            <Text fontWeight="bold" fontSize="sm">
                              {teamName}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {visitDate
                                ? `${isPast ? `Last` : `Next`} Visit: ${moment(visitDate).format("MMM DD, YYYY")}`
                                : `No Visits Set`}
                            </Text>
                          </Box>
                          <Center>
                            <Tooltip
                              label={`${findings.length} finding${findings.length !== 1 ? "s" : ""}`}
                            >
                              <Text fontSize="xs" opacity={0.6}>
                                ({findings.length})
                              </Text>
                            </Tooltip>
                          </Center>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default PendingReportsWidget;
