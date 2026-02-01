import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Select,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Tooltip,
  Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { InfoIcon } from "@chakra-ui/icons";
import apiService from "../services/api";
import NcMetricsBarChart from "../components/NcMetricsBarChart";
import NcContributionBarChart from "../components/NcContributionBarChart";

// Create motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionGridItem = motion(GridItem);

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(0, 90, 238, 0.15)",
    transition: { duration: 0.2 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Reusable KPI Card Component with brand colors and animations
const KpiCard = ({
  label,
  value,
  unit = "",
  helpText = "",
  colorScheme = "brandPrimary",
  gradientFrom,
  gradientTo,
  description = "",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  
  // Default gradient colors based on color scheme
  const defaultGradients = {
    brandPrimary: { from: "#005AEE", to: "#4D8CFF" },
    brandSecondary: { from: "#FFD700", to: "#FFEF9E" },
    success: { from: "#10B981", to: "#6EE7B7" },
    warning: { from: "#F59E0B", to: "#FBBF24" },
    error: { from: "#F43F5E", to: "#FDA4AF" },
    purple: { from: "#805AD5", to: "#B794F4" },
    blue: { from: "#3182CE", to: "#63B3ED" }
  };

  const gradient = defaultGradients[colorScheme] || defaultGradients.brandPrimary;
  const fromColor = gradientFrom || gradient.from;
  const toColor = gradientTo || gradient.to;

  return (
    <MotionCard
      bg={cardBg}
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      boxShadow="md"
      variants={cardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Gradient accent bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bgGradient={`linear(to-r, ${fromColor}, ${toColor})`}
      />
      
      <CardBody pt={6}>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="start">
            <Text
              color={labelColor}
              fontSize="sm"
              fontWeight="600"
              letterSpacing="wide"
              textTransform="uppercase"
              noOfLines={2}
              flex="1"
            >
              {label}
            </Text>
            {description && (
              <Tooltip label={description} placement="top" hasArrow>
                <Icon as={InfoIcon} color={labelColor} boxSize={3} mt={0.5} />
              </Tooltip>
            )}
          </HStack>
          
          <HStack align="baseline" spacing={1}>
            <Text
              color={textColor}
              fontSize="4xl"
              fontWeight="bold"
              lineHeight="1"
            >
              {value}
            </Text>
            {unit && (
              <Text color={labelColor} fontSize="xl" fontWeight="semibold">
                {unit}
              </Text>
            )}
          </HStack>
          
          {helpText && (
            <Text fontSize="xs" color={labelColor} noOfLines={2}>
              {helpText}
            </Text>
          )}
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Section Header Component
const SectionHeader = ({ title, description, icon }) => {
  const titleColor = useColorModeValue("gray.800", "white");
  const descColor = useColorModeValue("gray.600", "gray.300");
  
  return (
    <MotionBox
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      mb={6}
    >
      <HStack spacing={3} mb={2}>
        {icon && <Icon as={icon} boxSize={6} color="brandPrimary.500" />}
        <Heading 
          size="lg" 
          color={titleColor}
          fontWeight="700"
          letterSpacing="tight"
        >
          {title}
        </Heading>
      </HStack>
      {description && (
        <Text color={descColor} fontSize="md" maxW="3xl">
          {description}
        </Text>
      )}
    </MotionBox>
  );
};

// Progress Bar with Color Logic and modern styling
const ProgressWithColor = ({ value, label, description }) => {
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const descColor = useColorModeValue("gray.600", "gray.400");
  
  // Determine color based on value
  const getColorScheme = () => {
    if (value >= 90) return { scheme: "success", from: "#10B981", to: "#6EE7B7" };
    if (value >= 70) return { scheme: "warning", from: "#F59E0B", to: "#FBBF24" };
    return { scheme: "error", from: "#F43F5E", to: "#FDA4AF" };
  };

  const { scheme, from, to } = getColorScheme();

  return (
    <MotionBox
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <HStack justify="space-between" mb={3}>
        <VStack align="start" spacing={0} flex="1">
          <Text fontSize="sm" fontWeight="600" color={labelColor}>
            {label}
          </Text>
          {description && (
            <Text fontSize="xs" color={descColor} noOfLines={1}>
              {description}
            </Text>
          )}
        </VStack>
        <Badge
          bgGradient={`linear(to-r, ${from}, ${to})`}
          color="white"
          fontSize="md"
          px={3}
          py={1}
          borderRadius="full"
          fontWeight="bold"
        >
          {value.toFixed(1)}%
        </Badge>
      </HStack>
      <Box position="relative" overflow="hidden" borderRadius="full" bg={useColorModeValue("gray.100", "gray.700")}>
        <MotionBox
          h="12px"
          bgGradient={`linear(to-r, ${from}, ${to})`}
          borderRadius="full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </Box>
    </MotionBox>
  );
};

const AuditKpiDashboard = () => {
  const { auditScheduleId } = useParams();
  const location = useLocation();
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [teamsMap, setTeamsMap] = useState({}); // Map of team IDs to team names
  const [objectivesMap, setObjectivesMap] = useState({}); // Map of objective titles to descriptions

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.600");

  // Fetch teams data to map IDs to names and objectives
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiService.request("/teams");
        const teamsData = Array.isArray(response)
          ? response
          : response?.data || [];

        // Create a map of team ID to team name
        const teamMapping = {};
        // Create a map of objective title to description
        const objectiveMapping = {};

        teamsData.forEach((team) => {
          if (team._id || team.id) {
            teamMapping[team._id || team.id] =
              team.name || team.title || "Unknown Team";
          }

          // Map objectives title to description
          if (team.objectives && Array.isArray(team.objectives)) {
            team.objectives.forEach((obj) => {
              if (obj.title) {
                objectiveMapping[obj.title] = obj.description || "";
              }
            });
          }
        });

        setTeamsMap(teamMapping);
        setObjectivesMap(objectiveMapping);
        console.log("Teams mapping:", teamMapping);
        console.log("Objectives mapping:", objectiveMapping);
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };

    fetchTeams();
  }, []);

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoadingYears(true);
        const response = await apiService.request("/schedules");

        console.log("Schedules response:", response);

        // Handle both direct array and wrapped response
        const schedulesData = Array.isArray(response)
          ? response
          : response?.data || [];

        console.log("Schedules data:", schedulesData);

        if (schedulesData.length > 0) {
          // Extract unique years from schedules
          const uniqueYears = [
            ...new Set(
              schedulesData
                .map((schedule) => {
                  // Try to get year from date.start first
                  if (schedule.date?.start) {
                    return new Date(schedule.date.start).getFullYear();
                  }
                  // Fall back to extracting year from title (e.g., "1st Half Internal Audit 2026")
                  if (schedule.title) {
                    const yearMatch = schedule.title.match(/\b(20\d{2})\b/);
                    if (yearMatch) {
                      return parseInt(yearMatch[1], 10);
                    }
                  }
                  // Fall back to createdAt year
                  if (schedule.createdAt) {
                    return new Date(schedule.createdAt).getFullYear();
                  }
                  return null;
                })
                .filter((year) => year !== null),
            ),
          ].sort((a, b) => b - a); // Sort descending (newest first)

          console.log("Unique years:", uniqueYears);

          setYears(uniqueYears);

          // Set current year as default
          const currentYear = new Date().getFullYear();
          if (uniqueYears.includes(currentYear)) {
            setSelectedYear(currentYear.toString());
          } else if (uniqueYears.length > 0) {
            setSelectedYear(uniqueYears[0].toString());
          }
        }
      } catch (err) {
        console.error("Error fetching years:", err);
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYears();
  }, []);

  // Fetch schedules when year changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedYear) return;

      try {
        setLoadingSchedules(true);
        const response = await apiService.request("/schedules");

        console.log("Schedules response for filtering:", response);

        // Handle both direct array and wrapped response
        const schedulesData = Array.isArray(response)
          ? response
          : response?.data || [];

        if (schedulesData.length > 0) {
          // Filter schedules by selected year using createdAt only and status = 1
          const yearSchedules = schedulesData.filter((schedule) => {
            if (schedule.createdAt && schedule.status === 1) {
              const scheduleYear = new Date(schedule.createdAt).getFullYear();
              return scheduleYear.toString() === selectedYear;
            }
            return false;
          });

          console.log("Year schedules filtered:", yearSchedules);

          setSchedules(yearSchedules);

          // Auto-select 'all' by default
          if (yearSchedules.length > 0) {
            setSelectedSchedule("all");
          } else {
            setSelectedSchedule("");
          }
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [selectedYear]);

  // Fetch KPI data when schedule changes
  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we're on the latest route or have a selected schedule
        const isLatestRoute = location.pathname.includes("/latest/kpis");
        let scheduleId;

        if (isLatestRoute) {
          scheduleId = "latest";
        } else if (selectedSchedule) {
          scheduleId = selectedSchedule;
        } else if (auditScheduleId) {
          scheduleId = auditScheduleId;
        } else {
          // No schedule selected yet, don't fetch
          setLoading(false);
          return;
        }

        console.log("Fetching KPI data for scheduleId:", scheduleId);
        console.log("Selected year:", selectedYear);

        // Build query parameters - always include both year and scheduleId
        const params = new URLSearchParams();

        // Always add year
        if (selectedYear) {
          params.append("year", selectedYear);
        }

        // Always add scheduleId - use comma-separated IDs if all schedules selected
        if (selectedSchedule) {
          if (selectedSchedule === "all") {
            // Send all schedule IDs for the selected year (comma-separated)
            const scheduleIds = schedules.map((s) => s._id).join(",");
            params.append("scheduleId", scheduleIds);
          } else {
            params.append("scheduleId", selectedSchedule);
          }
        }

        // Always use /schedules/latest/kpis with query params
        const queryString = params.toString();
        const endpoint = `/schedules/latest/kpis${queryString ? `?${queryString}` : ""}`;

        console.log("API endpoint:", endpoint);

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout - server not responding")),
            30000,
          ),
        );

        const response = await Promise.race([
          apiService.request(endpoint),
          timeoutPromise,
        ]);

        console.log("KPI Response:", response);

        if (!response || !response.data) {
          throw new Error("No data received from server");
        }

        // Transform the nested API response to match component expectations
        const { auditScheduleKpis, findingsKpis, metadata } = response.data;

        // Helper function to map team IDs to names
        const mapTeamNames = (items) => {
          if (!Array.isArray(items)) return items;
          return items.map((item) => ({
            ...item,
            team: teamsMap[item.team] || item.team || "Unknown Team",
          }));
        };

        // Helper function to map clause descriptions from objectives
        const mapClauseDescriptions = (items) => {
          if (!Array.isArray(items)) return items;
          return items.map((item) => ({
            ...item,
            description: objectivesMap[item.clause] || item.description || "",
          }));
        };

        const transformedData = {
          // Audit schedule KPIs
          auditCompletionRate: auditScheduleKpis?.auditCompletionRate || 0,
          auditExecutionRate: auditScheduleKpis?.auditExecutionRate || 0,
          averageAuditDuration: auditScheduleKpis?.averageAuditDuration || 0,
          totalOrganizations: auditScheduleKpis?.totalOrganizations || 0,

          // Findings KPIs
          totalFindings: findingsKpis?.totalFindings || 0,
          nonConformityRate: findingsKpis?.nonConformityRate || 0,

          // Map major/minor to MAJOR_NC/MINOR_NC format
          majorVsMinorCount: {
            MAJOR_NC: findingsKpis?.majorVsMinorCount?.major || 0,
            MINOR_NC: findingsKpis?.majorVsMinorCount?.minor || 0,
            OBSERVATIONS: findingsKpis?.majorVsMinorCount?.observations || 0,
          },

          correctiveActionClosureRate:
            findingsKpis?.correctiveActionClosureRate || 0,
          findingsPerClause: mapClauseDescriptions(
            findingsKpis?.findingsPerClause || [],
          ),

          // NC Metrics per Team - Map team IDs to names
          ncMetricsPerTeam: mapTeamNames(findingsKpis?.ncMetricsPerTeam || []),

          // Overall NC Percentage and Team Contributions - Map team IDs to names
          overallNcPercentage:
            findingsKpis?.ncContributionPerTeam?.overallNcPercentage ||
            findingsKpis?.overallNcPercentage ||
            0,
          ncContributionPerTeam: mapTeamNames(
            findingsKpis?.ncContributionPerTeam?.teamNcContribution ||
              findingsKpis?.teamNcContribution ||
              [],
          ),

          // Include metadata for reference
          metadata: metadata || {},
        };

        console.log("Transformed KPI data:", transformedData);
        console.log("ncMetricsPerTeam:", transformedData.ncMetricsPerTeam);
        console.log(
          "ncContributionPerTeam:",
          transformedData.ncContributionPerTeam,
        );
        console.log(
          "overallNcPercentage:",
          transformedData.overallNcPercentage,
        );

        setKpiData(transformedData);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load KPI data. Please check if the backend server is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, [
    selectedSchedule,
    selectedYear,
    auditScheduleId,
    location.pathname,
    schedules,
    teamsMap,
    objectivesMap,
  ]);

  // Loading State
  if (loading) {
    return (
      <Container maxW="container.2xl" py={8}>
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minH="60vh"
        >
          <VStack spacing={6}>
            <Box position="relative">
              <Spinner 
                size="xl" 
                thickness="4px"
                speed="0.8s"
                color="brandPrimary.500"
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                <Spinner 
                  size="lg" 
                  thickness="3px"
                  speed="1.2s"
                  color="brandSecondary.500"
                />
              </Box>
            </Box>
            <VStack spacing={2}>
              <Text 
                color={useColorModeValue("gray.700", "gray.200")} 
                fontSize="lg"
                fontWeight="600"
              >
                Loading KPI Dashboard
              </Text>
              <Text 
                color={useColorModeValue("gray.500", "gray.400")} 
                fontSize="sm"
              >
                Fetching audit performance data...
              </Text>
            </VStack>
          </VStack>
        </MotionBox>
      </Container>
    );
  }

  // Error State
  if (error) {
    return (
      <Container maxW="container.2xl" py={8}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert 
            status="error" 
            borderRadius="xl"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            py={12}
            boxShadow="lg"
          >
            <AlertIcon boxSize="50px" mr={0} mb={4} />
            <AlertTitle fontSize="2xl" mb={2}>
              Error Loading Dashboard
            </AlertTitle>
            <AlertDescription fontSize="md" maxW="md">
              {error}
            </AlertDescription>
          </Alert>
        </MotionBox>
      </Container>
    );
  }

  // Empty State
  if (!kpiData) {
    return (
      <Container maxW="container.2xl" py={8}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert 
            status="info" 
            borderRadius="xl"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            py={12}
            boxShadow="lg"
            bgGradient="linear(to-br, info.50, blue.50)"
          >
            <AlertIcon boxSize="50px" mr={0} mb={4} />
            <AlertTitle fontSize="2xl" mb={2}>
              No Data Available
            </AlertTitle>
            <AlertDescription fontSize="md" maxW="md">
              No KPI data found for this audit schedule. Please select a different year or schedule.
            </AlertDescription>
          </Alert>
        </MotionBox>
      </Container>
    );
  }

  return (
    <Container maxW="container.2xl" py={8} px={{ base: 4, md: 6, lg: 8 }}>
      {/* Page Header with brand colors */}
      <MotionBox
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        mb={8}
      >
        <Box
          bgGradient="linear(135deg, brandPrimary.500 0%, brandPrimary.600 50%, brandPrimary.700 100%)"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          color="white"
          position="relative"
          overflow="hidden"
          boxShadow="xl"
        >
          {/* Decorative elements */}
          <Box
            position="absolute"
            top="-20%"
            right="-10%"
            w="300px"
            h="300px"
            borderRadius="full"
            bg="brandSecondary.400"
            opacity={0.1}
            filter="blur(60px)"
          />
          
          <VStack align="start" spacing={3} position="relative" zIndex={1}>
            <Heading size="2xl" fontWeight="800" letterSpacing="tight">
              Audit KPI Dashboard
            </Heading>
            <Text fontSize="lg" opacity={0.95} maxW="2xl">
              Comprehensive performance metrics and insights for your audit schedules
              {kpiData?.metadata?.scheduleTitle && (
                <Text as="span" fontWeight="semibold" ml={2}>
                  • {kpiData.metadata.scheduleTitle}
                </Text>
              )}
            </Text>
          </VStack>
        </Box>
      </MotionBox>

      {/* Filters Section - Modern card */}
      <MotionCard
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        mb={8}
        bg={useColorModeValue("white", "gray.800")}
        borderRadius="xl"
        boxShadow="md"
        overflow="hidden"
      >
        <Box
          bgGradient="linear(to-r, brandSecondary.500, brandSecondary.400)"
          h="3px"
        />
        <CardBody p={6}>
          <HStack spacing={2} mb={4}>
            <Icon as={InfoIcon} color="brandPrimary.500" />
            <Heading size="sm" color={useColorModeValue("gray.700", "gray.100")}>
              Filter Options
            </Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Year Filter */}
            <FormControl>
              <FormLabel 
                fontSize="sm" 
                fontWeight="600" 
                color={useColorModeValue("gray.700", "gray.200")}
              >
                Audit Year
              </FormLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                isDisabled={loadingYears}
                size="lg"
                borderRadius="lg"
                focusBorderColor="brandPrimary.500"
              >
                {years.length === 0 ? (
                  <option>No years available</option>
                ) : (
                  years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Schedule Filter */}
            <FormControl>
              <FormLabel 
                fontSize="sm" 
                fontWeight="600" 
                color={useColorModeValue("gray.700", "gray.200")}
              >
                Schedule Selection
              </FormLabel>
              <Select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                isDisabled={loadingSchedules}
                size="lg"
                borderRadius="lg"
                focusBorderColor="brandPrimary.500"
              >
                {schedules.length === 0 ? (
                  <option>No schedules available</option>
                ) : (
                  <>
                    <option value="all">All Schedules</option>
                    {schedules.map((schedule) => (
                      <option key={schedule._id} value={schedule._id}>
                        {schedule.title ||
                          schedule.auditCode ||
                          "Untitled Schedule"}
                      </option>
                    ))}
                  </>
                )}
              </Select>
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </MotionCard>

      {/* Main KPI Grid - Bento Layout */}
      <MotionBox
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* KPI Summary Section - Bento Grid */}
        <SectionHeader
          title="Performance Metrics"
          description="Key performance indicators tracking audit completion and execution rates"
        />
        
        {/* Asymmetric Bento Grid */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
          gap={6}
          mb={8}
        >
          {/* Audit Completion Rate */}
          <MotionGridItem colSpan={{ base: 1, lg: 1 }} variants={cardVariants}>
            <KpiCard
              label="Audit Completion Rate"
              value={kpiData.auditCompletionRate?.toFixed(1) || 0}
              unit="%"
              helpText="Audits completed vs planned"
              colorScheme={kpiData.auditCompletionRate >= 90 ? "success" : "warning"}
              description="Percentage of scheduled audits that have been completed"
            />
          </MotionGridItem>

          {/* Audit Execution Rate */}
          <MotionGridItem colSpan={{ base: 1, lg: 1 }} variants={cardVariants}>
            <KpiCard
              label="Audit Execution Rate"
              value={kpiData.auditExecutionRate?.toFixed(1) || 0}
              unit="%"
              helpText="Audits executed vs scheduled"
              colorScheme={kpiData.auditExecutionRate >= 90 ? "success" : "warning"}
              description="Percentage of audits that have been executed"
            />
          </MotionGridItem>

          {/* Average Audit Duration - Taller card */}
          <MotionGridItem colSpan={{ base: 1, lg: 1 }} variants={cardVariants}>
            <KpiCard
              label="Average Duration"
              value={kpiData.averageAuditDuration?.toFixed(1) || 0}
              unit="days"
              helpText="Average time per audit"
              colorScheme="blue"
              description="Mean time taken to complete an audit"
            />
          </MotionGridItem>

          {/* Total Findings */}
          <MotionGridItem colSpan={{ base: 1, lg: 1 }} variants={cardVariants}>
            <KpiCard
              label="Total Findings"
              value={kpiData.totalFindings || 0}
              helpText="All findings recorded"
              colorScheme="purple"
              description="Total number of audit findings across all schedules"
            />
          </MotionGridItem>
        </Grid>

        {/* Non-Conformity Analysis - Wide card */}
        <SectionHeader
          title="Non-Conformity Analysis"
          description="Detailed breakdown of non-conformity rates and their impact on overall quality"
        />
        
        <Grid
          templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
          gap={6}
          mb={8}
        >
          {/* NC Rate - Takes 1 column */}
          <MotionGridItem colSpan={{ base: 1, lg: 1 }} variants={cardVariants}>
            <KpiCard
              label="Non-Conformity Rate"
              value={kpiData.nonConformityRate?.toFixed(1) || 0}
              unit="%"
              helpText="NC findings vs total findings"
              colorScheme={kpiData.nonConformityRate > 10 ? "error" : "success"}
              description="Percentage of findings that are non-conformities"
            />
          </MotionGridItem>

          {/* Major/Minor NC Breakdown - Takes 2 columns */}
          <MotionGridItem colSpan={{ base: 1, lg: 2 }} variants={cardVariants}>
            <MotionCard
              bg={useColorModeValue("white", "gray.800")}
              borderRadius="xl"
              boxShadow="md"
              overflow="hidden"
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0, 90, 238, 0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <Box
                bgGradient="linear(to-r, error.500, error.400)"
                h="4px"
              />
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Heading size="sm" color={useColorModeValue("gray.700", "gray.100")}>
                      Findings Breakdown
                    </Heading>
                    <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")}>
                      Distribution of major and minor non-conformities
                    </Text>
                  </VStack>
                </HStack>
              </CardHeader>
              <CardBody pt={2}>
                <HStack spacing={6} justify="space-around">
                  <VStack spacing={2}>
                    <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")} fontWeight="600" textTransform="uppercase">
                      Major NC
                    </Text>
                    <Box
                      bgGradient="linear(to-br, error.500, error.600)"
                      color="white"
                      fontSize="3xl"
                      fontWeight="bold"
                      px={6}
                      py={3}
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      {kpiData.majorVsMinorCount?.MAJOR_NC || 0}
                    </Box>
                  </VStack>
                  
                  <Divider orientation="vertical" h="80px" />
                  
                  <VStack spacing={2}>
                    <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")} fontWeight="600" textTransform="uppercase">
                      Minor NC
                    </Text>
                    <Box
                      bgGradient="linear(to-br, warning.500, warning.600)"
                      color="white"
                      fontSize="3xl"
                      fontWeight="bold"
                      px={6}
                      py={3}
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      {kpiData.majorVsMinorCount?.MINOR_NC || 0}
                    </Box>
                  </VStack>

                  <Divider orientation="vertical" h="80px" />
                  
                  <VStack spacing={2}>
                    <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")} fontWeight="600" textTransform="uppercase">
                      Observations
                    </Text>
                    <Box
                      bgGradient="linear(to-br, info.500, info.600)"
                      color="white"
                      fontSize="3xl"
                      fontWeight="bold"
                      px={6}
                      py={3}
                      borderRadius="xl"
                      boxShadow="md"
                    >
                      {kpiData.majorVsMinorCount?.OBSERVATIONS || 0}
                    </Box>
                  </VStack>
                </HStack>
              </CardBody>
            </MotionCard>
          </MotionGridItem>
        </Grid>

        {/* Corrective Action Closure Rate */}
        <MotionCard
          variants={cardVariants}
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="xl"
          boxShadow="md"
          overflow="hidden"
          mb={8}
        >
          <Box bgGradient="linear(to-r, success.500, success.400)" h="3px" />
          <CardBody p={6}>
            <ProgressWithColor
              value={kpiData.correctiveActionClosureRate || 0}
              label="Corrective Action Closure Rate"
              description="Percentage of corrective actions that have been completed and closed"
            />
          </CardBody>
        </MotionCard>

        {/* Clause-Based Findings Table */}
        <SectionHeader
          title="Findings by ISO Clause"
          description="Detailed breakdown of findings mapped to specific ISO standard clauses"
        />
        
        <MotionCard
          variants={cardVariants}
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="xl"
          boxShadow="md"
          overflow="hidden"
          mb={8}
        >
          <Box bgGradient="linear(to-r, brandPrimary.500, purple.500)" h="3px" />
          <CardBody p={0}>
            {kpiData.findingsPerClause && kpiData.findingsPerClause.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                    <Tr>
                      <Th fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider">
                        ISO Clause
                      </Th>
                      <Th fontWeight="700" textTransform="uppercase" fontSize="xs" letterSpacing="wider">
                        Description
                      </Th>
                      <Th 
                        isNumeric 
                        fontWeight="700" 
                        textTransform="uppercase" 
                        fontSize="xs" 
                        letterSpacing="wider"
                      >
                        Count
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {kpiData.findingsPerClause.map((item, index) => (
                      <Tr
                        key={index}
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.700"),
                        }}
                        transition="background 0.2s"
                      >
                        <Td fontWeight="600" color={useColorModeValue("brandPrimary.600", "brandPrimary.300")}>
                          {item.clause || "N/A"}
                        </Td>
                        <Td 
                          color={useColorModeValue("gray.600", "gray.300")}
                          maxW="400px"
                          isTruncated
                          title={item.description}
                        >
                          {item.description || "N/A"}
                        </Td>
                        <Td isNumeric>
                          <Badge
                            bgGradient={item.count > 5 ? "linear(to-r, error.500, error.600)" : "linear(to-r, brandPrimary.500, brandPrimary.600)"}
                            color="white"
                            fontSize="md"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontWeight="bold"
                          >
                            {item.count}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box p={12} textAlign="center">
                <Text color={useColorModeValue("gray.500", "gray.400")} fontSize="lg">
                  No findings recorded for selected schedules
                </Text>
              </Box>
            )}
          </CardBody>
        </MotionCard>

        {/* NC and Findings per Team Chart */}
        {kpiData.ncMetricsPerTeam && kpiData.ncMetricsPerTeam.length > 0 && (
          <>
            <SectionHeader
              title="Team Performance Metrics"
              description="Non-conformities and findings breakdown by team"
            />
            
            <MotionCard
              variants={cardVariants}
              bg={useColorModeValue("white", "gray.800")}
              borderRadius="xl"
              boxShadow="md"
              overflow="hidden"
              mb={8}
            >
              <Box bgGradient="linear(to-r, blue.500, purple.500)" h="3px" />
              <CardBody p={6}>
                <NcMetricsBarChart
                  data={kpiData.ncMetricsPerTeam}
                  loading={loading}
                />
              </CardBody>
            </MotionCard>
          </>
        )}

        {/* Team Contribution Chart */}
        <SectionHeader
          title="Team Contribution Analysis"
          description="Each team's contribution to the overall non-conformity percentage"
        />
        
        <MotionCard
          variants={cardVariants}
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="xl"
          boxShadow="md"
          overflow="hidden"
        >
          <Box bgGradient="linear(to-r, purple.500, pink.500)" h="3px" />
          <CardBody p={6}>
            <NcContributionBarChart
              overallNcPercentage={kpiData.overallNcPercentage}
              data={kpiData.ncContributionPerTeam}
              loading={loading}
            />
          </CardBody>
        </MotionCard>
      </MotionBox>
    </Container>
  );
};

export default AuditKpiDashboard;
