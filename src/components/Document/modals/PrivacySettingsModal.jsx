import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormLabel,
  VStack,
  Text,
  Switch,
  Divider,
  Box,
  HStack,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/DocumentsContext";
import UserAsyncSelect from "../../UserAsyncSelect";
import TeamAsyncSelect from "../../TeamAsyncSelect";
import RoleAsyncSelect from "../../RoleAsyncSelect";

const PrivacySettingsModal = ({ isOpen, onClose, document }) => {
  const { updateDocument } = useDocuments();
  const [privacySettings, setPrivacySettings] = useState({
    users: [],
    teams: [],
    roles: [],
    readOnly: 1,
    restricted: 1,
  });

  useEffect(() => {
    if (document) {
      setPrivacySettings({
        users: document.privacy?.users || [],
        teams: document.privacy?.teams || [],
        roles: document.privacy?.roles || [],
        readOnly: document.permissionOverrides?.readOnly ?? 1,
        restricted: document.permissionOverrides?.restricted ?? 1,
      });
    }
  }, [document]);

  if (!document) return null;

  const handleSave = () => {
    updateDocument(document.id, {
      privacy: {
        users: privacySettings.users,
        teams: privacySettings.teams,
        roles: privacySettings.roles,
      },
      permissionOverrides: {
        readOnly: privacySettings.readOnly,
        restricted: privacySettings.restricted,
      },
    });

    toast.success("Privacy Settings Updated", {
      description: "Privacy settings have been updated successfully",
      duration: 3000,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Privacy Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Control who can access &quot;{document.title}&quot;. If no users,
              teams, or roles are specified, the document is visible to
              everyone.
            </Text>

            <Divider />

            {/* Users */}
            <UserAsyncSelect
              label="Shared with Users"
              value={privacySettings.users}
              onChange={(users) =>
                setPrivacySettings((prev) => ({ ...prev, users }))
              }
            />

            {/* Teams */}
            <TeamAsyncSelect
              value={privacySettings.teams}
              onChange={(teams) =>
                setPrivacySettings((prev) => ({ ...prev, teams }))
              }
            />

            {/* Roles */}
            <RoleAsyncSelect
              value={privacySettings.roles}
              onChange={(roles) =>
                setPrivacySettings((prev) => ({ ...prev, roles }))
              }
            />

            <Divider />

            {/* Permission Overrides */}
            <Box>
              <FormLabel>Permission Overrides</FormLabel>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      Read Only
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Prevent users from editing this document
                    </Text>
                  </Box>
                  <Switch
                    isChecked={privacySettings.readOnly === 1}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        readOnly: e.target.checked ? 1 : 0,
                      }))
                    }
                    colorScheme="orange"
                    id="readOnly"
                    name="readOnly"
                  />
                </HStack>

                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">
                      Restricted
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Apply additional access restrictions
                    </Text>
                  </Box>
                  <Switch
                    isChecked={privacySettings.restricted === 1}
                    onChange={(e) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        restricted: e.target.checked ? 1 : 0,
                      }))
                    }
                    colorScheme="red"
                    id="restricted"
                    name="restricted"
                  />
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="brandPrimary" onClick={handleSave}>
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrivacySettingsModal;
