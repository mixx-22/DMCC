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
  Select,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../context/DocumentsContext";

const EditDocumentModal = ({ isOpen, onClose, document }) => {
  const { updateDocument } = useDocuments();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: 0,
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || "",
        description: document.description || "",
        status: document.status,
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

    updateDocument(document.id, {
      title: formData.title,
      description: formData.description,
      status: parseInt(formData.status),
    });

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

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: parseInt(e.target.value),
                    }))
                  }
                  id="editStatus"
                  name="editStatus"
                >
                  <option value="-1">Draft</option>
                  <option value="0">Under Review</option>
                  <option value="1">Approved</option>
                  <option value="2">Archived</option>
                  <option value="3">Expired</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditDocumentModal;
