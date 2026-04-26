import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  SimpleGrid,
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
  Grid,
  GridItem,
  Icon,
  Tooltip,
  Container,
  Stack,
  ButtonGroup,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Center,
  InputGroup,
  Input,
  IconButton,
  InputLeftElement,
  TableContainer,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion"; // v10.16.16 - Used for smooth animations and transitions
import { InfoIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FiSearch, FiPrinter } from "react-icons/fi";
import { format } from "date-fns";
import { useUser } from "../context/_useContext";
import apiService from "../services/api";
import NcMetricsBarChart from "../components/NcMetricsBarChart";
import NcContributionBarChart from "../components/NcContributionBarChart";
import PageFooter from "../components/PageFooter";

// Constants
const HIGH_FINDING_COUNT_THRESHOLD = 5; // Threshold for highlighting high finding counts

// Create motion components for animations
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionGridItem = motion(GridItem);

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 24px rgba(0, 90, 238, 0.15)",
    transition: { duration: 0.2 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Reusable KPI Card Component with brand colors and animations
// Note: brandPrimary and brandSecondary colors are defined in src/theme/colors.tsx
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
  // Maps to colors defined in theme configuration (src/theme/colors.tsx)
  const defaultGradients = {
    brandPrimary: { from: "#005AEE", to: "#4D8CFF" },
    brandSecondary: { from: "#FFD700", to: "#FFEF9E" },
    success: { from: "#10B981", to: "#6EE7B7" },
    warning: { from: "#F59E0B", to: "#FBBF24" },
    error: { from: "#F43F5E", to: "#FDA4AF" },
    purple: { from: "#805AD5", to: "#B794F4" },
    blue: { from: "#3182CE", to: "#63B3ED" },
  };

  const gradient =
    defaultGradients[colorScheme] || defaultGradients.brandPrimary;
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
      h="full"
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
const ProgressWithColor = ({ value, label, description, progressBarBg }) => {
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const descColor = useColorModeValue("gray.600", "gray.400");

  // Determine color based on value
  const getColorScheme = () => {
    if (value >= 90)
      return { scheme: "success", from: "#10B981", to: "#6EE7B7" };
    if (value >= 70)
      return { scheme: "warning", from: "#F59E0B", to: "#FBBF24" };
    return { scheme: "error", from: "#F43F5E", to: "#FDA4AF" };
  };

  const { from, to } = getColorScheme();

  return (
    <MotionBox variants={cardVariants} initial="hidden" animate="visible">
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
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="full"
        bg={progressBarBg}
      >
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
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
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

  // Header states (matching main dashboard)
  const [greeting, setGreeting] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Color mode values - extracted to avoid inline usage
  const tableHeaderBg = useColorModeValue("gray.50", "gray.600");
  const greetingColor = useColorModeValue("gray.500", "gray.300");
  const dateColor = useColorModeValue("gray.400", "gray.400");
  const whiteBg = useColorModeValue("white", "gray.800");
  const progressBarBg = useColorModeValue("gray.100", "gray.700");
  const textPrimaryColor = useColorModeValue("gray.700", "gray.200");
  const textSecondaryColor = useColorModeValue("gray.500", "gray.400");
  const textTertiaryColor = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.700", "gray.100");
  const tableHoverBg = useColorModeValue("gray.50", "gray.700");
  const clauseColor = useColorModeValue("brandPrimary.600", "brandPrimary.300");

  const currentDate = format(new Date(), "EEEE, MMMM d");

  // Route constants
  const AUDIT_SCHEDULES_ROUTE = "/audit-schedules";

  // Set greeting based on time of day (matching main dashboard)
  useEffect(() => {
    const hour = new Date().getHours();
    const greetings = [
      { range: [0, 5], text: "Good night" },
      { range: [5, 12], text: "Good morning" },
      { range: [12, 17], text: "Good afternoon" },
      { range: [17, 22], text: "Good evening" },
      { range: [22, 24], text: "Good night" },
    ];

    const currentGreeting = greetings.find(
      (g) => hour >= g.range[0] && hour < g.range[1],
    );
    setGreeting(currentGreeting?.text || "Hello");
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchKeyword.trim()) {
      navigate(
        `${AUDIT_SCHEDULES_ROUTE}?keyword=${encodeURIComponent(searchKeyword.trim())}`,
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get selected year name for display
  const selectedYearDisplay = useMemo(
    () => selectedYear || "Select Year",
    [selectedYear],
  );

  // Get selected schedule name for display
  const selectedScheduleDisplay = useMemo(() => {
    if (!selectedSchedule) return "Select Schedule";
    if (selectedSchedule === "all") return "All Schedules";
    const schedule = schedules.find((s) => s._id === selectedSchedule);
    return schedule?.title || schedule?.auditCode || "Selected Schedule";
  }, [selectedSchedule, schedules]);

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

        // Handle both direct array and wrapped response
        const schedulesData = Array.isArray(response)
          ? response
          : response?.data || [];

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

          setSchedules(yearSchedules);

          // Auto-select based on number of schedules
          if (yearSchedules.length === 1) {
            setSelectedSchedule(yearSchedules[0]._id);
          } else if (yearSchedules.length > 0) {
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

        const scheduleId = isLatestRoute
          ? "latest"
          : (selectedSchedule ?? auditScheduleId);

        if (!scheduleId) {
          setLoading(false);
          return;
        }

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
            COMPLIANT: findingsKpis?.majorVsMinorCount?.compliant || 0,
            OPPORTUNITIES_FOR_IMPROVEMENT:
              findingsKpis?.majorVsMinorCount?.opportunitiesForImprovement || 0,
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
              <Text color={textPrimaryColor} fontSize="lg" fontWeight="600">
                Loading KPI Dashboard
              </Text>
              <Text color={textSecondaryColor} fontSize="sm">
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
            bgGradient="linear(to-br, info.50, info.100)"
          >
            <AlertIcon boxSize="50px" mr={0} mb={4} />
            <AlertTitle fontSize="2xl" mb={2}>
              No Data Available
            </AlertTitle>
            <AlertDescription fontSize="md" maxW="md">
              No KPI data found for this audit schedule. Please select a
              different year or schedule.
            </AlertDescription>
          </Alert>
        </MotionBox>
      </Container>
    );
  }

  const handlePrintReport = () => {
    if (!kpiData) return;

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print the KPI report");
        return;
      }

      const printHtml = generateKpiReportHTML();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 150);
      };
    } catch (error) {
      console.error("Error printing KPI report:", error);
      alert("Failed to generate print report: " + error.message);
    }
  };

  const generateKpiReportHTML = () => {
    const brandPrimaryColor = "#6B46C1";
    const reportDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
    const author =
      currentUser?.name ||
      `${currentUser?.firstName} ${currentUser?.lastName}` ||
      "User";
    const scheduleTitle = selectedScheduleDisplay;

    const findingsByClauseRows = (kpiData.findingsPerClause || [])
      .map(
        (item) => `
          <tr>
            <td>${item.clause || "N/A"}</td>
            <td>${item.count || 0}</td>
          </tr>`,
      )
      .join("");

    const teamMetricsRows = (kpiData.ncMetricsPerTeam || [])
      .map(
        (team) => `
          <tr>
            <td>${team.team || "Unknown Team"}</td>
            <td>${team.totalFindings || 0}</td>
            <td>${team.totalNC || 0}</td>
            <td>${team.ncPercentage?.toFixed(1) || 0}%</td>
            <td>${team.ncContributionPercentage?.toFixed(1) || 0}%</td>
          </tr>`,
      )
      .join("");

    const logoBase64 = `data:image/png;base64,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`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Audit KPI Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              padding: 20px;
              background: #fff;
            }
            .header-bar {
              background: ${brandPrimaryColor};
              height: 35px;
              margin: -20px -20px 20px -20px;
            }
            .logo-container {
              text-align: center;
              margin: 20px 0 10px 0;
            }
            .logo {
              height: 50px;
              width: auto;
            }
            .title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 15px 0;
              color: #000;
            }
            .subtitle {
              text-align: center;
              font-size: 14px;
              color: #666;
              margin-bottom: px;
            }
            .section {
              margin-top: 25px;
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 15px;
              text-decoration: underline;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 12px;
            }
            th {
              background: #6B46C1;
              color: white;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #6B46C1;
            }
            td {
              border: 1px solid #ccc;
              padding: 8px;
              vertical-align: top;
              color: #000;
            }
            .metric-table th:nth-child(1) { width: 60%; }
            .metric-table th:nth-child(2) { width: 40%; }
            .metric-name {
              font-weight: 600;
              margin-bottom: 2px;
            }
            .metric-formula {
              font-size: 11px;
              color: #666;
              font-style: italic;
            }
            .findings-table th:nth-child(1) { width: 70%; }
            .findings-table th:nth-child(2) { width: 30%; }
            .team-table th:nth-child(1) { width: 30%; }
            .team-table th:nth-child(2),
            .team-table th:nth-child(3),
            .team-table th:nth-child(4),
            .team-table th:nth-child(5) { width: 17.5%; }
            .no-data {
              text-align: center;
              color: #666;
              font-style: italic;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header-bar"></div>

          <div class="logo-container">
            <img src="${logoBase64}" alt="Company Logo" class="logo" />
          </div>

          <div class="title">
            Audit KPI Report
            <br/>
            ${scheduleTitle}${scheduleTitle && !new RegExp(`\\b${selectedYearDisplay}\\b`).test(scheduleTitle) ? ` ${selectedYearDisplay}` : ""}
          </div>
          <div class="subtitle">Generated by: ${author}</div>
          <div class="subtitle">Generated on: ${reportDate}</div>

          <div class="section">
            <div class="section-title">Performance Metrics</div>
            <table class="metric-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="metric-name">Audit Completion Rate</div>
                    <div class="metric-formula">(Audits Completed / Audits Planned) × 100</div>
                  </td>
                  <td>${kpiData.auditCompletionRate?.toFixed(1) || 0}%</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Audit Execution Rate</div>
                    <div class="metric-formula">(Audits Executed / Audits Scheduled) × 100</div>
                  </td>
                  <td>${kpiData.auditExecutionRate?.toFixed(1) || 0}%</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Average Audit Duration</div>
                    <div class="metric-formula">Total Audit Days / Number of Audits</div>
                  </td>
                  <td>${kpiData.averageAuditDuration?.toFixed(1) || 0} days</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Total Organizations</div>
                  </td>
                  <td>${kpiData.totalOrganizations || 0}</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Total Findings</div>
                  </td>
                  <td>${kpiData.totalFindings || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Non-Conformity Analysis</div>
            <table class="metric-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="metric-name">Non-Conformity Rate</div>
                    <div class="metric-formula">(NC Findings / Total Findings) × 100</div>
                  </td>
                  <td>${kpiData.nonConformityRate?.toFixed(1) || 0}%</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Major Non-Conformities</div>
                  </td>
                  <td>${kpiData.majorVsMinorCount?.MAJOR_NC || 0}</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Minor Non-Conformities</div>
                  </td>
                  <td>${kpiData.majorVsMinorCount?.MINOR_NC || 0}</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Observations</div>
                  </td>
                  <td>${kpiData.majorVsMinorCount?.OBSERVATIONS || 0}</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Compliant</div>
                  </td>
                  <td>${kpiData.majorVsMinorCount?.COMPLIANT || 0}</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Opportunities for Improvement</div>
                  </td>
                  <td>${kpiData.majorVsMinorCount?.OPPORTUNITIES_FOR_IMPROVEMENT || 0}</td>
                </tr>
                <tr>
                  <td>
                    <div class="metric-name">Corrective Action Closure Rate</div>
                    <div class="metric-formula">(Closed Corrective Actions / Total Corrective Actions) × 100</div>
                  </td>
                  <td>${kpiData.correctiveActionClosureRate?.toFixed(1) || 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Findings by ISO Clause</div>
            <table class="findings-table">
              <thead>
                <tr>
                  <th>Clause</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${findingsByClauseRows || '<tr><td colspan="2" class="no-data">No findings recorded for selected schedules</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Team Performance Metrics</div>
            <table class="team-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Total Findings</th>
                  <th>NC</th>
                  <th>NC %</th>
                  <th>Contribution %</th>
                </tr>
              </thead>
              <tbody>
                ${teamMetricsRows || '<tr><td colspan="5" class="no-data">No team performance data available</td></tr>'}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            variant="outline"
            colorScheme="brandPrimary"
            leftIcon={<FiPrinter />}
            onClick={handlePrintReport}
            isDisabled={!kpiData}
          >
            Print KPI Report
          </Button>
        </Flex>
      </PageFooter>
      <Container maxW="container.2xl" py={8} px={{ base: 4, md: 6, lg: 8 }}>
        {/* Page Header - Matching Main Dashboard Style */}
        <MotionBox
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          mb={8}
        >
          <Stack
            spacing={4}
            flexDir="column"
            alignItems="center"
            justifyContent="center"
          >
            {/* Greeting Section */}
            <Center flexDir="column">
              <Text
                textAlign="center"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="300"
                color={greetingColor}
              >
                {greeting},{" "}
                {currentUser?.firstName || currentUser?.name || "User"}
              </Text>
              <Text
                textAlign="center"
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="300"
                color={dateColor}
              >
                {currentDate}
              </Text>
            </Center>

            {/* Filters as Button Group (Team Stats Style) */}
            <Box>
              <ButtonGroup isAttached variant="teamStats" size="sm">
                {/* Year Filter */}
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    borderRightRadius={0}
                    isDisabled={loadingYears}
                  >
                    Year: {selectedYearDisplay}
                  </MenuButton>
                  <MenuList>
                    {years.length === 0 ? (
                      <MenuItem isDisabled>No years available</MenuItem>
                    ) : (
                      years.map((year) => (
                        <MenuItem
                          key={year}
                          onClick={() => setSelectedYear(year.toString())}
                        >
                          {year}
                        </MenuItem>
                      ))
                    )}
                  </MenuList>
                </Menu>

                {/* Schedule Filter */}
                {schedules.length === 1 ? (
                  <Button
                    borderRadius={
                      selectedScheduleDisplay !==
                      kpiData?.metadata?.scheduleTitle
                        ? 0
                        : "md"
                    }
                    isDisabled={loadingSchedules || !selectedYear}
                  >
                    {selectedScheduleDisplay}
                  </Button>
                ) : (
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      borderRadius={
                        selectedScheduleDisplay !==
                        kpiData?.metadata?.scheduleTitle
                          ? 0
                          : "md"
                      }
                      isDisabled={loadingSchedules || !selectedYear}
                    >
                      {selectedScheduleDisplay}
                    </MenuButton>
                    <MenuList>
                      {schedules.length === 0 ? (
                        <MenuItem isDisabled>No schedules available</MenuItem>
                      ) : (
                        <>
                          <MenuItem onClick={() => setSelectedSchedule("all")}>
                            All Schedules
                          </MenuItem>
                          {schedules.map((schedule) => (
                            <MenuItem
                              key={schedule._id}
                              onClick={() => setSelectedSchedule(schedule._id)}
                            >
                              {schedule.title ||
                                schedule.auditCode ||
                                "Untitled Schedule"}
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </MenuList>
                  </Menu>
                )}

                {/* Stats Display */}
                {selectedScheduleDisplay !==
                  kpiData?.metadata?.scheduleTitle && (
                  <Button borderLeftRadius={0}>
                    {kpiData?.metadata?.scheduleTitle || "Audit KPIs"}
                  </Button>
                )}
              </ButtonGroup>
            </Box>

            {/* Search Input */}
            <Box w="full" maxW="md">
              <InputGroup w="full">
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search audit schedules..."
                  variant="search"
                />
                <InputLeftElement>
                  <IconButton
                    isRound
                    icon={<FiSearch />}
                    onClick={handleSearch}
                    aria-label="Search"
                    variant="ghost"
                    size="sm"
                  />
                </InputLeftElement>
              </InputGroup>
            </Box>
          </Stack>
        </MotionBox>

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
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={6}
            mb={8}
          >
            {/* Audit Completion Rate */}
            <MotionGridItem
              colSpan={{ base: 1, lg: 1 }}
              variants={cardVariants}
            >
              <KpiCard
                label="Audit Completion Rate"
                value={kpiData.auditCompletionRate?.toFixed(1) || 0}
                unit="%"
                helpText="Audits completed vs planned"
                colorScheme={
                  kpiData.auditCompletionRate >= 90 ? "success" : "warning"
                }
                description="Percentage of scheduled audits that have been completed"
              />
            </MotionGridItem>

            {/* Audit Execution Rate */}
            <MotionGridItem
              colSpan={{ base: 1, lg: 1 }}
              variants={cardVariants}
            >
              <KpiCard
                label="Audit Execution Rate"
                value={kpiData.auditExecutionRate?.toFixed(1) || 0}
                unit="%"
                helpText="Audits executed vs scheduled"
                colorScheme={
                  kpiData.auditExecutionRate >= 90 ? "success" : "warning"
                }
                description="Percentage of audits that have been executed"
              />
            </MotionGridItem>

            {/* Average Audit Duration - Taller card */}
            <MotionGridItem
              colSpan={{ base: 1, lg: 1 }}
              variants={cardVariants}
            >
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
            <MotionGridItem
              colSpan={{ base: 1, lg: 1 }}
              variants={cardVariants}
            >
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
            <MotionGridItem
              colSpan={{ base: 1, lg: 1 }}
              variants={cardVariants}
            >
              <KpiCard
                h="full"
                label="Non-Conformity Rate"
                value={kpiData.nonConformityRate?.toFixed(1) || 0}
                unit="%"
                helpText="NC findings vs total findings"
                colorScheme={
                  kpiData.nonConformityRate > 10 ? "error" : "success"
                }
                description="Percentage of findings that are non-conformities"
              />
            </MotionGridItem>

            {/* Major/Minor NC Breakdown - Takes 2 columns */}
            <MotionGridItem
              colSpan={{ base: 1, lg: 2 }}
              variants={cardVariants}
            >
              <MotionCard
                bg={whiteBg}
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
                whileHover={{
                  y: -4,
                  boxShadow: "0 12px 24px rgba(0, 90, 238, 0.15)",
                }}
                transition={{ duration: 0.2 }}
              >
                <Box bgGradient="linear(to-r, error.500, error.400)" h="4px" />
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Heading size="sm" color={headingColor}>
                        Findings Breakdown
                      </Heading>
                      <Text fontSize="xs" color={textTertiaryColor}>
                        Distribution of major and minor non-conformities
                      </Text>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={2}>
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
                    <VStack spacing={2}>
                      <Text
                        fontSize="xs"
                        color={textTertiaryColor}
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        Major NC
                      </Text>
                      <Box
                        bgGradient="linear(to-br, error.500, error.600)"
                        color="white"
                        fontSize="2xl"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        boxShadow="md"
                      >
                        {kpiData.majorVsMinorCount?.MAJOR_NC || 0}
                      </Box>
                    </VStack>

                    <VStack spacing={2}>
                      <Text
                        fontSize="xs"
                        color={textTertiaryColor}
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        Minor NC
                      </Text>
                      <Box
                        bgGradient="linear(to-br, warning.500, warning.600)"
                        color="white"
                        fontSize="2xl"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        boxShadow="md"
                      >
                        {kpiData.majorVsMinorCount?.MINOR_NC || 0}
                      </Box>
                    </VStack>

                    <VStack spacing={2}>
                      <Text
                        fontSize="xs"
                        color={textTertiaryColor}
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        Observations
                      </Text>
                      <Box
                        bgGradient="linear(to-br, info.500, info.600)"
                        color="white"
                        fontSize="2xl"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        boxShadow="md"
                      >
                        {kpiData.majorVsMinorCount?.OBSERVATIONS || 0}
                      </Box>
                    </VStack>

                    <VStack spacing={2}>
                      <Text
                        fontSize="xs"
                        color={textTertiaryColor}
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        Compliant
                      </Text>
                      <Box
                        bgGradient="linear(to-br, green.500, green.600)"
                        color="white"
                        fontSize="2xl"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        boxShadow="md"
                      >
                        {kpiData.majorVsMinorCount?.COMPLIANT || 0}
                      </Box>
                    </VStack>

                    <VStack spacing={2}>
                      <Text
                        fontSize="xs"
                        color={textTertiaryColor}
                        fontWeight="600"
                        textTransform="uppercase"
                      >
                        Opportunities
                      </Text>
                      <Box
                        bgGradient="linear(to-br, purple.500, purple.600)"
                        color="white"
                        fontSize="2xl"
                        fontWeight="bold"
                        px={4}
                        py={2}
                        borderRadius="xl"
                        boxShadow="md"
                      >
                        {kpiData.majorVsMinorCount
                          ?.OPPORTUNITIES_FOR_IMPROVEMENT || 0}
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </CardBody>
              </MotionCard>
            </MotionGridItem>
          </Grid>

          {/* Corrective Action Closure Rate */}
          <MotionCard
            variants={cardVariants}
            bg={whiteBg}
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
                progressBarBg={progressBarBg}
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
            bg={whiteBg}
            borderRadius="xl"
            boxShadow="md"
            overflow="hidden"
            mb={8}
          >
            <Box
              bgGradient="linear(to-r, brandPrimary.500, purple.500)"
              h="3px"
            />
            <CardBody p={0}>
              {kpiData.findingsPerClause &&
              kpiData.findingsPerClause.length > 0 ? (
                <TableContainer maxH="500px" overflowY="auto" tabIndex={0}>
                  <Table variant="simple">
                    <Thead
                      bg={tableHeaderBg}
                      position="sticky"
                      top={0}
                      zIndex={1}
                    >
                      <Tr>
                        <Th
                          fontWeight="700"
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="wider"
                        >
                          ISO Clause
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
                            bg: tableHoverBg,
                          }}
                          transition="background 0.2s"
                        >
                          <Td fontWeight="600" color={clauseColor}>
                            {item.clause || "N/A"}
                          </Td>
                          <Td isNumeric>
                            <Badge
                              bgGradient={
                                item.count > HIGH_FINDING_COUNT_THRESHOLD
                                  ? "linear(to-r, error.500, error.600)"
                                  : "linear(to-r, brandPrimary.500, brandPrimary.600)"
                              }
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
                </TableContainer>
              ) : (
                <Box p={12} textAlign="center">
                  <Text color={textSecondaryColor} fontSize="lg">
                    No findings recorded for selected schedules
                  </Text>
                </Box>
              )}
            </CardBody>
          </MotionCard>

          <SimpleGrid
            columns={
              kpiData.ncMetricsPerTeam && kpiData.ncMetricsPerTeam.length > 0
                ? [1, 1, 1, 2]
                : 1
            }
            gap={6}
          >
            {/* NC and Findings per Team Chart */}
            {kpiData.ncMetricsPerTeam &&
              kpiData.ncMetricsPerTeam.length > 0 && (
                <Stack>
                  <SectionHeader
                    title="Team Performance Metrics"
                    description="Non-conformities and findings breakdown by team"
                  />

                  <MotionCard
                    variants={cardVariants}
                    bg={whiteBg}
                    borderRadius="xl"
                    boxShadow="md"
                    overflow="hidden"
                    h="full"
                  >
                    <Box
                      bgGradient="linear(to-r, blue.500, purple.500)"
                      h="3px"
                    />
                    <CardBody p={6}>
                      <NcMetricsBarChart
                        data={kpiData.ncMetricsPerTeam}
                        loading={loading}
                      />
                    </CardBody>
                  </MotionCard>
                </Stack>
              )}

            {/* Team Contribution Chart */}
            <Stack>
              <SectionHeader
                title="Team Contribution Analysis"
                description="Each team's contribution to the overall non-conformity percentage"
              />

              <MotionCard
                variants={cardVariants}
                bg={whiteBg}
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
                h="full"
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
            </Stack>
          </SimpleGrid>
        </MotionBox>
      </Container>
    </>
  );
};

export default AuditKpiDashboard;
