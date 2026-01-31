import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Select,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Code,
  useColorModeValue,
} from "@chakra-ui/react";
import UIControl from "../components/UIControl";
import { getControlStates, buildContext } from "../helpers/uiControlHelpers";
import { ITEM_TYPES, AUDIT_STATUS, ORG_STATUS } from "../config/uiControlConfig";

/**
 * Demo page for UIControl component
 * Shows how the component works with different configurations
 */
const UIControlDemo = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Demo state: schedule status
  const [scheduleStatus, setScheduleStatus] = useState(AUDIT_STATUS.ONGOING);

  // Demo state: organization status
  const [orgStatus, setOrgStatus] = useState(ORG_STATUS.ONGOING);

  // Mock schedule object
  const mockSchedule = {
    _id: "schedule-demo",
    title: "Demo Audit Schedule",
    status: scheduleStatus,
  };

  // Mock organization object
  const mockOrganization = {
    _id: "org-demo",
    team: { name: "Demo Team" },
    status: orgStatus,
  };

  // Mock visit object (for future use)
  // const mockVisit = {
  //   date: {
  //     start: "2024-01-15",
  //     end: "2024-01-16",
  //   },
  //   findings: [],
  // };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            UIControl Component Demo
          </Heading>
          <Text color="gray.600">
            Generic wrapper component that controls UI element visibility,
            enabled/disabled state, and editable/read-only state based on
            business rules.
          </Text>
        </Box>

        {/* Status Controls */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Control Panel</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Change the statuses to see how they affect the UI controls below
            </Text>
          </CardHeader>
          <CardBody>
            <HStack spacing={8}>
              <FormControl maxW="300px">
                <FormLabel>Audit Schedule Status</FormLabel>
                <Select
                  value={scheduleStatus}
                  onChange={(e) => setScheduleStatus(Number(e.target.value))}
                >
                  <option value={AUDIT_STATUS.ONGOING}>
                    ONGOING (0)
                  </option>
                  <option value={AUDIT_STATUS.CLOSED}>
                    CLOSED (1)
                  </option>
                </Select>
              </FormControl>

              <FormControl maxW="300px">
                <FormLabel>Organization Status</FormLabel>
                <Select
                  value={orgStatus}
                  onChange={(e) => setOrgStatus(Number(e.target.value))}
                >
                  <option value={ORG_STATUS.ONGOING}>ONGOING (0)</option>
                  <option value={ORG_STATUS.CLOSED}>CLOSED (1)</option>
                </Select>
              </FormControl>
            </HStack>
          </CardBody>
        </Card>

        {/* Examples */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Schedule Details Controls</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Item Type: <Code>{ITEM_TYPES.SCHEDULE_DETAILS}</Code>
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Rule: Editable only when schedule is ONGOING
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <UIControl
                auditSchedule={mockSchedule}
                itemType={ITEM_TYPES.SCHEDULE_DETAILS}
              >
                <FormControl>
                  <FormLabel>Schedule Title</FormLabel>
                  <Input placeholder="Enter schedule title" />
                </FormControl>
              </UIControl>

              <UIControl
                auditSchedule={mockSchedule}
                itemType={ITEM_TYPES.SCHEDULE_DETAILS}
              >
                <Button colorScheme="blue">Save Schedule</Button>
              </UIControl>

              <DemoStateDisplay
                schedule={mockSchedule}
                itemType={ITEM_TYPES.SCHEDULE_DETAILS}
              />
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Organization Details Controls</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Item Type: <Code>{ITEM_TYPES.ORGANIZATION_DETAILS}</Code>
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Rule: Editable when both schedule AND organization are ONGOING
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <UIControl
                auditSchedule={mockSchedule}
                organization={mockOrganization}
                itemType={ITEM_TYPES.ORGANIZATION_DETAILS}
              >
                <FormControl>
                  <FormLabel>Team Name</FormLabel>
                  <Input placeholder="Enter team name" />
                </FormControl>
              </UIControl>

              <UIControl
                auditSchedule={mockSchedule}
                organization={mockOrganization}
                itemType={ITEM_TYPES.ORGANIZATION_DETAILS}
              >
                <Button colorScheme="green">Update Organization</Button>
              </UIControl>

              <DemoStateDisplay
                schedule={mockSchedule}
                organization={mockOrganization}
                itemType={ITEM_TYPES.ORGANIZATION_DETAILS}
              />
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Verdict Controls</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Item Type: <Code>{ITEM_TYPES.VERDICT}</Code>
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Rule: Always visible, but only editable when schedule is ONGOING
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <UIControl
                auditSchedule={mockSchedule}
                itemType={ITEM_TYPES.VERDICT}
              >
                <FormControl>
                  <FormLabel>Verdict</FormLabel>
                  <Select placeholder="Select verdict">
                    <option>COMPLIANT</option>
                    <option>NON_COMPLIANT</option>
                    <option>MAJOR_NC</option>
                    <option>MINOR_NC</option>
                  </Select>
                </FormControl>
              </UIControl>

              <DemoStateDisplay
                schedule={mockSchedule}
                itemType={ITEM_TYPES.VERDICT}
              />
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Render Prop Pattern</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Advanced usage: Access control states directly
            </Text>
          </CardHeader>
          <CardBody>
            <UIControl
              auditSchedule={mockSchedule}
              organization={mockOrganization}
              itemType={ITEM_TYPES.FINDING_DETAILS}
            >
              {({ visible, enabled, editable, readOnly }) => (
                <Box
                  p={4}
                  border="1px"
                  borderColor="gray.300"
                  borderRadius="md"
                  bg={bgColor}
                >
                  <VStack align="stretch" spacing={2}>
                    <Text>
                      <strong>Visible:</strong>{" "}
                      <Badge colorScheme={visible ? "green" : "red"}>
                        {visible ? "Yes" : "No"}
                      </Badge>
                    </Text>
                    <Text>
                      <strong>Enabled:</strong>{" "}
                      <Badge colorScheme={enabled ? "green" : "red"}>
                        {enabled ? "Yes" : "No"}
                      </Badge>
                    </Text>
                    <Text>
                      <strong>Editable:</strong>{" "}
                      <Badge colorScheme={editable ? "green" : "red"}>
                        {editable ? "Yes" : "No"}
                      </Badge>
                    </Text>
                    <Text>
                      <strong>Read-Only:</strong>{" "}
                      <Badge colorScheme={readOnly ? "orange" : "green"}>
                        {readOnly ? "Yes" : "No"}
                      </Badge>
                    </Text>
                  </VStack>
                </Box>
              )}
            </UIControl>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Document Upload Controls</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Item Type: <Code>{ITEM_TYPES.DOCUMENT_UPLOAD}</Code>
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Rule: Visible if schedule OR org is ONGOING, enabled if both are ONGOING
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <UIControl
                auditSchedule={mockSchedule}
                organization={mockOrganization}
                itemType={ITEM_TYPES.DOCUMENT_UPLOAD}
                fallback={<Text color="gray.500">Document upload not available</Text>}
              >
                <Button colorScheme="purple">Upload Document</Button>
              </UIControl>

              <DemoStateDisplay
                schedule={mockSchedule}
                organization={mockOrganization}
                itemType={ITEM_TYPES.DOCUMENT_UPLOAD}
              />
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

/**
 * Helper component to display current control states
 */
function DemoStateDisplay({ schedule, organization, itemType }) {
  const bgColor = useColorModeValue("gray.50", "gray.700");
  
  // Use helper function directly instead of hook (no context required)
  const context = buildContext({
    auditSchedule: schedule,
    organization,
    itemType,
  });
  const controls = getControlStates(context);

  return (
    <Box p={3} bg={bgColor} borderRadius="md" fontSize="sm">
      <Text fontWeight="bold" mb={2}>
        Current Control States:
      </Text>
      <HStack spacing={4}>
        <Badge colorScheme={controls.visible ? "green" : "red"}>
          Visible: {controls.visible ? "Yes" : "No"}
        </Badge>
        <Badge colorScheme={controls.enabled ? "green" : "red"}>
          Enabled: {controls.enabled ? "Yes" : "No"}
        </Badge>
        <Badge colorScheme={controls.editable ? "green" : "red"}>
          Editable: {controls.editable ? "Yes" : "No"}
        </Badge>
        <Badge colorScheme={controls.readOnly ? "orange" : "green"}>
          Read-Only: {controls.readOnly ? "Yes" : "No"}
        </Badge>
      </HStack>
    </Box>
  );
}

export default UIControlDemo;
