import { useState, useCallback } from "react";
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
  Icon,
  Center,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiFile, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";

const UploadFileModal = ({ isOpen, onClose, parentId, path }) => {
  const { createDocument } = useDocuments();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file,
        title: prev.title || file.name.split(".").slice(0, -1).join("."),
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: false,
    noKeyboard: false,
  });

  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
  };

  const handleSubmit = async (e) => {
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

    try {
      await createDocument({
        title: formData.title,
        description: formData.description,
        type: "file",
        parentId,
        path,
        status: 0,
        metadata: {
          file: formData.file,
          filename: formData.file.name,
          size: formData.file.size,
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
    } catch (error) {
      toast.error("Failed to Upload File", {
        description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
        duration: 3000,
      });
    }
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
                {!formData.file ? (
                  <Box
                    {...getRootProps()}
                    border="2px dashed"
                    borderColor={isDragActive ? "blue.400" : "gray.300"}
                    borderRadius="lg"
                    p={8}
                    textAlign="center"
                    cursor="pointer"
                    bg={isDragActive ? "blue.50" : "gray.50"}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: "blue.400",
                      bg: "blue.50",
                    }}
                  >
                    <input {...getInputProps()} />
                    <Center>
                      <Icon
                        as={FiUploadCloud}
                        w={12}
                        h={12}
                        color={isDragActive ? "blue.500" : "gray.400"}
                        mb={3}
                      />
                    </Center>
                    <Text fontSize="md" fontWeight="medium" mb={1}>
                      {isDragActive
                        ? "Drop your file here"
                        : "Drag & drop a file here"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      or click to browse
                    </Text>
                  </Box>
                ) : (
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" flex="1">
                        <Icon as={FiFile} w={5} h={5} color="brandPrimary.500" mr={3} />
                        <Box flex="1">
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {formData.file.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {formatFileSize(formData.file.size)}
                          </Text>
                        </Box>
                      </Box>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={handleFileRemove}
                        leftIcon={<FiX />}
                      >
                        Remove
                      </Button>
                    </Box>
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
            <Button colorScheme="brandPrimary" type="submit">
              Upload
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UploadFileModal;
