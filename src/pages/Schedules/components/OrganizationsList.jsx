import {
  Card,
  CardBody,
  VStack,
  Flex,
  Heading,
  Button,
  Spinner,
  Box,
  Text,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import OrganizationCard from "../OrganizationCard";

const OrganizationsList = ({
  organizations = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md">Organizations</Heading>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              colorScheme="brandPrimary"
              onClick={onAdd}
            >
              Add Organization
            </Button>
          </Flex>

          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner size="md" />
            </Flex>
          ) : organizations.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" mb={4}>
                No organizations added yet
              </Text>
              <Text fontSize="sm" color="gray.400">
                Add teams to this audit schedule to get started
              </Text>
            </Box>
          ) : (
            <VStack align="stretch" spacing={3}>
              {organizations.map((org) => (
                <OrganizationCard
                  key={org._id}
                  organization={org}
                  team={org.team || { name: org.teamName || "Unknown Team" }}
                  auditors={org.auditors || []}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrganizationsList;
