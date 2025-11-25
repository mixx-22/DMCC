import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Grid,
} from '@chakra-ui/react'
import { FiArrowLeft, FiStar, FiDownload, FiLogOut, FiLogIn, FiTrash2, FiEye } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import CheckInModal from '../components/CheckInModal'
import DeleteDocumentModal from '../components/DeleteDocumentModal'

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const {
    documents,
    toggleStar,
    starredDocuments,
    addRecentDocument,
    addRecentFolder,
    checkOutDocument,
    checkInDocument,
    deleteDocument,
    currentUser,
  } = useApp()

  const document = documents.find(d => d.id === id)

  // Check if user can view this document
  const canViewDocument = () => {
    if (!document) return false
    // Admin can view all documents
    if (currentUser?.userType === 'Admin') {
      return true
    }
    // Users can only view documents from their department
    return document.department === currentUser?.department
  }

  // Check if user can approve this document
  const canApproveDocument = () => {
    if (!document) return false
    // Admin can approve any document
    if (currentUser?.userType === 'Admin') {
      return true
    }
    // Only Supervisor or Manager can approve
    if (currentUser?.userType !== 'Supervisor' && currentUser?.userType !== 'Manager') {
      return false
    }
    // If supervisor created the document, only manager can approve
    if (document.createdByUserType === 'Supervisor') {
      return currentUser?.userType === 'Manager'
    }
    // Supervisor or Manager can approve documents created by others
    return true
  }

  if (!document) {
    return (
      <Box>
        <Text>Document not found</Text>
        <Button onClick={() => navigate('/documents')}>Back to Documents</Button>
      </Box>
    )
  }

  if (!canViewDocument()) {
    return (
      <Box>
        <Text>You do not have permission to view this document.</Text>
        <Button onClick={() => navigate('/documents')} mt={4}>Back to Documents</Button>
      </Box>
    )
  }

  // Add to recent documents when viewing
  React.useEffect(() => {
    if (document) {
      addRecentDocument(document.id, document.title, 'documents')
      // Also track the folder/category
      if (document.category) {
        addRecentFolder(document.category)
      } else {
        addRecentFolder('Uncategorized')
      }
    }
  }, [id, document, addRecentDocument, addRecentFolder])

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green'
      case 'pending':
        return 'yellow'
      case 'rejected':
        return 'red'
      default:
        return 'gray'
    }
  }

  const handleDownload = (fileUrl) => {
    const link = window.document.createElement('a')
    link.href = fileUrl
    link.download = document.fileName || 'document'
    link.click()
  }

  const handleView = (fileUrl) => {
    if (!fileUrl) {
      toast({
        title: 'File Not Available',
        description: 'This document does not have an accessible file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCheckOut = () => {
    checkOutDocument(document.id)
    toast({
      title: 'Document Checked Out',
      description: 'Document is now available for revision. You can download it to make changes.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleCheckIn = () => {
    onOpen()
  }

  return (
    <Box>
      <HStack mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          onClick={() => navigate('/documents')}
          aria-label="Back"
        />
        <Heading flex={1}>{document.title}</Heading>
        <IconButton
          icon={<FiStar />}
          color={starredDocuments.includes(document.id) ? 'yellow.500' : 'gray.400'}
          onClick={() => toggleStar(document.id)}
          aria-label="Star document"
        />
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
        <Card>
          <CardHeader>
            <Heading size="sm">Document Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600">Document ID</Text>
                <Text fontWeight="semibold" color="blue.600">
                  {document.documentId || 'N/A'}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Status</Text>
                <Badge colorScheme={getStatusColor(document.status)} mt={1}>
                  {document.status}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Category</Text>
                <Text fontWeight="semibold">{document.category || 'Uncategorized'}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Created</Text>
                <Text>{new Date(document.createdAt).toLocaleDateString()}</Text>
              </Box>
              {document.approvedAt && (
                <Box>
                  <Text fontSize="sm" color="gray.600">Approved</Text>
                  <Text>{new Date(document.approvedAt).toLocaleDateString()}</Text>
                </Box>
              )}
              {document.checkedOut && (
                <Box>
                  <Text fontSize="sm" color="gray.600">Checked Out</Text>
                  <Badge colorScheme="orange" mt={1}>
                    For Revision
                  </Badge>
                  {document.checkedOutAt && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {new Date(document.checkedOutAt).toLocaleDateString()}
                    </Text>
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Description</Heading>
          </CardHeader>
          <CardBody>
            <Text>{document.description || 'No description provided'}</Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                w="full"
                onClick={() => handleDownload(document.file)}
              >
                {document.checkedOut ? 'Download for Revision' : 'Download Current Version'}
              </Button>
              <Button
                leftIcon={<FiEye />}
                variant="outline"
                colorScheme="blue"
                w="full"
                onClick={() => handleView(document.file)}
              >
                View Document
              </Button>
              {!document.checkedOut ? (
                <Button
                  leftIcon={<FiLogOut />}
                  variant="outline"
                  colorScheme="orange"
                  w="full"
                  onClick={handleCheckOut}
                  isDisabled={document.status === 'pending' || document.status === 'rejected'}
                >
                  Check Out for Revision
                </Button>
              ) : (
                <Button
                  leftIcon={<FiLogIn />}
                  colorScheme="green"
                  w="full"
                  onClick={handleCheckIn}
                >
                  Check In & Submit
                </Button>
              )}
              <Button
                leftIcon={<FiTrash2 />}
                variant="outline"
                colorScheme="red"
                w="full"
                onClick={onDeleteOpen}
              >
                Delete Document
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <Heading size="md">Version History</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th>Uploaded</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {document.versions?.map((version, index) => (
                <Tr key={index}>
                  <Td fontWeight="semibold">{String(version.version).padStart(2, '0')}</Td>
                  <Td>{new Date(version.uploadedAt).toLocaleString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      leftIcon={<FiDownload />}
                      onClick={() => handleDownload(version.file)}
                    >
                      Download
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {document.rejectionReason && (
        <Card mt={6} borderColor="red.200" borderWidth={2}>
          <CardHeader>
            <Heading size="sm" color="red.600">Rejection Reason</Heading>
          </CardHeader>
          <CardBody>
            <Text>{document.rejectionReason}</Text>
          </CardBody>
        </Card>
      )}

      <CheckInModal
        isOpen={isOpen}
        onClose={onClose}
        documentId={document.id}
      />

      <DeleteDocumentModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        documentId={document.id}
        documentTitle={document.title}
      />
    </Box>
  )
}

export default DocumentDetail




