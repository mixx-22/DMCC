import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
  Divider,
  IconButton,
  CardBody,
  Card,
  Flex,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import PermissionsCheckboxGroup from "../../components/PermissionsCheckboxGroup";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Timestamp from "../../components/Timestamp";
import { useRole } from "../../context/_useContext";

const RolePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role, loading, saving, updateRole, createRole, deleteRole } =
    useRole();
  const errorColor = useColorModeValue("error.600", "error.400");

  const isNewRole = id === "new";
  const [isEditMode, setIsEditMode] = useState(isNewRole);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    permissions: {
      users: { c: 0, r: 0, u: 0, d: 0 },
      teams: {
        c: 0,
        r: 0,
        u: 0,
        d: 0,
        permission: {
          objective: { c: 0, r: 0, u: 0, d: 0 },
        },
      },
      document: {
        c: 0,
        r: 0,
        u: 0,
        d: 0,
        permission: {
          archive: { c: 0, r: 0, u: 0, d: 0 },
          download: { c: 0, r: 0, u: 0, d: 0 },
          preview: { c: 0, r: 0, u: 0, d: 0 },
        },
      },
      request: {
        c: 0,
        r: 0,
        u: 0,
        d: 0,
        permission: {
          publish: { c: 0, r: 0, u: 0, d: 0 },
        },
      },
      audit: { c: 0, r: 0, u: 0, d: 0 },
      settings: {
        c: 0,
        r: 0,
        u: 0,
        d: 0,
        permission: {
          roles: { c: 0, r: 0, u: 0, d: 0 },
          fileType: { c: 0, r: 0, u: 0, d: 0 },
        },
      },
    },
    isSystemRole: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Helper function to normalize permissions structure (convert "permissions" to "permission")
  const normalizePermissions = (perms) => {
    if (!perms || typeof perms !== "object") return perms;

    const normalized = { ...perms };

    Object.keys(normalized).forEach((key) => {
      if (typeof normalized[key] === "object" && normalized[key] !== null) {
        // If this object has both "permissions" and "permission", remove "permissions"
        if (normalized[key].permissions && normalized[key].permission) {
          delete normalized[key].permissions;
        }
        // If it has "permissions" but not "permission", rename it
        else if (normalized[key].permissions && !normalized[key].permission) {
          normalized[key].permission = normalized[key].permissions;
          delete normalized[key].permissions;
        }
        // Recursively normalize nested structures
        if (normalized[key].permission) {
          normalized[key].permission = normalizePermissions(
            normalized[key].permission,
          );
        }
      }
    });

    return normalized;
  };

  useEffect(() => {
    if (role && !isNewRole) {
      setFormData({
        title: role.title || "",
        description: role.description || "",
        permissions: normalizePermissions(role.permissions || {}),
        isSystemRole: role.isSystemRole || false,
      });
    }
  }, [role, isNewRole]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePermissionsChange = async (newPermissions) => {
    const hasNewDeleteEnabled = checkIfDeleteWasEnabled(
      formData.permissions,
      newPermissions,
    );

    // If delete was enabled and not a system role, prompt to make it a system role
    if (hasNewDeleteEnabled && !formData.isSystemRole) {
      const result = await Swal.fire({
        title: "Enable System Role?",
        text: "A delete permission was enabled. Do you want to make this a system role?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, make system role",
        cancelButtonText: "No, keep as is",
        confirmButtonColor: "#3182ce",
      });

      setFormData((prev) => ({
        ...prev,
        permissions: newPermissions,
        isSystemRole: result.isConfirmed ? true : prev.isSystemRole,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: newPermissions,
      }));
    }

    if (validationErrors.permissions) {
      setValidationErrors((prev) => ({
        ...prev,
        permissions: undefined,
      }));
    }
  };

  const checkIfDeleteWasEnabled = (oldPerms, newPerms) => {
    const checkObject = (oldObj, newObj) => {
      for (const key in newObj) {
        if (key === "d") {
          if (oldObj?.[key] === 0 && newObj[key] === 1) {
            return true;
          }
        } else if (
          typeof newObj[key] === "object" &&
          newObj[key] !== null &&
          !["c", "r", "u", "d"].includes(key)
        ) {
          if (checkObject(oldObj?.[key] || {}, newObj[key])) {
            return true;
          }
        }
      }
      return false;
    };

    return checkObject(oldPerms, newPerms);
  };

  // Helper function to set all delete permissions
  const setAllDeletePermissions = (permissions, value) => {
    const updatedPermissions = JSON.parse(JSON.stringify(permissions));

    const updateDelete = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (key === "d") {
          obj[key] = value ? 1 : 0;
        } else if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !["c", "r", "u", "d"].includes(key)
        ) {
          updateDelete(obj[key]);
        }
      });
    };

    updateDelete(updatedPermissions);
    return updatedPermissions;
  };

  const handleSystemRoleChange = async (checked) => {
    if (checked) {
      // When turning ON, ask if they want to allow delete on all modules
      const result = await Swal.fire({
        title: "Enable System Role",
        text: "Do you want to allow delete permissions on all modules?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, allow delete",
        cancelButtonText: "No, keep current",
        confirmButtonColor: "#3182ce",
      });

      if (result.isConfirmed) {
        const updatedPermissions = setAllDeletePermissions(
          formData.permissions,
          true,
        );
        setFormData((prev) => ({
          ...prev,
          isSystemRole: true,
          permissions: updatedPermissions,
        }));
      } else {
        // Just set isSystemRole to true without changing permissions
        setFormData((prev) => ({
          ...prev,
          isSystemRole: true,
        }));
      }
    } else {
      // When turning OFF, turn off all delete permissions without confirmation
      const updatedPermissions = setAllDeletePermissions(
        formData.permissions,
        false,
      );
      setFormData((prev) => ({
        ...prev,
        isSystemRole: false,
        permissions: updatedPermissions,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Role title is required";
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

    if (isNewRole) {
      const result = await createRole(formData);

      if (result.success) {
        toast.success("Role Created", {
          description: "Role has been created successfully",
        });
        if (result.id) {
          navigate(`/roles/${result.id}`);
          setIsEditMode(false);
          return;
        } else {
          navigate("/roles");
          toast.error("Navigation Error", {
            description: "Could not navigate to the new role page",
          });
          return;
        }
      } else {
        toast.error("Create Failed", {
          description: result.error || "Failed to create role",
        });
      }
    } else {
      const result = await updateRole(role._id || role.id, formData);

      if (result.success) {
        toast.success("Role Updated", {
          description: "Role has been updated successfully",
        });
        setIsEditMode(false);
      } else {
        toast.error("Update Failed", {
          description: result.error || "Failed to update role",
        });
      }
    }
  };

  const handleCancel = () => {
    if (isNewRole) {
      navigate("/roles");
    } else {
      // Reset form data to original role data
      if (role) {
        setFormData({
          title: role.title || "",
          description: role.description || "",
          permissions: normalizePermissions(role.permissions || {}),
          isSystemRole: role.isSystemRole || false,
        });
      }
      setValidationErrors({});
      setIsEditMode(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleDeleteClick = async () => {
    const result = await Swal.fire({
      title: "Delete Role",
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
      const deleteResult = await deleteRole(role._id || role.id);

      if (deleteResult.success) {
        toast.success("Role Deleted", {
          description: "Role has been deleted successfully",
        });
        navigate("/roles");
      } else {
        toast.error("Delete Failed", {
          description: deleteResult.error || "Failed to delete role",
        });
      }
    }
  };

  if (loading && !isNewRole) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading role...</Text>
      </Box>
    );
  }

  if (!role && !isNewRole && !loading) {
    return (
      <Box p={4}>
        <Text>Role not found</Text>
        <Button mt={4} onClick={() => navigate("/roles")}>
          Back to Roles
        </Button>
      </Box>
    );
  }

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
            onClick={() => navigate("/roles")}
          />
          {isNewRole ? "Create New Role" : formData.title}
        </Heading>
      </PageHeader>
      <PageFooter>
        <Flex
          gap={4}
          flexWrap="wrap"
          justifyContent={{ base: "stretch", sm: "flex-end" }}
        >
          {!isEditMode && !isNewRole ? (
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
                    Delete Role
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button
                leftIcon={<FiEdit />}
                colorScheme="brandPrimary"
                onClick={handleEdit}
                flex={{ base: 1, sm: "auto" }}
              >
                Edit Role
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
                {isNewRole ? "Create Role" : "Save Changes"}
              </Button>
            </Flex>
          )}
        </Flex>
      </PageFooter>
      <Flex gap={6} flexWrap={{ base: "wrap", lg: "nowrap" }}>
        <Box w={{ base: "full", lg: "xs" }}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {isEditMode ? (
                  <>
                    <FormControl isInvalid={validationErrors.title}>
                      <FormLabel>Role Title</FormLabel>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          handleFieldChange("title", e.target.value)
                        }
                        placeholder="Enter role title"
                      />
                      <FormErrorMessage>
                        {validationErrors.title}
                      </FormErrorMessage>
                    </FormControl>
                    <FormControl>
                      <Checkbox
                        isChecked={formData.isSystemRole}
                        onChange={(e) =>
                          handleSystemRoleChange(e.target.checked)
                        }
                        colorScheme="brandPrimary"
                      >
                        System Role
                      </Checkbox>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        System roles have special privileges. Toggling this will
                        affect delete permissions.
                      </Text>
                    </FormControl>
                    <FormControl isInvalid={validationErrors.description}>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        placeholder="Enter role description"
                        rows={3}
                      />
                      <FormErrorMessage>
                        {validationErrors.description}
                      </FormErrorMessage>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Role Title
                      </Text>
                      <Heading size="lg">{role.title}</Heading>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        System Role
                      </Text>
                      <Text fontWeight="medium">
                        {role.isSystemRole ? "Yes" : "No"}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Description
                      </Text>
                      <Text>{role.description}</Text>
                    </Box>
                  </>
                )}

                {!isEditMode && !isNewRole && (
                  <>
                    <Divider />
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          Created At
                        </Text>
                        <Text
                          fontWeight="medium"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          <Timestamp date={role.createdAt} />
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500" mb={1}>
                          Updated At
                        </Text>
                        <Text
                          fontWeight="medium"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          <Timestamp date={role.updatedAt} />
                        </Text>
                      </Box>
                    </VStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Box>
        <Box w={{ base: "full", md: "auto" }} flex={{ base: 0, md: "1" }}>
          <Card w="full">
            <CardBody px={0}>
              <PermissionsCheckboxGroup
                permissions={
                  isEditMode ? formData.permissions : role.permissions
                }
                onChange={isEditMode ? handlePermissionsChange : undefined}
                readOnly={!isEditMode}
              />
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

export default RolePage;
