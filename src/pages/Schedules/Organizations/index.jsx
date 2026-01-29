import { VStack, Flex, Heading, Spinner, Spacer, Text } from "@chakra-ui/react";
import OrganizationCard from "./OrganizationCard";
import { useOrganizations } from "../../../context/_useContext";
import PropTypes from "prop-types";
import OrganizationForm from "./OrganizationForm";

const Organizations = ({ schedule = {}, setFormData = () => {} }) => {
  const { loading, organizations } = useOrganizations();

  if (!schedule?._id) return "";
  return (
    <VStack align="stretch" spacing={4}>
      <Flex justify="space-between" align="center">
        <Heading size="md">Organizations</Heading>
        <Spacer />
        <Text fontSize="xs" color="gray.500">
          {organizations?.length > 0
            ? `${organizations?.length} Organization${organizations?.length === 1 ? `` : `s`}`
            : `No Organizations Yet`}
        </Text>
      </Flex>

      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner size="md" />
        </Flex>
      ) : organizations?.length > 0 ? (
        <VStack align="stretch" spacing={3}>
          {organizations.map((org) => (
            <OrganizationCard
              key={org._id}
              organization={org}
              team={org.team || { name: org.teamName || "Unknown Team" }}
              auditors={org.auditors || []}
            />
          ))}
        </VStack>
      ) : (
        ""
      )}
      <OrganizationForm {...{ schedule, setFormData }} />
    </VStack>
  );
};

Organizations.propTypes = {
  schedule: PropTypes.object.isRequired,
  setFormData: PropTypes.func,
};

export default Organizations;
