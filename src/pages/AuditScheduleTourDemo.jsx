import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  IconButton,
  Flex,
  Stack,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiHelpCircle,
  FiRefreshCw,
  FiPlay,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Organizations from "../pages/Schedules/Organizations";
import Timestamp from "../components/Timestamp";
import { getAuditTypeLabel } from "../utils/auditHelpers";
import {
  generateSampleAuditSchedule,
  generateSampleOrganizations,
} from "../utils/sampleAuditData";
import { useAuditTourGuide } from "../hooks/useAuditTourGuide";

/**
 * Demo Organizations Context Provider
 * Provides sample data without API calls
 */
const DemoOrganizationsContext = ({ children, organizations }) => {
  const [state, setState] = useState({
    organizations: organizations,
    loading: false,
    error: null,
  });

  const contextValue = {
    organizations: state.organizations,
    loading: state.loading,
    error: state.error,
    // Mock functions that don't make API calls
    deleteOrganization: async () => {
      console.log("Demo mode: Delete organization");
    },
    updateOrganization: async (id, updates) => {
      console.log("Demo mode: Update organization", id, updates);
      setState((prev) => ({
        ...prev,
        organizations: prev.organizations.map((org) =>
          org._id === id ? { ...org, ...updates } : org
        ),
      }));
    },
    dispatch: (action) => {
      console.log("Demo mode: Dispatch", action);
      if (action.type === "UPDATE_ORGANIZATION") {
        setState((prev) => ({
          ...prev,
          organizations: prev.organizations.map((org) =>
            org._id === action.payload._id ? action.payload : org
          ),
        }));
      }
    },
  };

  // Use the _contexts import pattern
  const OrganizationsContext = require("../context/_contexts").OrganizationsContext;

  return (
    <OrganizationsContext.Provider value={contextValue}>
      {children}
    </OrganizationsContext.Provider>
  );
};

/**
 * Audit Schedule Tour Demo Page
 * A fully populated demo audit schedule for showcasing the tour guide
 */
const AuditScheduleTourDemo = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(generateSampleAuditSchedule());
  const [organizations, setOrganizations] = useState(
    generateSampleOrganizations()
  );
  const [autoStartTour, setAutoStartTour] = useState(false);

  const summaryCardBg = useColorModeValue("gray.50", "gray.700");
  const alertBg = useColorModeValue("blue.50", "blue.900");

  // Initialize tour guide
  const { startTour } = useAuditTourGuide(true);

  // Auto-start tour on first load (optional)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("demo-audit-tour-seen");
    if (!hasSeenTour && autoStartTour) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem("demo-audit-tour-seen", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [startTour, autoStartTour]);

  const handleResetDemo = () => {
    setSchedule(generateSampleAuditSchedule());
    setOrganizations(generateSampleOrganizations());
    localStorage.removeItem("demo-audit-tour-seen");
  };

  const handleStartTour = () => {
    // Small delay to ensure any state updates are processed
    setTimeout(() => {
      startTour();
    }, 100);
  };

  return (
    <Box minH="100vh" pb={20}>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <HStack>
            <IconButton
              icon={<FiArrowLeft />}
              onClick={() => navigate("/audit-schedules")}
              aria-label="Back to schedules"
              variant="ghost"
            />
            <Heading variant="pageTitle" data-tour="audit-title">
              {schedule.title}
            </Heading>
          </HStack>
          <HStack spacing={2}>
            <Button
              leftIcon={<FiPlay />}
              onClick={handleStartTour}
              colorScheme="brandPrimary"
              size="sm"
            >
              Start Tour
            </Button>
            <IconButton
              icon={<FiHelpCircle />}
              onClick={handleStartTour}
              aria-label="Start tour guide"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<FiRefreshCw />}
              onClick={handleResetDemo}
              aria-label="Reset demo"
              variant="ghost"
              size="md"
            />
          </HStack>
        </Flex>
      </PageHeader>

      {/* Demo Notice */}
      <Alert status="info" bg={alertBg} mb={4} borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription fontSize="sm">
            This is a demonstration page with pre-populated sample data. Click{" "}
            <strong>"Start Tour"</strong> to begin the interactive walkthrough
            of the audit schedule workflow. All interactions are simulated.
          </AlertDescription>
        </Box>
      </Alert>

      <Flex gap={4} maxW="container.xl" flexDir={{ base: "column", lg: "row" }}>
        {/* Left Column - Main Audit Information */}
        <Stack spacing={4} w="full" maxW={{ base: "unset", lg: "xs" }}>
          {/* Main Audit Info Card */}
          <Card data-tour="audit-info">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  {schedule.title}
                </Text>

                <HStack mt={-4}>
                  {schedule.status === 1 ? (
                    <Badge colorScheme="green">Closed</Badge>
                  ) : (
                    <Badge colorScheme="warning">Ongoing</Badge>
                  )}
                  <Badge colorScheme="blue">Demo</Badge>
                </HStack>

                <Divider />

                <Text fontSize="sm" color="gray.600">
                  {schedule.description}
                </Text>

                <Divider />

                {/* Timestamps */}
                <HStack>
                  {schedule.createdAt && (
                    <Box flex={1}>
                      <Text fontSize="sm" color="gray.600">
                        Created At
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        <Timestamp date={schedule.createdAt} />
                      </Text>
                    </Box>
                  )}

                  {schedule.updatedAt && (
                    <Box flex={1}>
                      <Text fontSize="sm" color="gray.600">
                        Last Modified
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        <Timestamp date={schedule.updatedAt} />
                      </Text>
                    </Box>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Audit Details Card */}
          <Card data-tour="audit-details">
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold">Audit Details</Text>
              </Flex>
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Audit Code
                  </Text>
                  <Text fontSize="sm" mt={1} fontWeight="medium">
                    {schedule.auditCode}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Type
                  </Text>
                  <Text fontSize="sm" mt={1} fontWeight="medium">
                    {getAuditTypeLabel(schedule.auditType)}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Standard
                  </Text>
                  <Text fontSize="sm" mt={1} fontWeight="medium">
                    {schedule.standard}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Audit Status Card */}
          <Card data-tour="audit-status">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="semibold">Audit Status</Text>
                  {schedule.status === 1 ? (
                    <Badge colorScheme="green" fontSize="sm">
                      Closed
                    </Badge>
                  ) : (
                    <Badge colorScheme="warning" fontSize="sm">
                      Ongoing
                    </Badge>
                  )}
                </Flex>

                <Text fontSize="sm" color="gray.600">
                  This demo audit is in ongoing status. In a real audit, you
                  would close it once all findings are resolved and verdicts are
                  set for all organizations.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Demo Instructions Card */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="semibold">Demo Instructions</Text>
                <Text fontSize="sm" color="gray.600">
                  This demo showcases:
                </Text>
                <VStack align="stretch" spacing={2} fontSize="sm" pl={4}>
                  <Text>✓ Three organizations with different statuses</Text>
                  <Text>✓ Multiple visits with findings</Text>
                  <Text>✓ Various finding types (Major NC, Minor NC, Observations)</Text>
                  <Text>✓ Action plans in different stages</Text>
                  <Text>✓ Verification workflow</Text>
                  <Text>✓ Set verdict examples</Text>
                </VStack>
                <Button
                  size="sm"
                  colorScheme="brandPrimary"
                  onClick={handleStartTour}
                  leftIcon={<FiPlay />}
                >
                  Start Interactive Tour
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Stack>

        {/* Right Column - Organizations */}
        <Stack spacing={4} flex={1}>
          <DemoOrganizationsContext organizations={organizations}>
            <Organizations
              schedule={schedule}
              setFormData={(updater) => {
                setSchedule((prev) =>
                  typeof updater === "function" ? updater(prev) : updater
                );
              }}
            />
          </DemoOrganizationsContext>
        </Stack>
      </Flex>
    </Box>
  );
};

export default AuditScheduleTourDemo;
