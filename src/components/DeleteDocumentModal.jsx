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
  VStack,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/_useContext";

const DeleteDocumentModal = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}) => {
  const { archiveDocument } = useApp();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isMatch = confirmText.trim() === documentTitle.trim();

  const handleDelete = async () => {
    if (!isMatch) {
      toast.error("Validation Error", {
        description: "Document title does not match",
        duration: 3000,
      });
      return;
    }

    setIsDeleting(true);

    archiveDocument(documentId);

    toast.success("Document Archived", {
      description: "Document has been moved to Archive",
      duration: 3000,
    });

    setIsDeleting(false);
    setConfirmText("");
    onClose();
    navigate("/archive");
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="orange.600">Archive Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning">
              <AlertIcon />
              This will move the document to the Archive folder. You can restore
              it later if needed.
            </Alert>

            <Text>To confirm deletion, please type the document title:</Text>

            <Text fontWeight="semibold" color="blue.600" fontSize="lg">
              {documentTitle}
            </Text>

            <FormControl isRequired>
              <FormLabel>Document Title</FormLabel>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type the document title to confirm"
                isDisabled={isDeleting}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            isDisabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleDelete}
            isDisabled={!isMatch || isDeleting}
            isLoading={isDeleting}
          >
            Archive Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteDocumentModal;
