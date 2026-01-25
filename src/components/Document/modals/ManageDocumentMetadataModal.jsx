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
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";

const ManageDocumentMetadataModal = ({ isOpen, onClose, document, onUpdate }) => {
  const { updateDocument } = useDocuments();
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [effectivityDate, setEffectivityDate] = useState("");

  useEffect(() => {
    if (document) {
      setDocumentNumber(document.metadata?.documentNumber || "");
      setIssuedDate(document.metadata?.issuedDate || "");
      setEffectivityDate(document.metadata?.effectivityDate || "");
    }
  }, [document]);

  if (!document) return null;

  const handleSave = async () => {
    try {
      const updatedDoc = await updateDocument(document.id, {
        metadata: {
          ...document.metadata,
          documentNumber: documentNumber.trim() || undefined,
          issuedDate: issuedDate || undefined,
          effectivityDate: effectivityDate || undefined,
        },
      });

      // Update parent component's document state with the response (includes updatedAt)
      if (onUpdate && updatedDoc) {
        onUpdate(updatedDoc);
      }

      toast.success("Document Metadata Updated", {
        description: "Document metadata has been successfully updated",
        duration: 3000,
      });

      onClose();
    } catch (error) {
      toast.error("Failed to Update Document Metadata", {
        description: error.message || "An error occurred while updating the metadata",
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Document Metadata</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600" mb={2}>
              Manage metadata for &quot;{document.title}&quot;. These fields
              help track document details such as document number, issue date,
              and effectivity date.
            </Text>
            <FormControl>
              <FormLabel fontSize="sm">Document Number</FormLabel>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g., DOC-2024-001"
                size="md"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Issued Date</FormLabel>
              <Input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                size="md"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Effectivity Date</FormLabel>
              <Input
                type="date"
                value={effectivityDate}
                onChange={(e) => setEffectivityDate(e.target.value)}
                size="md"
              />
            </FormControl>
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

export default ManageDocumentMetadataModal;
