import {
  Box,
  Container,
  Heading,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  Code,
} from "@chakra-ui/react";
import ResponsiveTabs from "../components/ResponsiveTabs";

/**
 * Demo page to test ResponsiveTabs component
 * This page demonstrates how tabs automatically collapse to a dropdown on mobile/narrow screens
 */
const TabsDemo = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Responsive Tabs Demo
          </Heading>
          <Text color="gray.600">
            Resize your browser window to see tabs collapse into a dropdown on
            narrow screens.
          </Text>
        </Box>

        {/* Example 1: 4 Tabs (Team Profile View) */}
        <Box>
          <Heading size="md" mb={4}>
            Example 1: Team Profile View (4 Tabs)
          </Heading>
          <ResponsiveTabs colorScheme="brandPrimary">
            <TabList>
              <Tab>Info</Tab>
              <Tab>Objectives</Tab>
              <Tab>Quality Documents</Tab>
              <Tab>Other Documents</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Info Tab Content
                  </Heading>
                  <Text>
                    This tab displays team information including leaders,
                    members, and creation dates.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Objectives Tab Content
                  </Heading>
                  <Text>
                    This tab shows team objectives with their descriptions and
                    priorities.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Quality Documents Tab Content
                  </Heading>
                  <Text>
                    This tab displays quality-related documents for the team.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Other Documents Tab Content
                  </Heading>
                  <Text>
                    This tab shows other documents stored in the team folder.
                  </Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </ResponsiveTabs>
        </Box>

        {/* Example 2: 5 Tabs (Organization Card) */}
        <Box>
          <Heading size="md" mb={4}>
            Example 2: Organization Card (5 Tabs)
          </Heading>
          <ResponsiveTabs colorScheme="brandPrimary">
            <TabList>
              <Tab>Visits</Tab>
              <Tab>Auditors</Tab>
              <Tab>Team Details</Tab>
              <Tab>Quality Documents</Tab>
              <Tab>Other Documents</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Visits Tab Content
                  </Heading>
                  <Text>
                    This tab shows scheduled visits and their compliance status.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Auditors Tab Content
                  </Heading>
                  <Text>This tab displays assigned auditors for the visit.</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Team Details Tab Content
                  </Heading>
                  <Text>
                    This tab shows detailed information about the team.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Quality Documents Tab Content
                  </Heading>
                  <Text>
                    This tab displays quality-related documents.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Other Documents Tab Content
                  </Heading>
                  <Text>This tab shows other documents.</Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </ResponsiveTabs>
        </Box>

        {/* Example 3: 3 Tabs (Findings List) */}
        <Box>
          <Heading size="md" mb={4}>
            Example 3: Findings List (3 Tabs)
          </Heading>
          <ResponsiveTabs colorScheme="brandPrimary">
            <TabList>
              <Tab>Report</Tab>
              <Tab>Action Plan</Tab>
              <Tab>Verification</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Report Tab Content
                  </Heading>
                  <Text>
                    This tab shows the finding report with details about
                    non-conformities.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Action Plan Tab Content
                  </Heading>
                  <Text>
                    This tab displays the corrective action plan to address the
                    finding.
                  </Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Heading size="sm" mb={2}>
                    Verification Tab Content
                  </Heading>
                  <Text>
                    This tab shows verification status and evidence that the
                    action was taken.
                  </Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </ResponsiveTabs>
        </Box>

        <Box p={4} bg="blue.50" borderRadius="md">
          <Heading size="sm" mb={2}>
            How it works
          </Heading>
          <VStack align="start" spacing={2}>
            <Text>
              • On <strong>desktop/wide screens</strong> (≥768px): Tabs display
              horizontally
            </Text>
            <Text>
              • On <strong>mobile/narrow screens</strong> (&lt;768px): Tabs
              collapse into a dropdown menu
            </Text>
            <Text>
              • The component uses <Code>useBreakpointValue</Code> and{" "}
              <Code>ResizeObserver</Code> to detect screen size
            </Text>
            <Text>
              • All Chakra UI Tabs props are supported for full compatibility
            </Text>
            <Text>
              • Theme styling (lowercase, semibold) is maintained in both modes
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default TabsDemo;
