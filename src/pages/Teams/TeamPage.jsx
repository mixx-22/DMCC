import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
  IconButton,
  CardBody,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Textarea,
  Stack,
  CardHeader,
  useDisclosure,
  Spacer,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiArrowLeft,
  FiSave,
  FiX,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import UserAsyncSelect from "../../components/UserAsyncSelect";
import FolderAsyncSelect from "../../components/FolderAsyncSelect";
import TeamProfileView from "../../components/TeamProfileView";
import ObjectivesModal from "../../components/ObjectivesModal";
import { useTeamProfile } from "../../context/_useContext";

const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const TeamPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    team,
    initialTeamData,
    loading,
    saving,
    updateTeam,
    createTeam,
    deleteTeam,
    normalizeUsers,
  } = useTeamProfile();
  const errorColor = useColorModeValue("error.600", "error.400");

  const isNewTeam = id === "new";
  const [isEditMode, setIsEditMode] = useState(isNewTeam);
  const [formData, setFormData] = useState(initialTeamData);
  const [validationErrors, setValidationErrors] = useState({});
  const {
    isOpen: isObjectivesModalOpen,
    onOpen: onObjectivesModalOpen,
    onClose: onObjectivesModalClose,
  } = useDisclosure();

  useEffect(() => {
    if (team && !isNewTeam) {
      setFormData({
        ...initialTeamData,
        ...team,
        leaders: normalizeUsers(team.leaders || []),
        members: normalizeUsers(team.members || []),
        objectives: team.objectives || [],
      });
    }
  }, [team, isNewTeam, initialTeamData, normalizeUsers]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Team name is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleObjectivesSave = async (objectives) => {
    const updatedData = {
      ...formData,
      objectives,
    };

    setFormData(updatedData);

    // If not in new mode, save directly
    if (!isNewTeam) {
      const result = await updateTeam(team._id || team.id, {
        objectives,
      });

      if (result.success) {
        toast.success("Objectives Updated", {
          description: "Team objectives have been updated successfully",
        });
      } else {
        toast.error("Update Failed", {
          description: result.error || "Failed to update objectives",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors before saving",
      });
      return;
    }

    const dataToSubmit = {
      ...formData,
    };

    if (isNewTeam) {
      delete dataToSubmit.createdAt;
      delete dataToSubmit.updatedAt;
      const result = await createTeam(dataToSubmit);

      if (result.success) {
        toast.success("Team Created", {
          description: "Team has been created successfully",
        });
        navigate("/teams");
      } else {
        toast.error("Create Failed", {
          description: result.error || "Failed to create team",
        });
      }
    } else {
      const result = await updateTeam(team._id || team.id, dataToSubmit);

      if (result.success) {
        toast.success("Team Updated", {
          description: "Team has been updated successfully",
        });
        setIsEditMode(false);
      } else {
        toast.error("Update Failed", {
          description: result.error || "Failed to update team",
        });
      }
    }
  };

  const handleCancel = () => {
    if (isNewTeam) {
      navigate("/teams");
    } else {
      if (team) {
        setFormData({
          ...initialTeamData,
          ...team,
          leaders: normalizeUsers(team.leaders || []),
          members: normalizeUsers(team.members || []),
          objectives: team.objectives || [],
        });
      }
      setIsEditMode(false);
      setValidationErrors({});
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleDeleteClick = async () => {
    const result = await Swal.fire({
      name: "Delete Team",
      text: "This action is irreversible and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E53E3E",
      cancelButtonColor: "#718096",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteTeam(team._id || team.id);

      if (deleteResult.success) {
        toast.success("Team Deleted", {
          description: "Team has been deleted successfully",
        });
        navigate("/teams");
      } else {
        toast.error("Delete Failed", {
          description: deleteResult.error || "Failed to delete team",
        });
      }
    }
  };

  if (loading && !isNewTeam) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading team...</Text>
      </Box>
    );
  }

  const teamName = isEditMode ? formData.name : team ? team.name : "";

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle" noOfLines={1}>
          <IconButton
            isRound
            as="span"
            variant="ghost"
            cursor="pointer"
            icon={<FiArrowLeft />}
            onClick={() => navigate("/teams")}
          />
          {isNewTeam ? "Create New Team" : teamName}
        </Heading>
      </PageHeader>
      <PageFooter>
        <Flex w="full" gap={4}>
          {!isEditMode && !isNewTeam ? (
            <Flex gap={2} w="full">
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<FiMoreVertical />}
                  variant="outline"
                  aria-label="More options"
                >
                  More Options
                </MenuButton>
                <MenuList>
                  <MenuItem
                    icon={<FiTrash2 />}
                    color={errorColor}
                    onClick={handleDeleteClick}
                  >
                    Delete Team
                  </MenuItem>
                </MenuList>
              </Menu>
              <Spacer />
              <Button
                leftIcon={<FiEdit />}
                colorScheme="brandPrimary"
                onClick={handleEdit}
              >
                Edit Team
              </Button>
            </Flex>
          ) : (
            <Flex gap={2} w="full">
              <Spacer />
              <Button
                leftIcon={<FiX />}
                variant="outline"
                onClick={handleCancel}
                isDisabled={saving}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="brandPrimary"
                onClick={handleSave}
                isLoading={saving}
                loadingText="Saving..."
              >
                {isNewTeam ? "Create Team" : "Save Changes"}
              </Button>
            </Flex>
          )}
        </Flex>
      </PageFooter>

      {!isEditMode && !isNewTeam && team && (
        <TeamProfileView
          team={team}
          isValidDate={isValidDate}
          onManageObjectives={onObjectivesModalOpen}
        />
      )}

      {(isEditMode || isNewTeam) && (
        <Flex gap={6} flexWrap={{ base: "wrap", lg: "nowrap" }}>
          <Stack gap={6} w={{ base: "full", lg: "xl" }}>
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Team Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <FormControl isInvalid={validationErrors.name}>
                    <FormLabel>Team Name</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      placeholder="Enter team name"
                    />
                    <FormErrorMessage>{validationErrors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={validationErrors.description}>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                      placeholder="Enter team description"
                      rows={4}
                    />
                    <FormErrorMessage>
                      {validationErrors.description}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Team Leaders</Heading>
              </CardHeader>
              <CardBody px={0}>
                <UserAsyncSelect
                  label=""
                  placeholder="Search for users..."
                  value={formData.leaders || []}
                  onChange={(leaders) => handleFieldChange("leaders", leaders)}
                  limit={5}
                  displayMode="table"
                  sx={{ px: 5 }}
                  tableProps={{ sx: { td: { px: 5 } } }}
                />
              </CardBody>
            </Card>
          </Stack>
          <Stack gap={6} w="full">
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Team Members</Heading>
              </CardHeader>
              <CardBody px={0}>
                <UserAsyncSelect
                  label=""
                  placeholder="Search for users..."
                  value={formData.members || []}
                  onChange={(members) => handleFieldChange("members", members)}
                  limit={10}
                  displayMode="table"
                  sx={{ px: 5 }}
                  tableProps={{ sx: { td: { px: 5 } } }}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Documents Folder</Heading>
              </CardHeader>
              <CardBody>
                <FolderAsyncSelect
                  label=""
                  value={
                    formData.folderId
                      ? {
                          id: formData.folderId,
                          title: formData.folderTitle || "Selected Folder",
                        }
                      : null
                  }
                  onChange={(folder) => {
                    handleFieldChange("folderId", folder?.id || null);
                    handleFieldChange("folderTitle", folder?.title || null);
                  }}
                  teamName={formData.name}
                />
              </CardBody>
            </Card>
          </Stack>
        </Flex>
      )}

      <ObjectivesModal
        isOpen={isObjectivesModalOpen}
        onClose={onObjectivesModalClose}
        objectives={formData.objectives || []}
        onSave={handleObjectivesSave}
      />
    </Box>
  );
};

export default TeamPage;
