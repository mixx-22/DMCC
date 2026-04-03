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
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";
import { canEditDocument } from "../../../utils/qualityDocumentUtils";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

const ManageDocumentMetadataModal = ({
  isOpen,
  onClose,
  document,
  onUpdate,
}) => {
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

  const documentCanBeEdited = canEditDocument(document);

  const handleSave = async () => {
    // Check if document can be edited (quality document lifecycle check)
    if (!documentCanBeEdited) {
      toast.error("Edit Restricted", {
        description: "This quality document is checked in and cannot be edited",
        duration: 4000,
      });
      return;
    }

    try {
      // Send raw data - context will handle formatting (trimming, etc.)
      const updatedDoc = await updateDocument(document, {
        metadata: {
          ...document.metadata,
          documentNumber: documentNumber || undefined,
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
        description:
          error.message || "An error occurred while updating the metadata",
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
            {!documentCanBeEdited && (
              <Alert status="warning">
                <AlertIcon />
                <AlertDescription>
                  This quality document is checked in and cannot be edited.
                  Please check it out first.
                </AlertDescription>
              </Alert>
            )}

            <Text fontSize="sm" color="gray.600" mb={2}>
              Manage metadata for &quot;{document.title}&quot;. These fields
              help track document details such as document number, issue date,
              and effectivity date.
            </Text>
            <FormControl isDisabled={!documentCanBeEdited}>
              <FormLabel fontSize="sm">Document Number</FormLabel>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g., DOC-2024-001"
                size="md"
              />
            </FormControl>
            <FormControl isDisabled={!documentCanBeEdited}>
              <FormLabel fontSize="sm">Issued Date</FormLabel>
              <SingleDatepicker
                name="issuedDate"
                date={issuedDate ? new Date(issuedDate) : new Date()}
                configs={{
                  dateFormat: "MMMM dd, yyyy",
                }}
                propsConfigs={{ triggerBtnProps: { w: "full" } }}
                onDateChange={(date) => setIssuedDate(date)}
              />
            </FormControl>
            <FormControl isDisabled={!documentCanBeEdited}>
              <FormLabel fontSize="sm">Effectivity Date</FormLabel>
              <SingleDatepicker
                name="effectivityDate"
                date={effectivityDate ? new Date(effectivityDate) : new Date()}
                configs={{
                  dateFormat: "MMMM dd, yyyy",
                }}
                propsConfigs={{ triggerBtnProps: { w: "full" } }}
                onDateChange={(date) => setEffectivityDate(date)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSave}
            isDisabled={!documentCanBeEdited}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageDocumentMetadataModal;
