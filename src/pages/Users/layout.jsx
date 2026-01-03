import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  HStack,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useUsers } from "../../context/_useContext";
import Pagination from "../../components/Pagination";
import UsersSkeleton from "../../components/UsersSkeleton";

const MotionBox = motion(Box);

const Layout = () => {
  const { users, loading, error, page, limit, total, search, setPage, setSearch } = useUsers();
  // Use users?.data or empty array if not present
  const userList = Array.isArray(users?.data) ? users.data : [];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  };

  return (
    <Box p={4}>
      <HStack mb={4} justify="space-between">
        <Input
          placeholder="Search users (min. 2 characters)..."
          value={search}
          onChange={handleSearchChange}
          maxW="300px"
        />
        <Text fontSize="sm" color="gray.600">
          {total > 0 && `${total} user${total !== 1 ? 's' : ''} found`}
        </Text>
      </HStack>

      {error ? (
        <Text color="red.500">{error}</Text>
      ) : loading ? (
        <UsersSkeleton rows={limit} />
      ) : (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
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
              {userList.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={8}>
                    <Text color="gray.500">
                      {search && search.length >= 2 
                        ? "No users found matching your search" 
                        : "No users found"}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                userList.map((user) => {
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
                })
              )}
            </Tbody>
          </Table>
        </MotionBox>
      )}

      {!loading && !error && total > 0 && (
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
};

export default Layout;
