import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEdit, FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import PermissionsCheckboxGroup from "../../components/PermissionsCheckboxGroup";
import { useRole } from "../../context/RoleContext";

const RoleView = () => {
  const navigate = useNavigate();
  const { role, loading, saving, error, updateRole } = useRole();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    permissions: {},
  });
  const [validationErrors, setValidationErrors] = useState({});

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Initialize form data when role loads
  useEffect(() => {
    if (role) {
      setFormData({
        title: role.title || "",
        description: role.description || "",
        permissions: role.permissions || {},
      });
    }
  }, [role]);

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

  const handlePermissionsChange = (newPermissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions: newPermissions,
    }));
    if (validationErrors.permissions) {
      setValidationErrors((prev) => ({
        ...prev,
        permissions: undefined,
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
  };

  const handleCancel = () => {
    // Reset form data to original role data
    if (role) {
      setFormData({
        title: role.title || "",
        description: role.description || "",
        permissions: role.permissions || {},
      });
    }
    setValidationErrors({});
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading role...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">Error: {error}</Text>
        <Button mt={4} onClick={() => navigate("/roles")}>
          Back to Roles
        </Button>
      </Box>
    );
  }

  if (!role) {
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
      <HStack mb={6} justify="space-between">
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate("/roles")}
        >
          Back
        </Button>
        {!isEditMode ? (
          <Button
            leftIcon={<FiEdit />}
            colorScheme="brandPrimary"
            onClick={handleEdit}
          >
            Edit Role
          </Button>
        ) : (
          <HStack spacing={2}>
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
              Save Changes
            </Button>
          </HStack>
        )}
      </HStack>

      <VStack align="stretch" spacing={6}>
        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <VStack align="stretch" spacing={4}>
            {isEditMode ? (
              <>
                <FormControl isInvalid={validationErrors.title}>
                  <FormLabel>Role Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    placeholder="Enter role title"
                  />
                  <FormErrorMessage>{validationErrors.title}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={validationErrors.description}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Enter role description"
                    rows={3}
                  />
                  <FormErrorMessage>{validationErrors.description}</FormErrorMessage>
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
                    Description
                  </Text>
                  <Text>{role.description}</Text>
                </Box>
              </>
            )}

            {!isEditMode && (
              <>
                <Divider />
                <HStack spacing={8} flexWrap="wrap">
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Created At
                    </Text>
                    <Text fontWeight="medium">
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
                    <Text fontWeight="medium">
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
                  {role.isSystemRole !== undefined && (
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        System Role
                      </Text>
                      <Text fontWeight="medium">
                        {role.isSystemRole ? "Yes" : "No"}
                      </Text>
                    </Box>
                  )}
                </HStack>
              </>
            )}
          </VStack>
        </Box>

        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <Heading size="md" mb={4}>
            Permissions
          </Heading>
          <PermissionsCheckboxGroup
            permissions={isEditMode ? formData.permissions : role.permissions}
            onChange={isEditMode ? handlePermissionsChange : undefined}
            readOnly={!isEditMode}
          />
        </Box>
      </VStack>
    </Box>
  );
};

export default RoleView;
