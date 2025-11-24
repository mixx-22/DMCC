import { Box, Grid, Heading, Text, VStack, HStack, Badge, Icon, Card, CardBody, CardHeader } from '@chakra-ui/react'
import { FiFileText, FiShield, FiClock, FiStar, FiActivity } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

const Dashboard = () => {
  const { recentDocuments, starredDocuments, documents, certifications, activityLogs } = useApp()
  const navigate = useNavigate()

  const starredDocs = documents.filter(doc => starredDocuments.includes(doc.id))
  const pendingApprovals = documents.filter(doc => doc.status === 'pending')

  return (
    <Box>
      <Heading mb={6}>Dashboard</Heading>
      
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <Card>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Total Documents</Text>
                <Text fontSize="3xl" fontWeight="bold">{documents.length}</Text>
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
                <Text fontSize="3xl" fontWeight="bold">{certifications.length}</Text>
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
              {recentDocuments.length === 0 ? (
                <Text color="gray.500">No recent documents</Text>
              ) : (
                recentDocuments.slice(0, 5).map((doc) => (
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

        <Card gridColumn="span 2">
          <CardHeader>
            <Heading size="md">Activity Logs</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={2}>
              {activityLogs.length === 0 ? (
                <Text color="gray.500">No activity logs</Text>
              ) : (
                activityLogs.slice(0, 10).map((log) => (
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
      </Grid>
    </Box>
  )
}

export default Dashboard




