import {
  VStack,
  Flex,
  Heading,
  Spinner,
  Spacer,
  Text,
  Button,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import OrganizationCard from "./OrganizationCard";
import { useOrganizations } from "../../../context/_useContext";
import PropTypes from "prop-types";
import OrganizationForm from "./OrganizationForm";

const Organizations = ({ schedule = {}, setFormData = () => {} }) => {
  const { loading, organizations } = useOrganizations();
  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);

  // Track which organization cards are expanded (by ID)
  // This preserves expanded state across re-renders when organizations update
  const [expandedOrgIds, setExpandedOrgIds] = useState(new Set());

  // Track whether to show the organization form
  const [showOrgForm, setShowOrgForm] = useState(false);

  // Toggle expanded state for an organization
  const toggleExpanded = useCallback((orgId) => {
    setExpandedOrgIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  }, []);

  if (!schedule?._id) return "";

  // Show form if no organizations exist or if user clicked "Add Organization"
  const shouldShowForm = organizations?.length === 0 || showOrgForm;

  return (
    <VStack align="stretch" spacing={4} data-tour="organizations-section">
      <Flex justify="space-between" align="center">
        <Heading size="md">Organizations</Heading>
        <Spacer />
        <Text fontSize="xs" color="gray.500">
          {organizations?.length > 0
            ? `${organizations?.length} Organization${organizations?.length === 1 ? `` : `s`}`
            : `No Organizations Yet`}
        </Text>
      </Flex>

      {loading && organizations?.length < 1 && (
        <Flex justify="center" py={8}>
          <Spinner size="md" />
        </Flex>
      )}

      {organizations?.length > 0 && (
        <VStack align="stretch" spacing={3}>
          {organizations.map((org) => (
            <OrganizationCard
              key={org._id}
              loading={loading}
              organization={org}
              team={org.team || { name: org.teamName || "Unknown Team" }}
              auditors={org.auditors || []}
              isExpanded={expandedOrgIds.has(org._id)}
              onToggleExpanded={() => toggleExpanded(org._id)}
              schedule={schedule}
            />
          ))}
        </VStack>
      )}

      {/* Show form or Add Organization button */}
      {isScheduleOngoing && (
        <>
          {loading || !shouldShowForm ? (
            <Button
              leftIcon={<FiPlus />}
              onClick={() => setShowOrgForm(true)}
              colorScheme="brandPrimary"
              variant="outline"
              size="md"
              data-tour="add-organization"
            >
              Add Organization
            </Button>
          ) : (
            <OrganizationForm
              {...{ schedule, setFormData }}
              onCancel={() => setShowOrgForm(false)}
              onSuccess={() => setShowOrgForm(false)}
            />
          )}
        </>
      )}
    </VStack>
  );
};

Organizations.propTypes = {
  schedule: PropTypes.object.isRequired,
  setFormData: PropTypes.func,
};

export default Organizations;
