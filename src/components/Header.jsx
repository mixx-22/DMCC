import { Box, Flex, Text, Badge, IconButton, Button, Menu, MenuButton, MenuList, MenuItem, Avatar, VStack, HStack } from '@chakra-ui/react'
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { getExpiringCertifications, currentUser, logout } = useApp()
  const navigate = useNavigate()
  const expiringCerts = getExpiringCertifications()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          Document Management & Certification Monitoring
        </Text>
        <Flex align="center" gap={4}>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiBell />}
              variant="ghost"
              position="relative"
            >
              {expiringCerts.length > 0 && (
                <Badge
                  position="absolute"
                  top={0}
                  right={0}
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="xs"
                >
                  {expiringCerts.length}
                </Badge>
              )}
            </MenuButton>
            <MenuList>
              {expiringCerts.length === 0 ? (
                <MenuItem>No notifications</MenuItem>
              ) : (
                <>
                  <MenuItem fontWeight="bold" isDisabled>
                    Expiring Certifications ({expiringCerts.length})
                  </MenuItem>
                  {expiringCerts.map((cert) => (
                    <MenuItem
                      key={cert.id}
                      onClick={() => navigate(`/certifications/${cert.id}`)}
                    >
                      {cert.name} - Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </>
              )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              icon={
                <Avatar
                  src={currentUser?.profilePicture}
                  name={currentUser?.name || 'User'}
                  size="sm"
                />
              }
              aria-label="User menu"
            />
            <MenuList>
              <MenuItem>
                <HStack spacing={3}>
                  <Avatar
                    src={currentUser?.profilePicture}
                    name={currentUser?.name || 'User'}
                    size="sm"
                  />
                  <VStack spacing={0} align="start">
                    <Text fontSize="sm" fontWeight="semibold">
                      {currentUser?.name || 'User'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {currentUser?.userType || ''}
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Header




