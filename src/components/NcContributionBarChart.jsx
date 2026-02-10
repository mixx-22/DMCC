import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  Heading,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * NC Contribution Pie Chart Component
 * Displays each team's contribution to the overall NC percentage
 *
 * @param {number} overallNcPercentage - Overall NC percentage across all teams
 * @param {Array} data - Array of team contribution data
 * @param {boolean} loading - Loading state
 */
const NcContributionBarChart = ({
  overallNcPercentage = 0,
  data = [],
  loading = false,
}) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const tooltipBg = useColorModeValue("white", "gray.700");
  const tooltipBorder = useColorModeValue("gray.200", "gray.600");
  const subtitleColor = useColorModeValue("gray.600", "gray.400");

  // Color palette for pie chart
  const COLORS = [
    "#805AD5",
    "#3182CE",
    "#38B2AC",
    "#DD6B20",
    "#E53E3E",
    "#D69E2E",
    "#48BB78",
    "#9F7AEA",
  ];

  // Handle loading state first
  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">Loading chart data...</Text>
      </Box>
    );
  }

  // Handle empty state
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">No team data available</Text>
      </Box>
    );
  }

  // Sort data by contribution percentage (highest to lowest)
  const sortedData = [...data].sort(
    (a, b) => (b.contributionPercentage || 0) - (a.contributionPercentage || 0),
  );

  // Custom label for pie chart slices
  const renderLabel = (entry) => {
    return `${entry.contributionPercentage?.toFixed(1)}%`;
  };

  // Custom tooltip showing team contribution metrics
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <Box
          bg={tooltipBg}
          p={3}
          borderRadius="md"
          borderWidth="1px"
          borderColor={tooltipBorder}
          boxShadow="lg"
        >
          <Text fontWeight="bold" fontSize="sm" mb={2}>
            {data.team}
          </Text>
          <VStack align="stretch" spacing={1}>
            <Text fontSize="xs" color="orange.500">
              Team NC: <strong>{data.teamNC}</strong>
            </Text>
            <Text fontSize="sm" color="purple.500" fontWeight="semibold">
              Contribution:{" "}
              <strong>{data.contributionPercentage?.toFixed(2)}%</strong>
            </Text>
            <Box borderTopWidth="1px" borderColor="gray.300" pt={1} mt={1}>
              <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                Overall NC Rate: {overallNcPercentage?.toFixed(2)}%
              </Text>
            </Box>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box width="100%" minWidth={0}>
      {/* Subtitle showing overall NC rate */}
      <Text
        fontSize="sm"
        color={subtitleColor}
        fontWeight="semibold"
        mb={4}
        textAlign="center"
      >
        Overall NC Rate: {overallNcPercentage?.toFixed(2)}%
      </Text>

      <Box height="450px" width="100%">
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <Pie
              data={sortedData}
              dataKey="contributionPercentage"
              nameKey="team"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={renderLabel}
              labelLine={true}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) =>
                value.length > 20 ? value.substring(0, 20) + "..." : value
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default NcContributionBarChart;
