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
  VStack,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Box,
  HStack,
} from "@chakra-ui/react";
import { FiFolder, FiHome } from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../context/DocumentsContext";

const MoveDocumentModal = ({ isOpen, onClose, document }) => {
  const { moveDocument, documents } = useDocuments();
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  if (!document) return null;

  // Get all folders (excluding the document itself and its children if it's a folder)
  const availableFolders = documents.filter((doc) => {
    if (doc.type !== "folder" && doc.type !== "auditSchedule") return false;
    if (doc.id === document.id) return false;
    // Don't allow moving to own children
    if (document.type === "folder") {
      let parent = doc;
      while (parent) {
        if (parent.id === document.id) return false;
        parent = documents.find((d) => d.id === parent.parentId);
      }
    }
    return true;
  });

  const handleMove = () => {
    moveDocument(document.id, selectedFolderId);

    const targetName = selectedFolderId
      ? documents.find((d) => d.id === selectedFolderId)?.title
      : "Root";

    toast.success("Document Moved", {
      description: `"${document.title}" has been moved to ${targetName}`,
      duration: 3000,
    });

    setSelectedFolderId(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedFolderId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Select a new location for <strong>{document.title}</strong>:
            </Text>

            <FormControl>
              <FormLabel>Destination</FormLabel>
              <RadioGroup
                value={selectedFolderId || "root"}
                onChange={(value) =>
                  setSelectedFolderId(value === "root" ? null : value)
                }
              >
                <Stack spacing={2}>
                  <Radio value="root">
                    <HStack>
                      <FiHome />
                      <Text>Root</Text>
                    </HStack>
                  </Radio>
                  {availableFolders.map((folder) => (
                    <Radio key={folder.id} value={folder.id}>
                      <HStack>
                        <FiFolder />
                        <Text>{folder.title}</Text>
                      </HStack>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </FormControl>

            {availableFolders.length === 0 && (
              <Text fontSize="sm" color="gray.500">
                No folders available. Create a folder first to move documents
                into it.
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleMove}>
            Move
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MoveDocumentModal;
