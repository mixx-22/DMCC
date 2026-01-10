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
  Divider,
  IconButton,
  CardBody,
  Card,
  Flex,
  Switch,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { FiEdit, FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useUserProfile } from "../../context/UserProfileContext";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import RoleAsyncSelect from "../../components/RoleAsyncSelect";

// Helper function to validate and format dates safely
const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const UserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, initialUserData, loading, saving, updateUser, createUser } =
    useUserProfile();

  const isNewUser = id === "new";
  const [isEditMode, setIsEditMode] = useState(isNewUser);
  const [formData, setFormData] = useState(initialUserData);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when user loads
  useEffect(() => {
    if (user && !isNewUser) {
      setFormData({
        ...initialUserData,
        ...user,
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [user, isNewUser, initialUserData]);

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

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
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

    if (isNewUser) {
      delete formData.createdAt;
      delete formData.updatedAt;
      const result = await createUser(formData);

      if (result.success) {
        toast.success("User Created", {
          description: "User has been created successfully",
        });
        navigate(`/users/${result.id}`);
      } else {
        toast.error("Create Failed", {
          description: result.error || "Failed to create user",
        });
      }
    } else {
      const result = await updateUser(user._id || user.id, formData);

      if (result.success) {
        toast.success("User Updated", {
          description: "User has been updated successfully",
        });
        setIsEditMode(false);
      } else {
        toast.error("Update Failed", {
          description: result.error || "Failed to update user",
        });
      }
    }
  };

  const handleCancel = () => {
    if (isNewUser) {
      navigate("/users");
    } else {
      if (user) {
        setFormData({
          ...initialUserData,
          ...user,
          isActive: user.isActive !== undefined ? user.isActive : true,
        });
      }
      setValidationErrors({});
      setIsEditMode(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  if (loading && !isNewUser) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading user...</Text>
      </Box>
    );
  }

  const fullName = isEditMode
    ? `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim()
    : user
    ? `${user.firstName || ""} ${user.middleName || ""} ${
        user.lastName || ""
      }`.trim()
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
            onClick={() => navigate("/users")}
          />
          {isNewUser ? "Create New User" : fullName}
        </Heading>
      </PageHeader>
      <PageFooter>
        <Flex
          mb={6}
          gap={4}
          flexWrap="wrap"
          justifyContent={{ base: "stretch", sm: "flex-end" }}
        >
          {!isEditMode && !isNewUser ? (
            <Button
              leftIcon={<FiEdit />}
              colorScheme="brandPrimary"
              onClick={handleEdit}
              w={{ base: "full", sm: "auto" }}
            >
              Edit User
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
                {isNewUser ? "Create User" : "Save Changes"}
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
                    <FormControl isInvalid={validationErrors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          handleFieldChange("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                      />
                      <FormErrorMessage>
                        {validationErrors.firstName}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Middle Name</FormLabel>
                      <Input
                        value={formData.middleName}
                        onChange={(e) =>
                          handleFieldChange("middleName", e.target.value)
                        }
                        placeholder="Enter middle name (optional)"
                      />
                    </FormControl>

                    <FormControl isInvalid={validationErrors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          handleFieldChange("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                      />
                      <FormErrorMessage>
                        {validationErrors.lastName}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={validationErrors.email}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                      />
                      <FormErrorMessage>
                        {validationErrors.email}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={validationErrors.employeeId}>
                      <FormLabel>Employee ID</FormLabel>
                      <Input
                        value={formData.employeeId}
                        onChange={(e) =>
                          handleFieldChange("employeeId", e.target.value)
                        }
                        placeholder="Enter employee ID"
                      />
                      <FormErrorMessage>
                        {validationErrors.employeeId}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Active Status</FormLabel>
                      <Switch
                        isChecked={formData.isActive}
                        onChange={(e) =>
                          handleFieldChange("isActive", e.target.checked)
                        }
                        colorScheme="brandPrimary"
                      />
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Full Name
                      </Text>
                      <Heading size="lg">{fullName}</Heading>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Email
                      </Text>
                      <Text fontWeight="medium">{user.email}</Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Employee ID
                      </Text>
                      <Text fontWeight="medium">{user.employeeId}</Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Status
                      </Text>
                      <Badge colorScheme={user.isActive ? "green" : "red"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Box>
                  </>
                )}

                {!isEditMode && !isNewUser && isValidDate(user.createdAt) && (
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
                          {new Date(user.createdAt).toLocaleDateString()}{" "}
                          <Text as="span" fontSize="sm" color="gray.500">
                            (
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                            })}
                            )
                          </Text>
                        </Text>
                      </Box>
                      {isValidDate(user.updatedAt) && (
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={1}>
                            Updated At
                          </Text>
                          <Text
                            fontWeight="medium"
                            fontSize={{ base: "sm", md: "md" }}
                          >
                            {new Date(user.updatedAt).toLocaleDateString()}{" "}
                            <Text as="span" fontSize="sm" color="gray.500">
                              (
                              {formatDistanceToNow(new Date(user.updatedAt), {
                                addSuffix: true,
                              })}
                              )
                            </Text>
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Box>
        <Box w={{ base: "full", md: "auto" }} flex={{ base: 0, md: "1" }}>
          <Card w="full">
            <CardBody>
              <VStack align="stretch" spacing={4}>
                {isEditMode ? (
                  <>
                    <Heading size="md" mb={2}>
                      Additional Information
                    </Heading>
                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Department</FormLabel>
                      <Input
                        value={formData.department}
                        onChange={(e) =>
                          handleFieldChange("department", e.target.value)
                        }
                        placeholder="Enter department"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Position</FormLabel>
                      <Input
                        value={formData.position}
                        onChange={(e) =>
                          handleFieldChange("position", e.target.value)
                        }
                        placeholder="Enter position"
                      />
                    </FormControl>

                    <Divider my={2} />

                    <RoleAsyncSelect
                      value={formData.role || []}
                      onChange={(roles) => handleFieldChange("role", roles)}
                    />
                  </>
                ) : (
                  <>
                    <Heading size="md" mb={2}>
                      Additional Information
                    </Heading>
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Phone
                      </Text>
                      <Text fontWeight="medium">
                        {user.phone || "Not provided"}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Department
                      </Text>
                      <Text fontWeight="medium">
                        {user.department || "Not specified"}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Position
                      </Text>
                      <Text fontWeight="medium">
                        {user.position || "Not specified"}
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Roles
                      </Text>
                      <HStack wrap="wrap" spacing={2}>
                        {user.role && user.role.length > 0 ? (
                          user.role.map((r, idx) => (
                            <Badge key={idx} colorScheme="purple">
                              {r.title || r}
                            </Badge>
                          ))
                        ) : (
                          <Badge colorScheme="gray">No Role Assigned</Badge>
                        )}
                      </HStack>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

export default UserPage;
