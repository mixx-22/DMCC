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
  Textarea,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useApp } from '../context/AppContext'

const CertificationUploadModal = ({ isOpen, onClose, certification = null }) => {
  const { addCertification, updateCertification } = useApp()
  const toast = useToast()
  const isEdit = !!certification
  const [formData, setFormData] = useState({
    name: certification?.name || '',
    type: certification?.type || '',
    issuer: certification?.issuer || '',
    description: certification?.description || '',
    expirationDate: certification?.expirationDate ? certification.expirationDate.split('T')[0] : '',
    file: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    
    // Simulate file upload
    const fileUrl = formData.file ? URL.createObjectURL(formData.file) : certification?.file
    
    if (isEdit) {
      updateCertification(certification.id, {
        ...formData,
        file: fileUrl,
        fileName: formData.file ? formData.file.name : certification.fileName,
        fileSize: formData.file ? formData.file.size : certification.fileSize,
      })
      toast({
        title: 'Certification Updated',
        description: 'Certification has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      addCertification({
        ...formData,
        file: fileUrl,
        fileName: formData.file.name,
        fileSize: formData.file.size,
      })
      toast({
        title: 'Certification Added',
        description: 'Certification has been added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }

    if (!isEdit) {
      setFormData({
        name: '',
        type: '',
        issuer: '',
        description: '',
        expirationDate: '',
        file: null,
      })
    }
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{isEdit ? 'Edit Certification' : 'Add New Certification'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter certification name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Select type"
                >
                  <option value="License">License</option>
                  <option value="Certification">Certification</option>
                  <option value="Permit">Permit</option>
                  <option value="Registration">Registration</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Issuer</FormLabel>
                <Input
                  value={formData.issuer}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="Enter issuer name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Expiration Date</FormLabel>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Scanned Document</FormLabel>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {formData.file && (
                  <Input
                    mt={2}
                    value={formData.file.name}
                    isReadOnly
                    variant="filled"
                  />
                )}
                {certification?.fileName && !formData.file && (
                  <Input
                    mt={2}
                    value={certification.fileName}
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
              {isEdit ? 'Update' : 'Add'} Certification
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CertificationUploadModal


