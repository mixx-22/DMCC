import { Box, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * NC Metrics Bar Chart Component
 * Displays Non-Conformity metrics per Team including:
 * - Total Findings
 * - Total NC
 * - NC Percentage
 * - Contribution to Overall NC Percentage
 *
 * @param {Array} data - Array of team NC metrics data
 * @param {boolean} loading - Loading state
 */
const NcMetricsBarChart = ({ data = [], loading = false }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const gridColor = useColorModeValue("#e2e8f0", "#4a5568");
  const tooltipBg = useColorModeValue("white", "gray.700");
  const tooltipBorder = useColorModeValue("gray.200", "gray.600");

  // Custom tooltip with comprehensive NC metrics
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isHighNC = data.ncPercentage >= 20;

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
            <Text fontSize="xs" color="blue.500">
              Total Findings: <strong>{data.totalFindings}</strong>
            </Text>
            <Text fontSize="xs" color="orange.500">
              Total NC: <strong>{data.totalNC}</strong>
            </Text>
            <Text
              fontSize="xs"
              color={isHighNC ? "red.500" : "green.500"}
              fontWeight="semibold"
            >
              NC %: <strong>{data.ncPercentage?.toFixed(1)}%</strong>
            </Text>
            <Text fontSize="xs" color="purple.500">
              Contribution to Overall NC:{" "}
              <strong>{data.ncContributionPercentage?.toFixed(1)}%</strong>
            </Text>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">No organization data available</Text>
      </Box>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">Loading chart data...</Text>
      </Box>
    );
  }

  return (
    <Box width="100%" height="450px">
      <ResponsiveContainer width="100%" height={450}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="team"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: textColor, fontSize: 12 }}
            interval={0}
          />
          <YAxis
            label={{
              value: "Count",
              angle: -90,
              position: "insideLeft",
              style: { fill: textColor, fontSize: 14, fontWeight: 600 },
            }}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: "10px" }} verticalAlign="top" />
          <Bar
            dataKey="totalFindings"
            name="Total Findings"
            fill="#3182CE"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="totalNC"
            name="Total NC"
            fill="#ED8936"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default NcMetricsBarChart;
