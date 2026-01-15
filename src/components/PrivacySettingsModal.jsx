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
  FormControl,
  FormLabel,
  VStack,
  Text,
  Switch,
  Divider,
  Box,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Select,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../context/DocumentsContext";

const PrivacySettingsModal = ({ isOpen, onClose, document }) => {
  const { updateDocument } = useDocuments();
  const [privacySettings, setPrivacySettings] = useState({
    users: [],
    teams: [],
    roles: [],
    readOnly: 1,
    restricted: 1,
  });

  // Input states for adding new items
  const [newUser, setNewUser] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [newRole, setNewRole] = useState("");

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

  const handleAddUser = () => {
    if (!newUser.trim()) return;

    // In a real app, this would search and add actual user objects
    const userObj = { id: newUser, name: newUser };
    setPrivacySettings((prev) => ({
      ...prev,
      users: [...prev.users, userObj],
    }));
    setNewUser("");
  };

  const handleAddTeam = () => {
    if (!newTeam.trim()) return;

    const teamObj = { id: newTeam, name: newTeam };
    setPrivacySettings((prev) => ({
      ...prev,
      teams: [...prev.teams, teamObj],
    }));
    setNewTeam("");
  };

  const handleAddRole = () => {
    if (!newRole) return;

    const roleObj = { id: newRole, name: newRole };
    setPrivacySettings((prev) => ({
      ...prev,
      roles: [...prev.roles, roleObj],
    }));
    setNewRole("");
  };

  const handleRemoveUser = (index) => {
    setPrivacySettings((prev) => ({
      ...prev,
      users: prev.users.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveTeam = (index) => {
    setPrivacySettings((prev) => ({
      ...prev,
      teams: prev.teams.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveRole = (index) => {
    setPrivacySettings((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index),
    }));
  };

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
              Control who can access "{document.title}". If no users, teams, or
              roles are specified, the document is visible to everyone.
            </Text>

            <Divider />

            {/* Users */}
            <Box>
              <FormLabel>Shared with Users</FormLabel>
              <HStack mb={2}>
                <Input
                  placeholder="Enter user ID or name"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddUser()}
                  size="sm"
                  id="newUser"
                  name="newUser"
                />
                <Button size="sm" colorScheme="blue" onClick={handleAddUser}>
                  Add
                </Button>
              </HStack>
              <Box>
                {privacySettings.users.map((user, index) => (
                  <Tag key={index} size="md" mr={2} mb={2} colorScheme="blue">
                    <TagLabel>
                      {typeof user === "string" ? user : user.name || user.id}
                    </TagLabel>
                    <TagCloseButton onClick={() => handleRemoveUser(index)} />
                  </Tag>
                ))}
                {privacySettings.users.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No specific users
                  </Text>
                )}
              </Box>
            </Box>

            {/* Teams */}
            <Box>
              <FormLabel>Shared with Teams</FormLabel>
              <HStack mb={2}>
                <Input
                  placeholder="Enter team ID or name"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTeam()}
                  size="sm"
                  id="newTeam"
                  name="newTeam"
                />
                <Button size="sm" colorScheme="blue" onClick={handleAddTeam}>
                  Add
                </Button>
              </HStack>
              <Box>
                {privacySettings.teams.map((team, index) => (
                  <Tag key={index} size="md" mr={2} mb={2} colorScheme="green">
                    <TagLabel>
                      {typeof team === "string" ? team : team.name || team.id}
                    </TagLabel>
                    <TagCloseButton onClick={() => handleRemoveTeam(index)} />
                  </Tag>
                ))}
                {privacySettings.teams.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No specific teams
                  </Text>
                )}
              </Box>
            </Box>

            {/* Roles */}
            <Box>
              <FormLabel>Shared with Roles</FormLabel>
              <HStack mb={2}>
                <Select
                  placeholder="Select role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  size="sm"
                  id="newRole"
                  name="newRole"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Employee">Employee</option>
                </Select>
                <Button size="sm" colorScheme="blue" onClick={handleAddRole}>
                  Add
                </Button>
              </HStack>
              <Box>
                {privacySettings.roles.map((role, index) => (
                  <Tag key={index} size="md" mr={2} mb={2} colorScheme="purple">
                    <TagLabel>
                      {typeof role === "string" ? role : role.name || role.id}
                    </TagLabel>
                    <TagCloseButton onClick={() => handleRemoveRole(index)} />
                  </Tag>
                ))}
                {privacySettings.roles.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No specific roles
                  </Text>
                )}
              </Box>
            </Box>

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
          <Button colorScheme="blue" onClick={handleSave}>
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrivacySettingsModal;
