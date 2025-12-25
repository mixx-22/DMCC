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
  // Use users?.data or empty array if not present
  const userList = Array.isArray(users?.data) ? users.data : [];
  const [search, setSearch] = useState("");

  const filteredUsers = userList.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.middleName || ""} ${
      user.lastName || ""
    }`.trim();
    const roles = Array.isArray(user.role) ? user.role.join(", ") : "";
    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
      roles.toLowerCase().includes(search.toLowerCase())
    );
  });

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
              <Th>Roles</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user) => {
              const fullName = `${user.firstName || ""} ${
                user.middleName || ""
              } ${user.lastName || ""}`.trim();
              return (
                <Tr key={user.userId || user.employeeId}>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={fullName} />
                      <span>{fullName}</span>
                    </HStack>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    {user.role && user.role.length > 0 ? (
                      user.role.map((r) => (
                        <Badge key={r} colorScheme="purple" mr={1}>
                          {r}
                        </Badge>
                      ))
                    ) : (
                      <Badge colorScheme="gray">No Role</Badge>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={user.isActive ? "green" : "red"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default Layout;
