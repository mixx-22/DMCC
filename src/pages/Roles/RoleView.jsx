import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEdit, FiArrowLeft } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import PermissionsCheckboxGroup from "../../components/PermissionsCheckboxGroup";
import { useRoles } from "../../context/_useContext";

const RoleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoleById } = useRoles();
  const role = getRoleById(id);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (!role) {
    return (
      <Box p={4}>
        <Text>Role not found</Text>
        <Button mt={4} onClick={() => navigate("/roles")}>
          Back to Roles
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack mb={6} justify="space-between">
        <HStack>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => navigate("/roles")}
          >
            Back
          </Button>
        </HStack>
        <Button
          leftIcon={<FiEdit />}
          colorScheme="brandPrimary"
          onClick={() => navigate(`/roles/${id}/edit`)}
        >
          Edit Role
        </Button>
      </HStack>

      <VStack align="stretch" spacing={6}>
        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                Role Title
              </Text>
              <Heading size="lg">{role.title}</Heading>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>
                Description
              </Text>
              <Text>{role.description}</Text>
            </Box>

            <Divider />

            <HStack spacing={8}>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Created At
                </Text>
                <Text fontWeight="medium">
                  {new Date(role.createdAt).toLocaleDateString()}{" "}
                  <Text as="span" fontSize="sm" color="gray.500">
                    (
                    {formatDistanceToNow(new Date(role.createdAt), {
                      addSuffix: true,
                    })}
                    )
                  </Text>
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Updated At
                </Text>
                <Text fontWeight="medium">
                  {new Date(role.updatedAt).toLocaleDateString()}{" "}
                  <Text as="span" fontSize="sm" color="gray.500">
                    (
                    {formatDistanceToNow(new Date(role.updatedAt), {
                      addSuffix: true,
                    })}
                    )
                  </Text>
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Box>

        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
        >
          <Heading size="md" mb={4}>
            Permissions
          </Heading>
          <PermissionsCheckboxGroup permissions={role.permissions} readOnly />
        </Box>
      </VStack>
    </Box>
  );
};

export default RoleView;
