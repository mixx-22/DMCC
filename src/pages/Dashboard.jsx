import { Box, Grid, Heading, Text, VStack, HStack, Badge, Icon, Card, CardBody, CardHeader, Button } from '@chakra-ui/react'
import { FiFileText, FiShield, FiClock, FiStar, FiActivity, FiPrinter } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useRef } from 'react'

const Dashboard = () => {
  const { recentDocuments, starredDocuments, documents, certifications, activityLogs, currentUser } = useApp()
  const navigate = useNavigate()
  const activityLogsRef = useRef(null)

  // Filter documents by department (admin sees all)
  const canViewDocument = (doc) => {
    if (currentUser?.userType === 'Admin') {
      return true
    }
    return doc.department === currentUser?.department
  }

  // Filter certifications by department (admin sees all)
  const canViewCertification = (cert) => {
    if (currentUser?.userType === 'Admin') {
      return true
    }
    // If certification has department field, filter by it
    return !cert.department || cert.department === currentUser?.department
  }

  const visibleDocuments = documents.filter(canViewDocument)
  const visibleCertifications = certifications.filter(canViewCertification)
  const starredDocs = visibleDocuments.filter(doc => starredDocuments.includes(doc.id))
  const pendingApprovals = visibleDocuments.filter(doc => doc.status === 'pending')

  // Filter recent documents by department
  const filteredRecentDocuments = recentDocuments.filter(recentDoc => {
    if (recentDoc.type !== 'documents') return true
    const doc = documents.find(d => d.id === recentDoc.id)
    return doc ? canViewDocument(doc) : false
  })

  // Filter activity logs by department (only admin can see all)
  const visibleActivityLogs = currentUser?.userType === 'Admin' 
    ? activityLogs 
    : activityLogs.filter(log => {
        // Filter logs related to documents by department
        if (log.type === 'document') {
          const doc = documents.find(d => d.id === log.itemId)
          return doc ? canViewDocument(doc) : false
        }
        // Filter logs related to certifications by department
        if (log.type === 'certification') {
          const cert = certifications.find(c => c.id === log.itemId)
          return cert ? canViewCertification(cert) : false
        }
        return true
      })

  const handlePrintActivityLogs = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Activity Logs - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Activity Logs</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>User:</strong> ${currentUser?.name || 'N/A'}</p>
          <p><strong>Department:</strong> ${currentUser?.department || 'N/A'}</p>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Type</th>
                <th>Item Name</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${visibleActivityLogs.map(log => `
                <tr>
                  <td>${log.action}</td>
                  <td>${log.type}</td>
                  <td>${log.itemName}</td>
                  <td>${new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <Card>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Total Documents</Text>
                <Text fontSize="3xl" fontWeight="bold">{visibleDocuments.length}</Text>
              </VStack>
              <Icon as={FiFileText} boxSize={10} color="blue.500" />
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Certifications</Text>
                <Text fontSize="3xl" fontWeight="bold">{visibleCertifications.length}</Text>
              </VStack>
              <Icon as={FiShield} boxSize={10} color="green.500" />
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Pending Approvals</Text>
                <Text fontSize="3xl" fontWeight="bold">{pendingApprovals.length}</Text>
              </VStack>
              <Icon as={FiClock} boxSize={10} color="orange.500" />
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Starred Documents</Text>
                <Text fontSize="3xl" fontWeight="bold">{starredDocs.length}</Text>
              </VStack>
              <Icon as={FiStar} boxSize={10} color="yellow.500" />
            </HStack>
          </CardBody>
        </Card>
      </Grid>

      <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Recent Documents</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {filteredRecentDocuments.length === 0 ? (
                <Text color="gray.500">No recent documents</Text>
              ) : (
                filteredRecentDocuments.slice(0, 5).map((doc) => (
                  <Box
                    key={doc.id}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => navigate(`/${doc.type}/${doc.id}`)}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{doc.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {formatDistanceToNow(new Date(doc.openedAt), { addSuffix: true })}
                        </Text>
                      </VStack>
                      <Badge colorScheme={doc.type === 'documents' ? 'blue' : 'green'}>
                        {doc.type}
                      </Badge>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Starred Documents</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {starredDocs.length === 0 ? (
                <Text color="gray.500">No starred documents</Text>
              ) : (
                starredDocs.slice(0, 5).map((doc) => (
                  <Box
                    key={doc.id}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{doc.title}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {doc.category || 'Uncategorized'}
                        </Text>
                      </VStack>
                      <Badge colorScheme={doc.status === 'approved' ? 'green' : doc.status === 'pending' ? 'yellow' : 'red'}>
                        {doc.status}
                      </Badge>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </CardBody>
        </Card>

        {currentUser?.userType === 'Admin' && (
          <Card gridColumn="span 2" ref={activityLogsRef}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Activity Logs</Heading>
                <Button
                  leftIcon={<FiPrinter />}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={handlePrintActivityLogs}
                >
                  Print
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                {visibleActivityLogs.length === 0 ? (
                  <Text color="gray.500">No activity logs</Text>
                ) : (
                  visibleActivityLogs.slice(0, 10).map((log) => (
                  <Box
                    key={log.id}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiActivity} />
                        <Text>
                          <Text as="span" fontWeight="semibold">{log.action}</Text>
                          {' '}
                          <Text as="span" color="gray.600">{log.type}</Text>
                          {' '}
                          <Text as="span">{log.itemName}</Text>
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </Text>
                    </HStack>
                  </Box>
                ))
              )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </Grid>
    </Box>
  )
}

export default Dashboard




