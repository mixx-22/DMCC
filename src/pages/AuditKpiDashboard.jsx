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
} from "@chakra-ui/react";
import apiService from "../services/api";
import NcMetricsBarChart from "../components/NcMetricsBarChart";
import NcContributionBarChart from "../components/NcContributionBarChart";
import { getDashboardBackground } from "../theme";

// Reusable KPI Card Component
const KpiCard = ({
  label,
  value,
  unit = "",
  helpText = "",
  colorScheme = "blue",
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <CardBody>
        <Stat>
          <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
            {label}
          </StatLabel>
          <StatNumber
            color={`${colorScheme}.600`}
            fontSize="3xl"
            fontWeight="bold"
            mt={2}
          >
            {value}
            {unit && (
              <Text as="span" fontSize="lg" ml={1}>
                {unit}
              </Text>
            )}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" mt={1}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
};

// Progress Bar with Color Logic
const ProgressWithColor = ({ value, label }) => {
  // Determine color based on value
  const getColorScheme = () => {
    if (value >= 90) return "green";
    if (value >= 70) return "yellow";
    return "red";
  };

  const colorScheme = getColorScheme();

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="medium">
          {label}
        </Text>
        <Badge colorScheme={colorScheme} fontSize="sm">
          {value.toFixed(1)}%
        </Badge>
      </HStack>
      <Progress
        value={value}
        colorScheme={colorScheme}
        size="lg"
        borderRadius="md"
      />
    </Box>
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
  const tableRowHoverBg = useColorModeValue("gray.50", "gray.600");

  // Get background gradient configuration
  const isDarkMode = useColorModeValue(false, true);
  const bgConfig = getDashboardBackground("auditDashboard", isDarkMode);

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
      <Box
        p={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Loading KPI data...</Text>
        </VStack>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading KPIs</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  // Empty State
  if (!kpiData) {
    return (
      <Box p={8}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              No KPI data found for this audit schedule.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8}>
      {/* Gradient Background Layer */}
      <Box sx={bgConfig.container}>
        <Box sx={bgConfig.base} />
        <Box sx={bgConfig.blob1} />
        <Box sx={bgConfig.blob2} />
        <Box sx={bgConfig.blob3} />
      </Box>

      {/* Page Header */}
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Audit KPI Dashboard
          </Heading>
          <Text color="gray.500">
            Key Performance Indicators for Audit Schedule
            {kpiData?.metadata?.scheduleTitle && (
              <Text as="span" fontWeight="medium" ml={2}>
                • {kpiData.metadata.scheduleTitle}
              </Text>
            )}
          </Text>
        </Box>

        {/* Filters Section */}
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Year Filter */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Filter by Year
                </FormLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  isDisabled={loadingYears}
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
                <FormLabel fontSize="sm" fontWeight="medium">
                  Select Schedule
                </FormLabel>
                <Select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  isDisabled={loadingSchedules}
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
        </Card>

        <Divider />

        {/* KPI Summary Section - Top Metrics */}
        <Box>
          <Heading size="md" mb={4}>
            Audit Performance Metrics
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {/* Audit Completion Rate - Percentage of audits completed */}
            <KpiCard
              label="Audit Completion Rate"
              value={kpiData.auditCompletionRate?.toFixed(1) || 0}
              unit="%"
              helpText="Audits completed vs planned"
              colorScheme={
                kpiData.auditCompletionRate >= 90 ? "green" : "orange"
              }
            />

            {/* Audit Execution Rate - Percentage of audits executed */}
            <KpiCard
              label="Audit Execution Rate"
              value={kpiData.auditExecutionRate?.toFixed(1) || 0}
              unit="%"
              helpText="Audits executed vs scheduled"
              colorScheme={
                kpiData.auditExecutionRate >= 90 ? "green" : "orange"
              }
            />

            {/* Average Audit Duration - Average days to complete */}
            <KpiCard
              label="Average Audit Duration"
              value={kpiData.averageAuditDuration?.toFixed(1) || 0}
              unit="days"
              helpText="Average time per audit"
              colorScheme="blue"
            />

            {/* Total Findings - Count of all findings */}
            <KpiCard
              label="Total Findings"
              value={kpiData.totalFindings || 0}
              helpText="All findings recorded"
              colorScheme="purple"
            />
          </SimpleGrid>
        </Box>

        {/* Non-Conformity Rate */}
        <Box>
          <Heading size="md" mb={4}>
            Non-Conformity Analysis
          </Heading>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <KpiCard
              label="Non-Conformity Rate"
              value={kpiData.nonConformityRate?.toFixed(1) || 0}
              unit="%"
              helpText="NC findings vs total findings"
              colorScheme={kpiData.nonConformityRate > 10 ? "red" : "green"}
            />
          </SimpleGrid>
        </Box>

        {/* Findings Breakdown Section */}
        <Box>
          <Heading size="md" mb={4}>
            Findings Breakdown
          </Heading>
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <CardHeader>
              <Heading size="sm">Major vs Minor Non-Conformities</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {/* Major and Minor NC Counts */}
                <HStack spacing={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Major Non-Conformity
                    </Text>
                    <Badge
                      colorScheme="red"
                      fontSize="2xl"
                      px={4}
                      py={2}
                      borderRadius="md"
                    >
                      {kpiData.majorVsMinorCount?.MAJOR_NC || 0}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Minor Non-Conformity
                    </Text>
                    <Badge
                      colorScheme="orange"
                      fontSize="2xl"
                      px={4}
                      py={2}
                      borderRadius="md"
                    >
                      {kpiData.majorVsMinorCount?.MINOR_NC || 0}
                    </Badge>
                  </Box>
                </HStack>

                <Divider />

                {/* Corrective Action Closure Rate */}
                <Box>
                  <ProgressWithColor
                    value={kpiData.correctiveActionClosureRate || 0}
                    label="Corrective Action Closure Rate"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Percentage of corrective actions completed
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* Clause-Based Findings Table */}
        <Box>
          <Heading size="md" mb={4}>
            Findings by ISO Clause
          </Heading>
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <CardBody p={0}>
              {kpiData.findingsPerClause &&
              kpiData.findingsPerClause.length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>ISO Clause</Th>
                        <Th>Description</Th>
                        <Th isNumeric>Finding Count</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {kpiData.findingsPerClause.map((item, index) => (
                        <Tr
                          key={index}
                          _hover={{
                            bg: tableRowHoverBg,
                          }}
                        >
                          <Td fontWeight="medium">{item.clause || "N/A"}</Td>
                          <Td>{item.description || "N/A"}</Td>
                          <Td isNumeric>
                            <Badge
                              colorScheme={item.count > 5 ? "red" : "blue"}
                              fontSize="md"
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
                <Box p={8} textAlign="center">
                  <Text color="gray.500">No findings recorded</Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* NC and Findings per Team Chart */}
        {kpiData.ncMetricsPerTeam && kpiData.ncMetricsPerTeam.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Non-Conformities and Findings per Team
            </Heading>
            <Card
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              boxShadow="sm"
            >
              <CardBody>
                <NcMetricsBarChart
                  data={kpiData.ncMetricsPerTeam}
                  loading={loading}
                />
              </CardBody>
            </Card>
          </Box>
        )}

        {/* Team Contribution to Overall Non-Conformity Percentage Chart */}
        <Box>
          <Heading size="md" mb={4}>
            Team Contribution to Overall Non-Conformity Percentage
          </Heading>
          <Card
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <CardBody>
              <NcContributionBarChart
                overallNcPercentage={kpiData.overallNcPercentage}
                data={kpiData.ncContributionPerTeam}
                loading={loading}
              />
            </CardBody>
          </Card>
        </Box>
      </VStack>
    </Box>
  );
};

export default AuditKpiDashboard;
