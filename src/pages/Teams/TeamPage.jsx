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
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Textarea,
  Avatar,
  AvatarGroup,
  Stack,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiArrowLeft,
  FiSave,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useTeamProfile } from "../../context/TeamProfileContext";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import UserAsyncSelect from "../../components/UserAsyncSelect";

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

  useEffect(() => {
    if (team && !isNewTeam) {
      setFormData({
        ...initialTeamData,
        ...team,
        leaders: normalizeUsers(team.leaders || []),
        members: normalizeUsers(team.members || []),
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
    if (!formData.title.trim()) {
      errors.title = "Team name is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
      title: "Delete Team",
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

  const teamTitle = isEditMode
    ? formData.title
    : team
    ? team.title
    : "";

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
          {isNewTeam ? "Create New Team" : teamTitle}
        </Heading>
      </PageHeader>
      <PageFooter>
        <Flex
          gap={4}
          flexWrap="wrap"
          justifyContent={{ base: "stretch", sm: "flex-end" }}
        >
          {!isEditMode && !isNewTeam ? (
            <Flex gap={2} w={{ base: "full", sm: "auto" }}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="outline"
                  aria-label="More options"
                />
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
              <Button
                leftIcon={<FiEdit />}
                colorScheme="brandPrimary"
                onClick={handleEdit}
                flex={{ base: 1, sm: "auto" }}
              >
                Edit Team
              </Button>
            </Flex>
          ) : (
            <Flex gap={2} w={{ base: "full", sm: "auto" }}>
              <Button
                leftIcon={<FiX />}
                variant="outline"
                onClick={handleCancel}
                isDisabled={saving}
                flex={{ base: 1, sm: "auto" }}
              >
                Cancel
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="brandPrimary"
                onClick={handleSave}
                isLoading={saving}
                loadingText="Saving..."
                flex={{ base: 1, sm: "auto" }}
              >
                {isNewTeam ? "Create Team" : "Save Changes"}
              </Button>
            </Flex>
          )}
        </Flex>
      </PageFooter>

      {!isEditMode && !isNewTeam && team && (
        <Stack gap={6}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>
                    Team Name
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {team.title}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>
                    Description
                  </Text>
                  <Text>{team.description || "-"}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">
                  <HStack>
                    <FiUsers />
                    <Text>Team Members</Text>
                  </HStack>
                </Heading>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>
                    Leaders
                  </Text>
                  {team.leaders && team.leaders.length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {team.leaders.map((leader) => {
                        const fullName = `${leader.firstName || ""} ${
                          leader.lastName || ""
                        }`.trim();
                        return (
                          <HStack key={leader._id || leader.id}>
                            <Avatar size="sm" name={fullName} src={leader.profilePicture} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {fullName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {leader.email}
                              </Text>
                            </VStack>
                          </HStack>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No leaders assigned</Text>
                  )}
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>
                    Members
                  </Text>
                  {team.members && team.members.length > 0 ? (
                    <VStack align="stretch" spacing={2}>
                      {team.members.map((member) => {
                        const fullName = `${member.firstName || ""} ${
                          member.lastName || ""
                        }`.trim();
                        return (
                          <HStack key={member._id || member.id}>
                            <Avatar size="sm" name={fullName} src={member.profilePicture} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {fullName}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {member.email}
                              </Text>
                            </VStack>
                          </HStack>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No members assigned</Text>
                  )}
                </Box>

                {isValidDate(team.createdAt) && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>
                      Created At
                    </Text>
                    <Text fontSize="sm">
                      {new Date(team.createdAt).toLocaleString()}
                    </Text>
                  </Box>
                )}

                {isValidDate(team.updatedAt) && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>
                      Last Updated
                    </Text>
                    <Text fontSize="sm">
                      {new Date(team.updatedAt).toLocaleString()}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Stack>
      )}

      {(isEditMode || isNewTeam) && (
        <Stack gap={6}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" mb={2}>
                  Team Information
                </Heading>

                <FormControl isInvalid={validationErrors.title}>
                  <FormLabel>Team Name</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Enter team name"
                  />
                  <FormErrorMessage>{validationErrors.title}</FormErrorMessage>
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
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" mb={2}>
                  Team Members
                </Heading>

                <UserAsyncSelect
                  label="Leaders"
                  placeholder="Search for leaders..."
                  value={formData.leaders || []}
                  onChange={(leaders) => handleFieldChange("leaders", leaders)}
                  limit={5}
                />

                <UserAsyncSelect
                  label="Members"
                  placeholder="Search for members..."
                  value={formData.members || []}
                  onChange={(members) => handleFieldChange("members", members)}
                  limit={10}
                />
              </VStack>
            </CardBody>
          </Card>
        </Stack>
      )}
    </Box>
  );
};

export default TeamPage;
