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
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import RoleSingleSelect from "../components/RoleSingleSelect";
import apiService from "../services/api";
import { useUser } from "../context/useUser";

const SETTINGS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_SETTINGS || "/settings";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const Settings = () => {
  const { updateUserProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamLeaderRole, setTeamLeaderRole] = useState(null);
  const [initialTeamLeaderRole, setInitialTeamLeaderRole] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

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
        teamLeaderRole,
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

  const hasChanges = JSON.stringify(teamLeaderRole) !== JSON.stringify(initialTeamLeaderRole);

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
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Heading size="md" mb={2} color={textColor}>
                  Team Leader Role
                </Heading>
                <Text fontSize="sm" color={subTextColor} mb={4}>
                  Select a role that will be automatically assigned to users when they are
                  designated as team leaders in the Teams module. This role should have
                  appropriate permissions for team leadership responsibilities.
                </Text>
                <Divider mb={4} />
                <RoleSingleSelect
                  value={teamLeaderRole}
                  onChange={setTeamLeaderRole}
                  label="Team Leader Role"
                  helperText="Type at least 2 characters to search for roles"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Heading size="sm" color={textColor}>
                How it works
              </Heading>
              <Text fontSize="sm" color={subTextColor}>
                • When you select a user as a leader in a team, the selected role will be
                automatically added to that user&apos;s profile.
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                • This ensures consistent permissions across all team leaders in your
                organization.
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                • You can change this role at any time. Note that changing it won&apos;t affect
                existing team leaders retroactively.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Settings;
