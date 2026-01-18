import {
  Box,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  Button,
  useColorModeValue,
  Spinner,
  Flex,
  CardFooter,
  Icon,
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionItem,
  AccordionIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import RoleSingleSelect from "../components/RoleSingleSelect";
import apiService from "../services/api";
import { useUser } from "../context/useUser";
import { FaRegCircleQuestion } from "react-icons/fa6";

const SETTINGS_ENDPOINT =
  import.meta.env.VITE_API_PACKAGE_SETTINGS || "/settings";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const Settings = () => {
  const { updateUserProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamLeaderRole, setTeamLeaderRole] = useState(null);
  const [initialTeamLeaderRole, setInitialTeamLeaderRole] = useState(null);

  const footerBg = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      if (!USE_API) {
        // Mock data for development
        const mockSettings = {
          data: {
            teamLeaderRole: null, // Initially no role set
          },
        };
        setTeamLeaderRole(mockSettings.data.teamLeaderRole);
        setInitialTeamLeaderRole(mockSettings.data.teamLeaderRole);

        // Update user context with settings
        updateUserProfile({ settings: mockSettings.data });
      } else {
        const response = await apiService.request(SETTINGS_ENDPOINT, {
          method: "GET",
        });

        const settings = response.data || response;
        setTeamLeaderRole(settings.teamLeaderRole || null);
        setInitialTeamLeaderRole(settings.teamLeaderRole || null);

        // Update user context with settings
        updateUserProfile({ settings });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        teamLeaderRole: teamLeaderRole?.id,
      };

      if (!USE_API) {
        // Mock save for development
        setTimeout(() => {
          toast.success("Settings saved successfully");
          setInitialTeamLeaderRole(teamLeaderRole);

          // Update user context with new settings
          updateUserProfile({ settings: payload });
          setSaving(false);
        }, 500);
        return;
      }

      await apiService.request(SETTINGS_ENDPOINT, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      toast.success("Settings saved successfully");
      setInitialTeamLeaderRole(teamLeaderRole);

      // Update user context with new settings
      updateUserProfile({ settings: payload });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(teamLeaderRole) !== JSON.stringify(initialTeamLeaderRole);

  if (loading) {
    return (
      <Box>
        <PageHeader>
          <Heading variant="pageTitle">Settings</Heading>
        </PageHeader>
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Settings</Heading>
      </PageHeader>

      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            colorScheme="brandPrimary"
            onClick={handleSave}
            isLoading={saving}
            isDisabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Flex>
      </PageFooter>

      <VStack spacing={6} align="stretch">
        <Card>
          <CardBody>
            <Flex spacing={4} align="stretch">
              <Box w="2xs">
                <Heading size="md" mb={2}>
                  Team Leader Role
                </Heading>
                <Text fontSize="xs" mb={4}>
                  Select a role that will be automatically assigned to
                  designated Team Leaders
                </Text>
              </Box>
              <Box flex={1}>
                <RoleSingleSelect
                  value={teamLeaderRole}
                  onChange={setTeamLeaderRole}
                  label="Team Leader Role"
                  helperText="Type at least 2 characters to search for roles"
                />
              </Box>
            </Flex>
          </CardBody>
          <CardFooter
            bg={footerBg}
            overflow="hidden"
            borderBottomRadius="md"
            p={0}
          >
            <Accordion allowToggle w="full">
              <AccordionItem border="none">
                <AccordionButton px={5}>
                  <Heading flex={1} size="xs" textAlign="left">
                    <Icon
                      as={FaRegCircleQuestion}
                      boxSize={4}
                      mr={2}
                      pos="relative"
                      top="3px"
                    />
                    How it works
                  </Heading>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={5}>
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="sm">
                      When you select a User as a Leader in a Team, the selected
                      role will be automatically added to that user&apos;s
                      profile.
                    </Text>
                    <Text fontSize="sm">
                      This ensures consistent permissions across all Team
                      Leaders in your organization.
                    </Text>
                    <Text fontSize="sm">
                      You can change this role at any time. Note that changing
                      it WILL affect existing team leaders retroactively.
                    </Text>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardFooter>
        </Card>
      </VStack>
    </Box>
  );
};

export default Settings;
