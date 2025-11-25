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
  useToast,
  VStack,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const DeleteDocumentModal = ({ isOpen, onClose, documentId, documentTitle }) => {
  const { deleteDocument } = useApp()
  const navigate = useNavigate()
  const toast = useToast()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isMatch = confirmText.trim() === documentTitle.trim()

  const handleDelete = async () => {
    if (!isMatch) {
      toast({
        title: 'Validation Error',
        description: 'Document title does not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsDeleting(true)
    
    deleteDocument(documentId)

    toast({
      title: 'Document Deleted',
      description: 'Document has been permanently deleted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setIsDeleting(false)
    setConfirmText('')
    onClose()
    navigate('/documents')
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="red.600">Delete Document</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning">
              <AlertIcon />
              This action cannot be undone. This will permanently delete the document.
            </Alert>
            
            <Text>
              To confirm deletion, please type the document title:
            </Text>
            
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
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isDeleting}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            isDisabled={!isMatch || isDeleting}
            isLoading={isDeleting}
          >
            Delete Document
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteDocumentModal

