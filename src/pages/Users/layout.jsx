import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Button,
  Input,
  HStack,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { useUsers } from "../../context/UsersContext";
import { useState } from "react";

const Layout = () => {
  const { users, loading, error, fetchUsers } = useUsers();
  const userList = Array.isArray(users) ? users : [];
  const [search, setSearch] = useState("");

  const filteredUsers = userList?.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase()) ||
      user.userType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={4}>
      <HStack mb={4} justify="space-between">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
        />
        <Button
          onClick={fetchUsers}
          colorScheme="brandPrimary"
          isLoading={loading}
        >
          Refresh
        </Button>
      </HStack>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Department</Th>
              <Th>User Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user) => (
              <Tr key={user.id || user._id}>
                <Td>
                  <HStack>
                    <Avatar size="sm" name={user.name} src={user.avatar} />
                    <span>{user.name}</span>
                  </HStack>
                </Td>
                <Td>{user.email}</Td>
                <Td>{user.department}</Td>
                <Td>
                  <Badge
                    colorScheme={user.userType === "Admin" ? "purple" : "gray"}
                  >
                    {user.userType}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default Layout;
