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
  HStack,
  useDisclosure,
  CardHeader,
  Stack,
  InputGroup,
  InputLeftAddon,
  FormHelperText,
  Collapse,
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
  FiKey,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useUserProfile } from "../../context/UserProfileContext";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import RoleAsyncSelect from "../../components/RoleAsyncSelect";
import UserCredentialsModal from "../../components/UserCredentialsModal";
import ProfileImageUpload from "../../components/ProfileImageUpload";
import ProfileViewMode from "../../components/ProfileViewMode";
import { generateKey as generatePassword } from "../../utils/passwordGenerator";
import { generateUsername } from "../../utils/usernameGenerator";

const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const UserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    user,
    initialUserData,
    loading,
    saving,
    updateUser,
    createUser,
    deleteUser,
    resetPassword,
    normalizeRoles,
  } = useUserProfile();
  const suggestionColor = useColorModeValue(
    "brandPrimary.600",
    "brandPrimary.400"
  );
  const errorColor = useColorModeValue("error.600", "error.400");

  const isNewUser = id === "new";
  const [isEditMode, setIsEditMode] = useState(isNewUser);
  const [formData, setFormData] = useState(initialUserData);
  const [validationErrors, setValidationErrors] = useState({});
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const {
    isOpen: isCredentialsModalOpen,
    onOpen: onOpenCredentialsModal,
    onClose: onCloseCredentialsModal,
  } = useDisclosure();

  useEffect(() => {
    if (user && !isNewUser) {
      const contactNumberForDisplay =
        user.contactNumber && user.contactNumber.startsWith("+63")
          ? user.contactNumber.slice(3)
          : user.contactNumber;

      setFormData({
        ...initialUserData,
        ...user,
        isActive: user.isActive !== undefined ? user.isActive : true,
        role: normalizeRoles(user.role || []),
        contactNumber: contactNumberForDisplay,
      });
    }
  }, [user, isNewUser, initialUserData, normalizeRoles]);

  const generatedUsername = useMemo(() => {
    return generateUsername(formData);
  }, [formData]);

  const isCustomUsername = useMemo(() => {
    return formData.username && formData.username !== generatedUsername;
  }, [formData.username, generatedUsername]);

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
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (formData.contactNumber && formData.contactNumber.trim()) {
      const cleanedContactNumber = formData.contactNumber.replace(/\D/g, "");
      const contactNumberRegex = /^[2-9]\d{9}$/;

      if (!contactNumberRegex.test(cleanedContactNumber)) {
        errors.contactNumber =
          "Please enter a valid 10-digit Philippine number (e.g., 917 123 4567)";
      }
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
      contactNumber:
        formData.contactNumber && formData.contactNumber.trim()
          ? `+63${formData.contactNumber.replace(/\D/g, "").replace(/^0/, "")}`
          : formData.contactNumber,
    };

    if (isNewUser) {
      const generatedPassword = generatePassword({ length: 12 });
      dataToSubmit.password = generatedPassword;

      delete dataToSubmit.createdAt;
      delete dataToSubmit.updatedAt;
      const result = await createUser(dataToSubmit);

      if (result.success) {
        setGeneratedCredentials({
          email: dataToSubmit.email,
          username: dataToSubmit.username,
          password: generatedPassword,
        });

        onOpenCredentialsModal();

        toast.success("User Created", {
          description: "User has been created successfully",
        });
      } else {
        toast.error("Create Failed", {
          description: result.error || "Failed to create user",
        });
      }
    } else {
      const result = await updateUser(user._id || user.id, dataToSubmit);

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
          role: user.role || [],
          contactNumber:
            user.contactNumber && user.contactNumber.startsWith("+63")
              ? user.contactNumber.slice(3)
              : user.contactNumber,
        });
      }
      setIsEditMode(false);
      setValidationErrors({});
    }
  };

  const handleCredentialsModalClose = () => {
    onCloseCredentialsModal();
    setGeneratedCredentials(null);
    if (isResetPassword) {
      setIsResetPassword(false);
    } else {
      navigate("/users");
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleResetPasswordClick = async () => {
    const result = await Swal.fire({
      title: "Reset Password",
      text: "This will generate a new password for this user. The user will need to use the new password to log in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3182CE",
      cancelButtonColor: "#718096",
      confirmButtonText: "Proceed",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const resetResult = await resetPassword(user._id || user.id);

      if (resetResult.success) {
        setIsResetPassword(true);
        setGeneratedCredentials({
          email: resetResult.data.email,
          username: resetResult.data.username,
          password: resetResult.data.password,
        });

        onOpenCredentialsModal();

        toast.success("Password Reset", {
          description: "A new password has been generated successfully",
        });
      } else {
        toast.error("Reset Failed", {
          description: resetResult.error || "Failed to reset password",
        });
      }
    }
  };

  const handleDeleteClick = async () => {
    const result = await Swal.fire({
      title: "Delete User",
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
      const deleteResult = await deleteUser(user._id || user.id);

      if (deleteResult.success) {
        toast.success("User Deleted", {
          description: "User has been deleted successfully",
        });
        navigate("/users");
      } else {
        toast.error("Delete Failed", {
          description: deleteResult.error || "Failed to delete user",
        });
      }
    }
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

  const roleObjects =
    user && !isEditMode ? normalizeRoles(user.role || []) : [];

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
          gap={4}
          flexWrap="wrap"
          justifyContent={{ base: "stretch", sm: "flex-end" }}
        >
          {!isEditMode && !isNewUser ? (
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
                    icon={<FiKey />}
                    onClick={handleResetPasswordClick}
                  >
                    Reset Password
                  </MenuItem>
                  <MenuItem
                    icon={<FiTrash2 />}
                    color={errorColor}
                    onClick={handleDeleteClick}
                  >
                    Delete User
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button
                leftIcon={<FiEdit />}
                colorScheme="brandPrimary"
                onClick={handleEdit}
                flex={{ base: 1, sm: "auto" }}
              >
                Edit User
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
                {isNewUser ? "Create User" : "Save Changes"}
              </Button>
            </Flex>
          )}
        </Flex>
      </PageFooter>

      {!isEditMode && !isNewUser && user && (
        <ProfileViewMode
          user={user}
          roleObjects={roleObjects}
          isValidDate={isValidDate}
        />
      )}

      {(isEditMode || isNewUser) && (
        <Flex gap={6} flexWrap={{ base: "wrap", lg: "nowrap" }}>
          <Stack gap={6} w={{ base: "full", lg: "lg" }}>
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Profile Picture</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <ProfileImageUpload
                      value={formData.profilePicture}
                      onChange={(value) =>
                        handleFieldChange("profilePicture", value)
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Account Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
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

                  <FormControl isInvalid={validationErrors.username}>
                    <FormLabel>Username</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>@</InputLeftAddon>
                      <Input
                        value={formData.username}
                        onChange={(e) =>
                          handleFieldChange("username", e.target.value)
                        }
                        placeholder={
                          isNewUser
                            ? generatedUsername || "Enter username"
                            : "Enter username"
                        }
                      />
                    </InputGroup>
                    <Collapse
                      in={
                        isNewUser &&
                        !isCustomUsername &&
                        generatedUsername?.length > 0 &&
                        formData.username !== generatedUsername
                      }
                      unmountOnExit
                    >
                      <FormHelperText>
                        Suggested username:{" "}
                        <Text
                          as="span"
                          cursor="pointer"
                          color={suggestionColor}
                          onClick={() =>
                            handleFieldChange("username", generatedUsername)
                          }
                        >
                          {generatedUsername}
                        </Text>
                      </FormHelperText>
                    </Collapse>
                    <FormErrorMessage>
                      {validationErrors.username}
                    </FormErrorMessage>
                  </FormControl>

                  <Divider my={2} />

                  <FormControl display="flex" alignItems="center">
                    <Stack spacing={0}>
                      <FormLabel my={0}>Account Status</FormLabel>
                      <FormHelperText mt={0} mb={2}>
                        Toggle OFF to restrict user access without deleting the
                        account.
                      </FormHelperText>
                      <HStack align="center">
                        <Switch
                          isChecked={formData.isActive}
                          onChange={(e) =>
                            handleFieldChange("isActive", e.target.checked)
                          }
                          colorScheme="brandPrimary"
                        />
                        <FormLabel mb={0} ml={2}>
                          Active User
                        </FormLabel>
                      </HStack>
                    </Stack>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </Stack>

          <Stack gap={6} w="full">
            <Card>
              <CardHeader pb={0}>
                <Heading size="md">Personal Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
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

                  <FormControl isInvalid={validationErrors.contactNumber}>
                    <FormLabel>Contact Number</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>+63</InputLeftAddon>
                      <Input
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          handleFieldChange("contactNumber", value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length === 10) {
                            const formatted = `${value.slice(
                              0,
                              3
                            )} ${value.slice(3, 6)} ${value.slice(6, 10)}`;
                            handleFieldChange("contactNumber", formatted);
                          }
                        }}
                        placeholder="999 999 9999"
                        maxLength={12}
                      />
                    </InputGroup>
                    <FormErrorMessage>
                      {validationErrors.contactNumber}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" mb={2}>
                    Professional Details
                  </Heading>

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
                </VStack>
              </CardBody>
            </Card>
          </Stack>
        </Flex>
      )}

      {generatedCredentials && (
        <UserCredentialsModal
          isOpen={isCredentialsModalOpen}
          onClose={handleCredentialsModalClose}
          email={generatedCredentials.email}
          username={generatedCredentials.username}
          password={generatedCredentials.password}
          isResetPassword={isResetPassword}
        />
      )}
    </Box>
  );
};

export default UserPage;
