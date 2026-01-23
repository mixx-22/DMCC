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
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";
import FileTypeAsyncSelect from "../../FileTypeAsyncSelect";

const EditDocumentModal = ({ isOpen, onClose, document }) => {
  const { updateDocument } = useDocuments();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileType: null,
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || "",
        description: document.description || "",
        // When loaded, fileType is {id, name}
        fileType: document.metadata?.fileType || null,
      });
    }
  }, [document]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Validation Error", {
        description: "Title cannot be empty",
        duration: 3000,
      });
      return;
    }

    // Only update file type for documents with type="file"
    const updates = {
      title: formData.title,
      description: formData.description,
    };

    if (document.type === "file") {
      updates.metadata = {
        ...document.metadata,
        // Save fileType as just the id when saving
        fileType: formData.fileType?.id || null,
      };
    }

    updateDocument(document.id, updates);

    toast.success("Document Updated", {
      description: "Document has been updated successfully",
      duration: 3000,
    });

    onClose();
  };

  if (!document) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Document</ModalHeader>
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
                  placeholder="Enter title"
                  id="editTitle"
                  name="editTitle"
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
                  placeholder="Enter description"
                  rows={3}
                  id="editDescription"
                  name="editDescription"
                />
              </FormControl>

              {document.type === "file" && (
                <FileTypeAsyncSelect
                  value={formData.fileType}
                  onChange={(fileType) =>
                    setFormData((prev) => ({ ...prev, fileType }))
                  }
                  helperText="Type at least 2 characters to search for file types"
                />
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brandPrimary" type="submit">
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditDocumentModal;
