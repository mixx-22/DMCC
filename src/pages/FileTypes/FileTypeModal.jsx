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
  Input,
  VStack,
  Switch,
  FormHelperText,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import apiService from "../../services/api";
import Swal from "sweetalert2";
import { useFileTypes } from "../../context/_useContext";

const FILE_TYPES_ENDPOINT = "/file-types";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const FileTypeModal = ({ isOpen, onClose, fileType }) => {
  const toast = useToast();
  const { addItemOptimistically } = useFileTypes();
  const [formData, setFormData] = useState({
    name: "",
    isQualityDocument: false,
    requiresApproval: false,
    trackVersioning: false,
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!fileType;

  useEffect(() => {
    if (fileType) {
      setFormData({
        name: fileType.name || "",
        isQualityDocument: fileType.isQualityDocument || false,
        requiresApproval: fileType.requiresApproval || false,
        trackVersioning: fileType.trackVersioning || false,
        isDefault: fileType.isDefault || false,
      });
    } else {
      setFormData({
        name: "",
        isQualityDocument: false,
        requiresApproval: false,
        trackVersioning: false,
        isDefault: false,
      });
    }
  }, [fileType, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name is required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        // Update existing file type
        const fileTypeId = fileType._id || fileType.id;
        
        if (!USE_API) {
          // Mock update
          setTimeout(() => {
            toast({
              title: "File type updated successfully",
              status: "success",
              duration: 3000,
            });
            setSaving(false);
            onClose();
          }, 500);
          return;
        }

        await apiService.request(`${FILE_TYPES_ENDPOINT}/${fileTypeId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });

        toast({
          title: "File type updated successfully",
          status: "success",
          duration: 3000,
        });
      } else {
        // Create new file type
        if (!USE_API) {
          // Mock create
          const timestamp = Date.now();
          const newFileType = {
            ...formData,
            id: `file-type-${timestamp}`,
            _id: `file-type-${timestamp}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Add to end of current list optimistically
          addItemOptimistically(newFileType);
          
          setTimeout(() => {
            toast({
              title: "File type created successfully",
              status: "success",
              duration: 3000,
            });
            setSaving(false);
            onClose();
          }, 500);
          return;
        }

        const response = await apiService.request(FILE_TYPES_ENDPOINT, {
          method: "POST",
          body: JSON.stringify(formData),
        });

        const newFileType = response.fileType || response.data || response;
        
        // Add to end of current list optimistically
        addItemOptimistically({
          ...newFileType,
          createdAt: newFileType.createdAt || new Date().toISOString(),
          updatedAt: newFileType.updatedAt || new Date().toISOString(),
        });

        toast({
          title: "File type created successfully",
          status: "success",
          duration: 3000,
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to save file type:", error);
      toast({
        title: `Failed to ${isEdit ? "update" : "create"} file type`,
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete File Type?",
      text: "This action cannot be undone. Are you sure you want to delete this file type?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    setDeleting(true);

    try {
      const fileTypeId = fileType._id || fileType.id;

      if (!USE_API) {
        // Mock delete
        setTimeout(() => {
          toast({
            title: "File type deleted successfully",
            status: "success",
            duration: 3000,
          });
          setDeleting(false);
          onClose();
        }, 500);
        return;
      }

      await apiService.request(`${FILE_TYPES_ENDPOINT}/${fileTypeId}`, {
        method: "DELETE",
      });

      toast({
        title: "File type deleted successfully",
        status: "success",
        duration: 3000,
      });

      onClose();
    } catch (error) {
      console.error("Failed to delete file type:", error);
      toast({
        title: "Failed to delete file type",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEdit ? "Edit File Type" : "Create File Type"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Quality Manual"
              />
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>Quality Document</FormLabel>
                  <FormHelperText mt={0}>
                    Mark as a quality management document
                  </FormHelperText>
                </VStack>
                <Switch
                  isChecked={formData.isQualityDocument}
                  onChange={(e) =>
                    handleChange("isQualityDocument", e.target.checked)
                  }
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>Requires Approval</FormLabel>
                  <FormHelperText mt={0}>
                    Document requires approval before publishing
                  </FormHelperText>
                </VStack>
                <Switch
                  isChecked={formData.requiresApproval}
                  onChange={(e) =>
                    handleChange("requiresApproval", e.target.checked)
                  }
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>Track Versioning</FormLabel>
                  <FormHelperText mt={0}>
                    Enable version history tracking
                  </FormHelperText>
                </VStack>
                <Switch
                  isChecked={formData.trackVersioning}
                  onChange={(e) =>
                    handleChange("trackVersioning", e.target.checked)
                  }
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <FormLabel mb={0}>Default Type</FormLabel>
                  <FormHelperText mt={0}>
                    Set as default file type for new documents
                  </FormHelperText>
                </VStack>
                <Switch
                  isChecked={formData.isDefault}
                  onChange={(e) => handleChange("isDefault", e.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} w="full" justify="space-between">
            {isEdit && (
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            )}
            <HStack spacing={3} ml="auto">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brandPrimary"
                onClick={handleSubmit}
                isLoading={saving}
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FileTypeModal;
