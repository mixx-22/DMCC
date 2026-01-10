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
} from "@chakra-ui/react";
import { FiEdit, FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import PermissionsCheckboxGroup from "../../components/PermissionsCheckboxGroup";
import { useRole } from "../../context/RoleContext";
import PageHeader from "../../components/PageHeader";

const RolePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role, loading, saving, updateRole, createRole } = useRole();

  const isNewRole = id === "new";
  const [isEditMode, setIsEditMode] = useState(isNewRole);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    permissions: {
      users: { c: 0, r: 0, u: 0, d: 0 },
      teams: { c: 0, r: 0, u: 0, d: 0 },
      roles: { c: 0, r: 0, u: 0, d: 0 },
      document: {
        c: 0,
        r: 0,
        u: 0,
        d: 0,
        permissions: {
          archive: { c: 0, r: 0, u: 0, d: 0 },
          download: { c: 0, r: 0, u: 0, d: 0 },
        },
      },
      audit: { c: 0, r: 0, u: 0, d: 0 },
    },
    isSystemRole: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when role loads
  useEffect(() => {
    if (role && !isNewRole) {
      setFormData({
        title: role.title || "",
        description: role.description || "",
        permissions: role.permissions || {},
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
    // Check if any delete permission was toggled ON
    const hasNewDeleteEnabled = checkIfDeleteWasEnabled(
      formData.permissions,
      newPermissions
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

  // Helper to check if any delete permission was newly enabled
  const checkIfDeleteWasEnabled = (oldPerms, newPerms) => {
    const checkObject = (oldObj, newObj) => {
      for (const key in newObj) {
        if (key === "d") {
          // Check if delete was toggled from 0 to 1
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
        // Set all delete permissions to 1
        const updatedPermissions = setAllDeletePermissions(
          formData.permissions,
          true
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
        false
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
        navigate(`/roles/${result.id}`);
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
          permissions: role.permissions || {},
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
      <Flex
        mb={6}
        gap={4}
        flexWrap="wrap"
        justifyContent={{ base: "stretch", sm: "flex-end" }}
      >
        {!isEditMode && !isNewRole ? (
          <Button
            leftIcon={<FiEdit />}
            colorScheme="brandPrimary"
            onClick={handleEdit}
            w={{ base: "full", sm: "auto" }}
          >
            Edit Role
          </Button>
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
                          {new Date(role.createdAt).toLocaleDateString()}{" "}
                          <Text as="span" fontSize="sm" color="gray.500">
                            (
                            {formatDistanceToNow(new Date(role.createdAt), {
                              addSuffix: true,
                            })}
                            )
                          </Text>
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
                          {new Date(role.updatedAt).toLocaleDateString()}{" "}
                          <Text as="span" fontSize="sm" color="gray.500">
                            (
                            {formatDistanceToNow(new Date(role.updatedAt), {
                              addSuffix: true,
                            })}
                            )
                          </Text>
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
