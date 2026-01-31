import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  Code,
} from "@chakra-ui/react";
import { useState } from "react";
import ResponsiveTabs, {
  ResponsiveTabList,
  ResponsiveTab,
  ResponsiveTabPanels,
  ResponsiveTabPanel,
} from "../components/common/ResponsiveTabs";

const ResponsiveTabsDemo = () => {
  const [tab1Index, setTab1Index] = useState(0);
  const [tab2Index, setTab2Index] = useState(0);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Responsive Tabs Demo
          </Heading>
          <Text color="gray.600">
            On mobile devices (width &lt; 768px), tabs display as a dropdown menu.
            On larger screens, tabs are shown normally with horizontal scrolling.
          </Text>
        </Box>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Example 1: Basic Tabs
            </Heading>
            <ResponsiveTabs index={tab1Index} onChange={setTab1Index}>
              <ResponsiveTabList>
                <ResponsiveTab>Overview</ResponsiveTab>
                <ResponsiveTab>Details</ResponsiveTab>
                <ResponsiveTab>Settings</ResponsiveTab>
              </ResponsiveTabList>

              <ResponsiveTabPanels>
                <ResponsiveTabPanel>
                  <Text>
                    This is the overview tab content. On mobile, you'll see a dropdown
                    button above this content to switch between tabs.
                  </Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>
                    This is the details tab content. The dropdown makes it easy to
                    navigate between many tabs on small screens.
                  </Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>
                    This is the settings tab content. On desktop, you can scroll
                    horizontally if there are many tabs.
                  </Text>
                </ResponsiveTabPanel>
              </ResponsiveTabPanels>
            </ResponsiveTabs>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Example 2: Many Tabs (Scrollable)
            </Heading>
            <ResponsiveTabs index={tab2Index} onChange={setTab2Index} colorScheme="blue">
              <ResponsiveTabList>
                <ResponsiveTab>Dashboard</ResponsiveTab>
                <ResponsiveTab>Analytics</ResponsiveTab>
                <ResponsiveTab>Reports</ResponsiveTab>
                <ResponsiveTab>Users</ResponsiveTab>
                <ResponsiveTab>Teams</ResponsiveTab>
                <ResponsiveTab>Documents</ResponsiveTab>
                <ResponsiveTab>Settings</ResponsiveTab>
                <ResponsiveTab>Notifications</ResponsiveTab>
              </ResponsiveTabList>

              <ResponsiveTabPanels>
                <ResponsiveTabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="bold">Dashboard Content</Text>
                    <Text>
                      With many tabs, desktop users can scroll horizontally through the
                      tab list. Mobile users get a convenient dropdown menu.
                    </Text>
                  </VStack>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Analytics tab content</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Reports tab content</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Users tab content</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Teams tab content</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Documents tab content</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Settings tab content</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Notifications tab content</Text>
                </ResponsiveTabPanel>
              </ResponsiveTabPanels>
            </ResponsiveTabs>
          </CardBody>
        </Card>

        <Card bg="gray.50">
          <CardBody>
            <Heading size="sm" mb={3}>
              Usage Instructions
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm">
                <strong>Import:</strong>
              </Text>
              <Code p={2} borderRadius="md">
                {`import ResponsiveTabs, {
  ResponsiveTabList,
  ResponsiveTab,
  ResponsiveTabPanels,
  ResponsiveTabPanel,
} from "../components/common/ResponsiveTabs";`}
              </Code>
              <Text fontSize="sm" mt={2}>
                <strong>Usage:</strong>
              </Text>
              <Code p={2} borderRadius="md" whiteSpace="pre">
                {`const [tabIndex, setTabIndex] = useState(0);

<ResponsiveTabs index={tabIndex} onChange={setTabIndex} colorScheme="brandPrimary">
  <ResponsiveTabList>
    <ResponsiveTab>Tab 1</ResponsiveTab>
    <ResponsiveTab>Tab 2</ResponsiveTab>
  </ResponsiveTabList>
  <ResponsiveTabPanels>
    <ResponsiveTabPanel>Content 1</ResponsiveTabPanel>
    <ResponsiveTabPanel>Content 2</ResponsiveTabPanel>
  </ResponsiveTabPanels>
</ResponsiveTabs>`}
              </Code>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default ResponsiveTabsDemo;
