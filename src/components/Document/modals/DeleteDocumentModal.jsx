import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/DocumentsContext";

const DeleteDocumentModal = ({
  isOpen,
  onClose,
  document,
  onDeleteSuccess,
}) => {
  const { deleteDocument, documents } = useDocuments();

  if (!document) return null;

  // Check if folder has children
  const hasChildren =
    document.type === "folder" &&
    documents.some((doc) => doc.parentId === document.id);

  const handleDelete = () => {
    deleteDocument(document.id);

    toast.success("Document Deleted", {
      description: `"${document.title}" has been deleted`,
      duration: 3000,
    });

    onClose();
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Are you sure you want to delete <strong>{document.title}</strong>?
            </Text>

            {hasChildren && (
              <Alert status="warning">
                <AlertIcon />
                This folder contains documents. Deleting it will also delete all
                its contents.
              </Alert>
            )}

            <Text fontSize="sm" color="gray.600">
              This action cannot be undone.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteDocumentModal;
