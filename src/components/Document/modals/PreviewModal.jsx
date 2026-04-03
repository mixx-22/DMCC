import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Image,
  Text,
  Spinner,
  Center,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { getPreviewType } from "../../../utils/fileTypes";

/**
 * PreviewModal component for displaying file previews in a full-screen lightbox
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {string} title - Document title
 * @param {string} fileName - Name of the file being previewed
 * @param {Blob} fileBlob - The file blob to preview
 */
const PreviewModal = ({ isOpen, onClose, title, fileName, fileBlob }) => {
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
        <Center h="100%">
          <Spinner size="xl" color="white" thickness="4px" />
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
            h="100%"
            w="100%"
            p={4}
          >
            <Image
              src={previewUrl}
              alt={fileName}
              maxW="100%"
              maxH="100%"
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
            h="100%"
            w="100%"
            p={4}
          >
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <source src={previewUrl} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );

      case "pdf":
        return (
          <Box h="100%" w="100%" p={4}>
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
          <Center h="100%">
            <Text color="white" fontSize="lg">
              Preview not available for this file type
            </Text>
          </Center>
        );
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      motionPreset="fadeIn"
    >
      <ModalOverlay 
        bg="rgba(0, 0, 0, 0.92)" 
        backdropFilter="blur(4px)"
      />
      <ModalContent
        bg="transparent"
        boxShadow="none"
        m={0}
        maxW="100vw"
        maxH="100vh"
        h="100vh"
        w="100vw"
        overflow="hidden"
      >
        {/* Header with title, filename, and close button */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={2}
          p={6}
        >
          <VStack align="flex-start" spacing={1}>
            <Text 
              color="white" 
              fontSize="xl" 
              fontWeight="semibold"
              textShadow="0 2px 4px rgba(0,0,0,0.5)"
            >
              {title || "File Preview"}
            </Text>
            <Text 
              color="whiteAlpha.800" 
              fontSize="sm"
              textShadow="0 1px 2px rgba(0,0,0,0.5)"
            >
              {fileName}
            </Text>
          </VStack>
          
          <IconButton
            icon={<FiX size={24} />}
            onClick={onClose}
            position="absolute"
            top={6}
            right={6}
            aria-label="Close preview"
            variant="ghost"
            color="white"
            size="lg"
            _hover={{
              bg: "whiteAlpha.200",
            }}
            _active={{
              bg: "whiteAlpha.300",
            }}
          />
        </Box>

        {/* Preview content area */}
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          pt="80px"
          pb="40px"
          px={4}
        >
          {renderPreviewContent()}
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default PreviewModal;
