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
  VStack,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";
import FileTypeAsyncSelect from "../../FileTypeAsyncSelect";
import { useDocuments } from "../../../context/_useContext";

const ManageFileTypeModal = ({ isOpen, onClose, document, onUpdate }) => {
  const { updateDocument } = useDocuments();
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (document) {
      setFileType(document.metadata?.fileType || null);
    }
  }, [document]);

  if (!document) return null;

  const handleSave = async () => {
    try {
      // Send raw fileType object - context will handle ID extraction
      const updatedDoc = await updateDocument(document.id, {
        metadata: {
          ...document.metadata,
          fileType: fileType || null,
        },
      });

      // Update parent component's document state with the response (includes updatedAt)
      if (onUpdate && updatedDoc) {
        onUpdate(updatedDoc);
      }

      toast.success("File Type Updated", {
        description: `File type has been ${fileType ? `set to "${fileType.name}"` : "removed"}`,
        duration: 3000,
      });

      onClose();
    } catch (error) {
      toast.error("Failed to Update File Type", {
        description: error.message || "An error occurred while updating the file type",
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage File Type</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Classify &quot;{document.title}&quot; by assigning it a file type.
              File types help organize documents by their purpose, quality
              status, and approval requirements.
            </Text>
            <FileTypeAsyncSelect
              value={fileType}
              onChange={setFileType}
              label="File Type"
              helperText="Select a file type to classify this document"
            />
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="brandPrimary" onClick={handleSave}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageFileTypeModal;
