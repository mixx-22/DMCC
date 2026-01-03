import {
  Box,
  Button,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Heading,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useRoles } from "../../context/RolesContext";
import { useState, useEffect } from "react";
import PermissionsCheckboxGroup from "../../components/PermissionsCheckboxGroup";

// Validation: At least one permission must be enabled
const validatePermissions = (permissions) => {
  if (!permissions) return false;
  
  return Object.values(permissions).some((entityPerms) =>
    Object.values(entityPerms).some((value) => value === true)
  );
};

const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getRoleById, addRole, updateRole } = useRoles();
  const isEditMode = id !== "new";

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    permissions: {
      documents: { c: false, r: false, u: false, d: false },
      certifications: { c: false, r: false, u: false, d: false },
      users: { c: false, r: false, u: false, d: false },
      roles: { c: false, r: false, u: false, d: false },
      accounts: { c: false, r: false, u: false, d: false },
      archive: { c: false, r: false, u: false, d: false },
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const role = getRoleById(id);
      if (role) {
        setFormData({
          title: role.title,
          description: role.description,
          permissions: role.permissions,
        });
      } else {
        toast({
          title: "Role not found",
          status: "error",
          duration: 3000,
        });
        navigate("/roles");
      }
    }
  }, [id, isEditMode, getRoleById, navigate, toast]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handlePermissionsChange = (permissions) => {
    setFormData((prev) => ({
      ...prev,
      permissions,
    }));
    // Clear permissions error
    if (errors.permissions) {
      setErrors((prev) => ({
        ...prev,
        permissions: undefined,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Role title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!validatePermissions(formData.permissions)) {
      newErrors.permissions = "At least one permission must be enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (isEditMode) {
      updateRole(id, formData);
      toast({
        title: "Role updated",
        description: "Role has been updated successfully",
        status: "success",
        duration: 3000,
      });
      navigate(`/roles/${id}/view`);
    } else {
      const newRole = addRole(formData);
      toast({
        title: "Role created",
        description: "Role has been created successfully",
        status: "success",
        duration: 3000,
      });
      navigate(`/roles/${newRole.id}/view`);
    }
  };

  return (
    <Box>
      <HStack mb={6}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate(isEditMode ? `/roles/${id}/view` : "/roles")}
        >
          Back
        </Button>
      </HStack>

      <form onSubmit={handleSubmit}>
        <VStack align="stretch" spacing={6}>
          <Box p={6} bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="md">
            <Heading size="md" mb={6}>
              {isEditMode ? "Edit Role" : "Create New Role"}
            </Heading>

            <VStack spacing={4}>
              <FormControl isInvalid={errors.title}>
                <FormLabel>Role Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter role title"
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter role description"
                  rows={3}
                />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>
            </VStack>
          </Box>

          <Box p={6} bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="md">
            <FormControl isInvalid={errors.permissions}>
              <Heading size="md" mb={4}>
                Permissions
              </Heading>
              <PermissionsCheckboxGroup
                permissions={formData.permissions}
                onChange={handlePermissionsChange}
              />
              <FormErrorMessage mt={4}>{errors.permissions}</FormErrorMessage>
            </FormControl>
          </Box>

          <HStack justify="flex-end" spacing={4}>
            <Button
              variant="outline"
              onClick={() => navigate(isEditMode ? `/roles/${id}/view` : "/roles")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<FiSave />}
              colorScheme="brandPrimary"
            >
              {isEditMode ? "Save Changes" : "Create Role"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default RoleEdit;
