import {
  Box,
  Button,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tooltip,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEye, FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import { useRoles } from "../../context/RolesContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";

const RolesList = () => {
  const { roles, deleteRole } = useRoles();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Calculate permissions summary
  const getPermissionsSummary = (permissions) => {
    if (!permissions) return "No permissions";

    const entities = Object.keys(permissions);
    const totalPermissions = entities.reduce((acc, entity) => {
      const perms = permissions[entity];
      return acc + Object.values(perms).filter(Boolean).length;
    }, 0);

    const maxPermissions = entities.length * 4; // 4 permissions per entity (c, r, u, d)
    return `${totalPermissions}/${maxPermissions} permissions`;
  };

  const filteredRoles = roles.filter((role) => {
    const searchLower = search.toLowerCase();
    return (
      role.title.toLowerCase().includes(searchLower) ||
      role.description.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (role) => {
    const result = await Swal.fire({
      title: "Delete Role?",
      text: `Are you sure you want to delete "${role.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      deleteRole(role.id);
      Swal.fire({
        title: "Deleted!",
        text: "Role has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
        />
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brandPrimary"
          onClick={() => navigate("/roles/new")}
        >
          New Role
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Role Title</Th>
              <Th>Description</Th>
              <Th>Permissions Summary</Th>
              <Th>Created At</Th>
              <Th>Updated At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRoles.map((role) => (
              <Tr key={role.id}>
                <Td fontWeight="semibold">{role.title}</Td>
                <Td maxW="300px">
                  <Text noOfLines={2}>{role.description}</Text>
                </Td>
                <Td>
                  <Badge colorScheme="blue">
                    {getPermissionsSummary(role.permissions)}
                  </Badge>
                </Td>
                <Td>
                  <Tooltip label={new Date(role.createdAt).toLocaleString()}>
                    <Text fontSize="sm">
                      {formatDistanceToNow(new Date(role.createdAt), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Tooltip label={new Date(role.updatedAt).toLocaleString()}>
                    <Text fontSize="sm">
                      {formatDistanceToNow(new Date(role.updatedAt), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Tooltip>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Tooltip label="View">
                      <IconButton
                        aria-label="View role"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/roles/${role.id}/view`)}
                      />
                    </Tooltip>
                    <Tooltip label="Edit">
                      <IconButton
                        aria-label="Edit role"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/roles/${role.id}/edit`)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        aria-label="Delete role"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(role)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
            {filteredRoles.length === 0 && (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <Text color="gray.500">No roles found</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default RolesList;
