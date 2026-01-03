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
  Tooltip,
  Text,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRoles } from "../../context/_useContext";
import { generateRoleDescriptions } from "../../helpers/describePermissions";
import { Link as RouterLink } from "react-router-dom";

const RolesList = () => {
  const { roles = [] } = useRoles();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredRoles = roles?.filter((role) => {
    const searchLower = search.toLowerCase();
    return (
      role.title.toLowerCase().includes(searchLower) ||
      role.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      <HStack mb={4} justify="space-between">
        <Input
          placeholder="Search Roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
        />
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brandPrimary"
          onClick={() => navigate("/roles/new")}
        >
          Create New Role
        </Button>
      </HStack>

      <Box overflowX="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Role Title</Th>
              <Th>Summary</Th>
              <Th>Last Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRoles.map((role) => (
              <LinkBox as={Tr} key={role._id}>
                <Td fontWeight="semibold">
                  <LinkOverlay as={RouterLink} to={`/roles/${role._id}`}>
                    {role.title}
                  </LinkOverlay>

                  <Text
                    fontWeight="normal"
                    fontSize="sm"
                    noOfLines={2}
                    opacity={0.7}
                  >
                    {role.description}
                  </Text>
                </Td>

                <Td>
                  <Text fontWeight="normal" fontSize="sm" noOfLines={2}>
                    {generateRoleDescriptions(role.permissions).short}
                  </Text>
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
              </LinkBox>
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
