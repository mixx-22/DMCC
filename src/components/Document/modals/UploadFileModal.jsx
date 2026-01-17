import { useState } from "react";
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
  Textarea,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../context/DocumentsContext";

const UploadFileModal = ({ isOpen, onClose, parentId, path }) => {
  const { createDocument } = useDocuments();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file,
        title: prev.title || file.name.split(".").slice(0, -1).join("."),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error("Validation Error", {
        description: "Please select a file to upload",
        duration: 3000,
      });
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a title for the document",
        duration: 3000,
      });
      return;
    }

    // Create a blob URL for the file (in a real app, this would upload to a server)
    const fileUrl = URL.createObjectURL(formData.file);

    createDocument({
      title: formData.title,
      description: formData.description,
      type: "file",
      parentId,
      path,
      status: 0, // Under review
      metadata: {
        filename: formData.file.name,
        size: formData.file.size,
        version: "0.0",
        key: fileUrl, // In production, this would be a secure key/URL from backend
      },
    });

    toast.success("File Uploaded", {
      description: `"${formData.title}" has been uploaded successfully`,
      duration: 3000,
    });

    setFormData({
      title: "",
      description: "",
      file: null,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      file: null,
    });
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Upload File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>File</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  pt={1}
                  id="file"
                  name="file"
                />
                {formData.file && (
                  <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                      {formData.file.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatFileSize(formData.file.size)}
                    </Text>
                  </Box>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter document title"
                  id="fileTitle"
                  name="fileTitle"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  rows={3}
                  id="fileDescription"
                  name="fileDescription"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Upload
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UploadFileModal;
