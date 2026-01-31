import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import ResponsiveTabs, {
  ResponsiveTabList,
  ResponsiveTab,
  ResponsiveTabPanels,
  ResponsiveTabPanel,
} from "../components/common/ResponsiveTabs";

const OrganizationTabsDemo = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Organization Tabs Demo - Mobile Test
          </Heading>
          <Text color="gray.600">
            This demonstrates the fix for OrganizationCard tabs on mobile. 
            Resize to mobile view to see the dropdown button now showing the active tab.
          </Text>
          <Text color="gray.600" mt={2}>
            Active Tab Index: {activeTabIndex}
          </Text>
        </Box>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Organization Tabs (With index prop - FIXED)
            </Heading>
            <ResponsiveTabs
              colorScheme="brandPrimary"
              index={activeTabIndex}
              onChange={(index) => setActiveTabIndex(index)}
            >
              <ResponsiveTabList>
                <ResponsiveTab>Visits</ResponsiveTab>
                <ResponsiveTab>Auditors</ResponsiveTab>
                <ResponsiveTab>Team Details</ResponsiveTab>
                <ResponsiveTab>Quality Documents</ResponsiveTab>
                <ResponsiveTab>Other Documents</ResponsiveTab>
                <ResponsiveTab>Previous Audit Findings</ResponsiveTab>
              </ResponsiveTabList>

              <ResponsiveTabPanels>
                <ResponsiveTabPanel>
                  <Text>Visits tab content - This should be visible when "Visits" is selected</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Auditors tab content - This should be visible when "Auditors" is selected</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Team Details tab content - This should be visible when "Team Details" is selected</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Quality Documents tab content - This should be visible when "Quality Documents" is selected</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Other Documents tab content - This should be visible when "Other Documents" is selected</Text>
                </ResponsiveTabPanel>
                <ResponsiveTabPanel>
                  <Text>Previous Audit Findings tab content - This should be visible when "Previous Audit Findings" is selected</Text>
                </ResponsiveTabPanel>
              </ResponsiveTabPanels>
            </ResponsiveTabs>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default OrganizationTabsDemo;
