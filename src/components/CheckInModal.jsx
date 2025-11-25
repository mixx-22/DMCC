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
} from '@chakra-ui/react'
import { useApp } from '../context/AppContext'

const CheckInModal = ({ isOpen, onClose, documentId }) => {
  const { checkInDocument } = useApp()
  const toast = useToast()
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: 'Validation Error',
        description: 'Please upload the revised document file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    
    // Simulate file upload
    const fileUrl = URL.createObjectURL(file)
    
    checkInDocument(documentId, fileUrl)

    toast({
      title: 'Document Checked In',
      description: 'Revised document has been submitted and is pending approval',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setFile(null)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Check In Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Upload the revised document file. The document will be submitted for approval before posting.
              </Text>
              <FormControl isRequired>
                <FormLabel>Revised Document File</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                {file && (
                  <Input
                    mt={2}
                    value={file.name}
                    isReadOnly
                    variant="filled"
                  />
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CheckInModal

