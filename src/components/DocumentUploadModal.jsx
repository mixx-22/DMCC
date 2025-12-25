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
  Select,
  VStack,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useApp } from "../context/AppContext";

const DocumentUploadModal = ({ isOpen, onClose }) => {
  const { addDocument, currentUser } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    const fileUrl = URL.createObjectURL(formData.file);

    addDocument({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      file: fileUrl,
      fileName: formData.file.name,
      fileSize: formData.file.size,
      department: currentUser?.department || "",
      createdBy: currentUser?.id || null,
      createdByName: currentUser?.name || null,
      createdByUserType: currentUser?.userType || null,
    });

    toast({
      title: "Document Uploaded",
      description: "Document has been uploaded and is pending approval",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setFormData({
      title: "",
      description: "",
      category: "",
      file: null,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Upload New Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter document title"
                  id="title"
                  name="title"
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
                  placeholder="Enter document description"
                  rows={4}
                  id="description"
                  name="description"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Select category"
                  id="category"
                  name="category"
                >
                  <option value="Quality Manual">Quality Manual</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Work Instructions">Work Instructions</option>
                  <option value="Form">Form</option>
                  <option value="Report">Report</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              {currentUser?.department && (
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={currentUser.department}
                    isReadOnly
                    variant="filled"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Document will be visible to {currentUser.department}{" "}
                    department
                  </Text>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Document File</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  id="documentFile"
                  name="documentFile"
                />
                {formData.file && (
                  <Input
                    mt={2}
                    value={formData.file.name}
                    isReadOnly
                    variant="filled"
                  />
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              Upload Document
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default DocumentUploadModal;
