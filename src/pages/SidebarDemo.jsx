import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  List,
  ListItem,
  ListIcon,
  Icon,
} from "@chakra-ui/react";
import {
  FiHome,
  FiFileText,
  FiClock,
  FiBook,
  FiSettings,
} from "react-icons/fi";
import { HiOutlineUser, HiOutlineUserGroup } from "react-icons/hi2";
import { IoCalendarOutline } from "react-icons/io5";

const SidebarDemo = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Sidebar Navigation Structure Demo
          </Heading>
          <Text color="gray.600">
            Standards has been moved from Settings submenu to be its own
            top-level sidebar item.
          </Text>
        </Box>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              New Navigation Structure
            </Heading>
            <List spacing={3}>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={FiHome} color="brandPrimary.500" boxSize={5} />
                <Text fontWeight="semibold">Dashboard</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon
                  as={FiFileText}
                  color="brandPrimary.500"
                  boxSize={5}
                />
                <Text fontWeight="semibold">Documents</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={FiClock} color="brandPrimary.500" boxSize={5} />
                <Text fontWeight="semibold">Requests</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon
                  as={HiOutlineUser}
                  color="brandPrimary.500"
                  boxSize={5}
                />
                <Text fontWeight="semibold">Users</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon
                  as={HiOutlineUserGroup}
                  color="brandPrimary.500"
                  boxSize={5}
                />
                <Text fontWeight="semibold">Teams</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon
                  as={IoCalendarOutline}
                  color="brandPrimary.500"
                  boxSize={5}
                />
                <Text fontWeight="semibold">Audit Schedules</Text>
              </ListItem>
              <ListItem
                display="flex"
                alignItems="center"
                bg="green.50"
                p={2}
                borderRadius="md"
                borderWidth="2px"
                borderColor="green.500"
              >
                <ListIcon as={FiBook} color="green.500" boxSize={5} />
                <Text fontWeight="bold" color="green.700">
                  Standards (NEW - Standalone Item)
                </Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon
                  as={FiSettings}
                  color="brandPrimary.500"
                  boxSize={5}
                />
                <Text fontWeight="semibold">Settings</Text>
              </ListItem>
            </List>
          </CardBody>
        </Card>

        <Card bg="blue.50">
          <CardBody>
            <Heading size="sm" mb={3} color="blue.700">
              What Changed?
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm">
                ✅ <strong>Standards</strong> is now a top-level navigation item
                with the <Icon as={FiBook} /> book icon
              </Text>
              <Text fontSize="sm">
                ✅ <strong>Standards</strong> has been removed from the Settings
                submenu
              </Text>
              <Text fontSize="sm">
                ✅ Users can access Standards directly from the sidebar without
                expanding Settings
              </Text>
              <Text fontSize="sm">
                ✅ Standards appears between Audit Schedules and Settings in the
                navigation
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default SidebarDemo;
