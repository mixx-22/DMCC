import { VStack, Flex, Heading, Spinner, Spacer, Text } from "@chakra-ui/react";
import OrganizationCard from "./OrganizationCard";
import { useOrganizations } from "../../../context/_useContext";
import PropTypes from "prop-types";
import { useState } from "react";
import Swal from "sweetalert2";
import OrganizationForm from "./OrganizationForm";

const Organizations = ({ schedule = {}, setFormData = () => {} }) => {
  const {
    loading,
    organizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  } = useOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const handleSaveOrganization = async (organizationData) => {
    try {
      let result;
      if (selectedOrganization) {
        // Update existing organization
        result = await updateOrganization(
          selectedOrganization._id,
          organizationData,
        );
      } else {
        // Create new organization - backend will add its ID to schedule.organizations
        result = await createOrganization(organizationData);

        // Update local schedule data to include the new organization ID
        if (result && result._id && schedule) {
          const updatedSchedule = {
            ...schedule,
            organizations: [...(schedule.organizations || []), result._id],
          };
          setFormData((prev) => ({ ...prev, ...updatedSchedule }));
        }
      }
      setSelectedOrganization(null);
    } catch (error) {
      console.error("Failed to save organization:", error);
      // Toast is handled by context
    }
  };

  const handleDeleteOrganization = async (organization) => {
    const result = await Swal.fire({
      title: "Delete Organization?",
      text: `Are you sure you want to remove this team from the audit schedule? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteOrganization(organization._id);

        // Update local schedule data to remove the organization ID
        if (schedule) {
          const updatedSchedule = {
            ...schedule,
            organizations: (schedule.organizations || []).filter(
              (orgId) => orgId !== organization._id,
            ),
          };
          setFormData((prev) => ({ ...prev, ...updatedSchedule }));
        }
      } catch (error) {
        console.error("Failed to delete organization:", error);
        // Toast is handled by context
      }
    }
  };

  console.log({ handleDeleteOrganization, handleSaveOrganization });
  if (!schedule?._id) return "";
  return (
    <VStack align="stretch" spacing={4}>
      <Flex justify="space-between" align="center">
        <Heading size="md">Organizations</Heading>
        <Spacer />
        <Text fontSize="xs" color="gray.500">
          {organizations?.length > 0
            ? `${organizations?.length} Organization${organizations?.length === 1 && `s`}`
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
      <OrganizationForm />
    </VStack>
  );
};

Organizations.propTypes = {
  schedule: PropTypes.object.isRequired,
  setFormData: PropTypes.func,
};

export default Organizations;
