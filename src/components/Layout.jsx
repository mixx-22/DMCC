import { Box, Flex } from '@chakra-ui/react'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  return (
    <Flex h="100vh" overflow="hidden">
      <Sidebar />
      <Flex direction="column" flex={1} overflow="hidden">
        <Header />
        <Box flex={1} overflowY="auto" p={6}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

export default Layout




