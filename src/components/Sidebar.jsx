import { Box, VStack, Link, Text, Icon } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiFileText, FiShield, FiCheckCircle, FiUsers } from 'react-icons/fi'

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/documents', label: 'Documents', icon: FiFileText },
    { path: '/certifications', label: 'Certifications', icon: FiShield },
    { path: '/approvals', label: 'Approvals', icon: FiCheckCircle },
    { path: '/accounts', label: 'Accounts', icon: FiUsers },
  ]

  return (
    <Box
      w="250px"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      h="100vh"
      position="sticky"
      top={0}
    >
      <Box p={6}>
        <Text fontSize="xl" fontWeight="bold" color="blue.600" mb={8}>
          DMCC
        </Text>
        <VStack spacing={2} align="stretch">
          {navItems.map((item) => (
            <Link
              key={item.path}
              as={NavLink}
              to={item.path}
              display="flex"
              alignItems="center"
              gap={3}
              p={3}
              borderRadius="md"
              _hover={{ bg: 'gray.100' }}
              _activeLink={{
                bg: 'blue.50',
                color: 'blue.600',
                fontWeight: 'semibold',
              }}
            >
              <Icon as={item.icon} boxSize={5} />
              <Text>{item.label}</Text>
            </Link>
          ))}
        </VStack>
      </Box>
    </Box>
  )
}

export default Sidebar




