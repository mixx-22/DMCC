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
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

const ArchiveRestoreConfirmModal = ({ isOpen, onClose, documentTitle, onConfirm, isRestoring }) => {
  const handleRestore = () => {
    onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="green.600">Restore Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              Are you sure you want to restore this document back to Documents?
            </Alert>

            <Text>
              Document:
            </Text>

            <Text fontWeight="semibold" color="blue.600" fontSize="lg">
              {documentTitle}
            </Text>

            <Text fontSize="sm" color="gray.600">
              This document will be moved from Archive back to your active Documents.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isRestoring}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleRestore}
            isDisabled={isRestoring}
            isLoading={isRestoring}
          >
            Restore Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ArchiveRestoreConfirmModal
