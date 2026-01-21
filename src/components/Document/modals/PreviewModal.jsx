import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Image,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { getPreviewType } from "../../utils/fileTypes";

/**
 * PreviewModal component for displaying file previews in a lightbox
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {string} fileName - Name of the file being previewed
 * @param {Blob} fileBlob - The file blob to preview
 */
const PreviewModal = ({ isOpen, onClose, fileName, fileBlob }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  useEffect(() => {
    if (fileBlob && isOpen) {
      // Create object URL from blob
      const url = URL.createObjectURL(fileBlob);
      setPreviewUrl(url);
      setPreviewType(getPreviewType(fileName));

      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileBlob, fileName, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setPreviewType(null);
    }
  }, [isOpen]);

  const renderPreviewContent = () => {
    if (!previewUrl) {
      return (
        <Center minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Center>
      );
    }

    switch (previewType) {
      case "image":
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="400px"
            maxH="80vh"
            overflow="auto"
          >
            <Image
              src={previewUrl}
              alt={fileName}
              maxW="100%"
              maxH="80vh"
              objectFit="contain"
            />
          </Box>
        );

      case "video":
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="400px"
          >
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
              }}
            >
              <source src={previewUrl} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case "pdf":
        return (
          <Box minH="80vh" h="80vh">
            <iframe
              src={previewUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title={`PDF Preview: ${fileName}`}
            />
          </Box>
        );

      default:
        return (
          <Center minH="400px">
            <Text color="gray.500">
              Preview not available for this file type
            </Text>
          </Center>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalHeader>{fileName || "File Preview"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>{renderPreviewContent()}</ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewModal;
