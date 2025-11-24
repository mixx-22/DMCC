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
import { FiArrowLeft, FiStar, FiUpload, FiDownload } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import DocumentVersionModal from '../components/DocumentVersionModal'

const DocumentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    documents,
    toggleStar,
    starredDocuments,
    addRecentDocument,
    addDocumentVersion,
    addRecentFolder,
  } = useApp()

  const document = documents.find(d => d.id === id)

  if (!document) {
    return (
      <Box>
        <Text>Document not found</Text>
        <Button onClick={() => navigate('/documents')}>Back to Documents</Button>
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
                Download Current Version
              </Button>
              <Button
                leftIcon={<FiUpload />}
                variant="outline"
                w="full"
                onClick={onOpen}
              >
                Upload New Version
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
                  <Td fontWeight="semibold">v{version.version}</Td>
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

      <DocumentVersionModal
        isOpen={isOpen}
        onClose={onClose}
        documentId={document.id}
      />
    </Box>
  )
}

export default DocumentDetail




