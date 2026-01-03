import { useState } from 'react'
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
} from '@chakra-ui/react'

const ArchiveDeleteConfirmModal = ({ isOpen, onClose, documentTitle, onConfirm, isDeleting }) => {
  const [confirmText, setConfirmText] = useState('')
  const isMatch = confirmText.trim() === documentTitle.trim()

  const handleDelete = () => {
    if (!isMatch) {
      return
    }
    onConfirm()
    setConfirmText('')
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.600">Permanently Delete from Archive</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="error">
              <AlertIcon />
              This will permanently delete the document from archive. This action cannot be undone.
            </Alert>

            <Text>
              To confirm deletion, please type the document title:
            </Text>

            <Text fontWeight="semibold" color="red.600" fontSize="lg">
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
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isDeleting}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            isDisabled={!isMatch || isDeleting}
            isLoading={isDeleting}
          >
            Delete Permanently
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ArchiveDeleteConfirmModal
