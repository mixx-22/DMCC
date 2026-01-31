import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  Button,
  Collapse,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import ResponsiveTabs, {
  ResponsiveTabList,
  ResponsiveTab,
  ResponsiveTabPanels,
  ResponsiveTabPanel,
} from "../components/common/ResponsiveTabs";

const OrganizationTabsDemo = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Organization Tabs Demo - Collapse Test
          </Heading>
          <Text color="gray.600">
            This demonstrates the TabIndicator issue in OrganizationCard where tabs are inside a Collapse component.
            Click the button below to expand/collapse the card.
          </Text>
          <Text color="gray.600" mt={2}>
            Active Tab Index: {activeTabIndex}
          </Text>
        </Box>

        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">
                Organization Card (With Collapse - Testing)
              </Heading>
              <IconButton
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
                size="sm"
              />
            </HStack>
            
            <Collapse in={isExpanded} animateOpacity>
              <ResponsiveTabs
                colorScheme="brandPrimary"
                index={activeTabIndex}
                onChange={(index) => setActiveTabIndex(index)}
                triggerUpdate={isExpanded}
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
                    <Text>{`Visits tab content - This should be visible when "Visits" is selected`}</Text>
                  </ResponsiveTabPanel>
                  <ResponsiveTabPanel>
                    <Text>{`Auditors tab content - This should be visible when "Auditors" is selected`}</Text>
                  </ResponsiveTabPanel>
                  <ResponsiveTabPanel>
                    <Text>{`Team Details tab content - This should be visible when "Team Details" is selected`}</Text>
                  </ResponsiveTabPanel>
                  <ResponsiveTabPanel>
                    <Text>{`Quality Documents tab content - This should be visible when "Quality Documents" is selected`}</Text>
                  </ResponsiveTabPanel>
                  <ResponsiveTabPanel>
                    <Text>{`Other Documents tab content - This should be visible when "Other Documents" is selected`}</Text>
                  </ResponsiveTabPanel>
                  <ResponsiveTabPanel>
                    <Text>{`Previous Audit Findings tab content - This should be visible when "Previous Audit Findings" is selected`}</Text>
                  </ResponsiveTabPanel>
                </ResponsiveTabPanels>
              </ResponsiveTabs>
            </Collapse>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default OrganizationTabsDemo;
