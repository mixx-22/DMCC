import { useState, useEffect } from "react";
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
  Switch,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";

const CreateFolderModal = ({
  isOpen,
  onClose,
  parentId,
  path,
  initialTitle = "",
  onFolderCreated,
}) => {
  const { createDocument } = useDocuments();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    allowInheritance: false,
  });

  // Set initial title when modal opens
  useEffect(() => {
    if (isOpen && initialTitle) {
      setFormData((prev) => ({ ...prev, title: initialTitle }));
    }
  }, [isOpen, initialTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a folder name",
        duration: 3000,
      });
      return;
    }

    try {
      const createdFolder = await createDocument({
        title: formData.title,
        description: formData.description,
        type: "folder",
        parentId,
        path,
        status: 1, // Folders are auto-approved
        metadata: {
          allowInheritance: formData.allowInheritance ? 1 : 0,
        },
      });

      toast.success("Folder Created", {
        description: `Folder "${formData.title}" has been created`,
        duration: 3000,
      });

      setFormData({
        title: "",
        description: "",
        allowInheritance: false,
      });

      // Call the callback if provided
      if (onFolderCreated && createdFolder) {
        onFolderCreated(createdFolder);
      }

      onClose();
    } catch (error) {
      toast.error("Failed to Create Folder", {
        description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
        duration: 3000,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      allowInheritance: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create New Folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Folder Name</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter folder name"
                  id="folderName"
                  name="folderName"
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
                  id="folderDescription"
                  name="folderDescription"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Allow Privacy Inheritance</FormLabel>
                <Switch
                  isChecked={formData.allowInheritance}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowInheritance: e.target.checked,
                    }))
                  }
                  id="allowInheritance"
                  name="allowInheritance"
                />
              </FormControl>
              <Text fontSize="sm" color="gray.600">
                When enabled, privacy settings of this folder will be applied to
                its contents
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="brandPrimary" type="submit">
              Create Folder
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateFolderModal;
