import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const OrganizationsList = ({ scheduleId }) => {
  const [organizations] = useState([]);
  const [loading] = useState(false);

  const handleEdit = (org) => {
    // TODO: Implement edit
    console.log("Edit organization:", org);
  };

  const handleDelete = async (org) => {
    const result = await Swal.fire({
      title: "Delete Organization?",
      text: `Are you sure you want to remove ${org.teamName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // TODO: Implement delete
        toast.success("Organization Deleted", {
          description: `${org.teamName} has been removed`,
          duration: 3000,
        });
      } catch (error) {
        toast.error("Delete Failed", {
          description: error.message || "Failed to delete organization",
          duration: 3000,
        });
      }
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="brandPrimary.500" />
      </Box>
    );
  }

  if (organizations.length === 0) {
    return (
      <Box
        textAlign="center"
        py={12}
        borderWidth="1px"
        borderRadius="md"
        borderStyle="dashed"
      >
        <Text color="gray.500">
          No organizations added yet. Click "Add Organization" to get started.
        </Text>
      </Box>
    );
  }

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Team</Th>
          <Th>Auditors</Th>
          <Th>Visits</Th>
          <Th>Status</Th>
          <Th width="50px"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {organizations.map((org) => (
          <Tr key={org._id}>
            <Td>{org.teamName}</Td>
            <Td>
              <Badge colorScheme="purple">
                {org.auditors?.length || 0} Auditor{org.auditors?.length !== 1 ? "s" : ""}
              </Badge>
            </Td>
            <Td>
              <Badge colorScheme="blue">
                {org.visits?.length || 0} Visit{org.visits?.length !== 1 ? "s" : ""}
              </Badge>
            </Td>
            <Td>
              {org.status === 1 ? (
                <Badge colorScheme="green">Completed</Badge>
              ) : (
                <Badge colorScheme="gray">Pending</Badge>
              )}
            </Td>
            <Td>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="sm"
                  aria-label="More options"
                />
                <MenuList>
                  <MenuItem icon={<FiEdit />} onClick={() => handleEdit(org)}>
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<FiTrash2 />}
                    onClick={() => handleDelete(org)}
                    color="red.500"
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default OrganizationsList;
