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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FiEdit, FiArrowLeft, FiSave, FiX, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
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
    normalizeRoles,
  } = useUserProfile();

  const isNewUser = id === "new";
  const [isEditMode, setIsEditMode] = useState(isNewUser);
  const [formData, setFormData] = useState(initialUserData);
  const [validationErrors, setValidationErrors] = useState({});
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const debounceTimerRef = useRef(null);
  const cancelRef = useRef();
  const {
    isOpen: isCredentialsModalOpen,
    onOpen: onOpenCredentialsModal,
    onClose: onCloseCredentialsModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
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
      setUsernameManuallyEdited(true);
    }
  }, [user, isNewUser, initialUserData, normalizeRoles]);

  useEffect(() => {
    if (!isNewUser) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const generatedUsername = generateUsername(
        formData.firstName,
        formData.lastName,
        formData.employeeId
      );

      const shouldAutoGenerate =
        !formData.username.trim() ||
        (!usernameManuallyEdited && formData.username === generatedUsername);

      if (generatedUsername && shouldAutoGenerate) {
        setFormData((prev) => ({
          ...prev,
          username: generatedUsername,
        }));
        if (!formData.username.trim()) {
          setUsernameManuallyEdited(false);
        }
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    formData.firstName,
    formData.lastName,
    formData.employeeId,
    formData.username,
    isNewUser,
    usernameManuallyEdited,
  ]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "username" && value.trim()) {
      const generatedUsername = generateUsername(
        formData.firstName,
        formData.lastName,
        formData.employeeId
      );
      if (value !== generatedUsername) {
        setUsernameManuallyEdited(true);
      }
    }

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
    navigate("/users");
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleDelete = async () => {
    const result = await deleteUser(user._id || user.id);

    if (result.success) {
      toast.success("User Deleted", {
        description: "User has been deleted successfully",
      });
      onCloseDeleteDialog();
      navigate("/users");
    } else {
      toast.error("Delete Failed", {
        description: result.error || "Failed to delete user",
      });
      onCloseDeleteDialog();
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
              <Button
                leftIcon={<FiEdit />}
                colorScheme="brandPrimary"
                onClick={handleEdit}
                flex={{ base: 1, sm: "auto" }}
              >
                Edit User
              </Button>
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
                    onClick={onOpenDeleteDialog}
                    color="red.500"
                  >
                    Delete User
                  </MenuItem>
                </MenuList>
              </Menu>
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
                            ? "Auto-generated or enter custom username"
                            : "Enter username"
                        }
                      />
                    </InputGroup>
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
        />
      )}

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this user? This action is
              irreversible and cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDeleteDialog}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={saving}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UserPage;
