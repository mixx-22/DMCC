import {
  VStack,
  Flex,
  Heading,
  Spinner,
  Spacer,
  Text,
  Button,
} from "@chakra-ui/react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import OrganizationCard from "./OrganizationCard";
import { useOrganizations } from "../../../context/_useContext";
import PropTypes from "prop-types";
import OrganizationForm from "./OrganizationForm";
import apiService from "../../../services/api";

const Organizations = ({ schedule = {}, setFormData = () => {} }) => {
  const { loading, organizations } = useOrganizations();
  const isScheduleOngoing = useMemo(() => schedule?.status === 0, [schedule]);

  // Track which organization cards are expanded (by ID)
  // This preserves expanded state across re-renders when organizations update
  const [expandedOrgIds, setExpandedOrgIds] = useState(new Set());

  // Track whether to show the organization form
  const [showOrgForm, setShowOrgForm] = useState(false);

  // State for storing fetched standard clauses
  const [standardClauses, setStandardClauses] = useState([]);
  const [loadingClauses, setLoadingClauses] = useState(false);

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

  // Fetch standard clauses once for the schedule
  useEffect(() => {
    const fetchStandardClauses = async () => {
      // Get standard ID or object from schedule
      const standard = schedule?.standard;
      
      // If standard is null/undefined, no need to fetch
      if (!standard) {
        setStandardClauses([]);
        return;
      }
      
      // If standard is an object and already has clauses, use them
      if (typeof standard === 'object' && standard.clauses && Array.isArray(standard.clauses)) {
        setStandardClauses(standard.clauses);
        return;
      }
      
      // Extract standard ID - could be string ID or object with id property
      const standardId = typeof standard === 'string' ? standard : (standard.id || standard._id);
      
      // If no valid ID, can't fetch
      if (!standardId) {
        setStandardClauses([]);
        return;
      }
      
      // Don't fetch if already loading
      if (loadingClauses) return;
      
      setLoadingClauses(true);
      
      try {
        const USE_API = import.meta.env.VITE_USE_API !== "false";
        const STANDARDS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_STANDARDS || "/standards";
        
        if (!USE_API) {
          // Mock data for development - use the same structure as StandardPage
          const MOCK_CLAUSES = [
            {
              id: "003073c2-e848-4725-983c-553283d77460",
              clause: "4",
              title: "Context of the Organization",
              subClauses: [
                { id: "97124ee1-8267-45c7-b381-6e2e39080357", clause: "4.1", description: "Context of the ITSMS." },
                { id: "1fc0e589-89a3-4248-a94f-7e21a218358a", clause: "4.2", description: "Interested parties." },
                { id: "8a6a88af-02f0-4b06-a40f-0b55a4ffa17c", clause: "4.3", description: "Scope of the ITSMS." },
                { id: "b8e835b1-77ca-48ed-a0de-667645ae4d97", clause: "4.4", description: "Service management system." },
              ],
            },
            {
              id: "a8060b89-6c41-4ab6-bdff-dcdb2d4a59eb",
              clause: "5",
              title: "Leadership",
              subClauses: [
                { id: "4dcdc959-023f-4930-ab08-15ac49f5ddb1", clause: "5.1", description: "Leadership and commitment." },
                { id: "7f3f5c1e-5240-41bd-90ba-0126d9af5b80", clause: "5.2", description: "Service management policy." },
                { id: "84887b66-0e22-4a9d-8bb3-a81de9d37f34", clause: "5.3", description: "Roles and responsibilities." },
              ],
            },
            {
              id: "84862eb4-92e1-44c5-9a65-37d5dfb48012",
              clause: "6",
              title: "Planning",
              subClauses: [
                { id: "f0782c18-9d9f-4e7f-ba24-e284ff19c6e3", clause: "6.1", description: "Risks and opportunities." },
                { id: "9e0f7878-00c6-46c5-a938-063c9477cc5b", clause: "6.2", description: "Service management objectives." },
              ],
            },
            {
              id: "20808972-d3b2-4539-8d77-14b08919e5df",
              clause: "7",
              title: "Support",
              subClauses: [
                { id: "b48fc49e-519e-451e-a681-6bcc20f034d4", clause: "7.1", description: "Resources." },
                { id: "69b0ca89-ab5a-4e14-a03d-b03471668feb", clause: "7.2", description: "Competence." },
                { id: "6ab7935c-387e-4f97-a03d-c407c7ca6f37", clause: "7.3", description: "Awareness." },
                { id: "5e1c70ef-a8f6-4c7b-80b5-a55adda31ea6", clause: "7.4", description: "Communication." },
                { id: "f501418a-84ec-4972-8728-d0667e954971", clause: "7.5", description: "Documented information." },
              ],
            },
            {
              id: "89cf6146-2385-4273-8bf3-d2ef73407598",
              clause: "8",
              title: "Operation",
              subClauses: [
                { id: "09577f7b-91be-4153-b982-0d863122be80", clause: "8.1", description: "Service portfolio management." },
                { id: "7d27a6be-e811-41d7-9b36-a9440f3f3cd1", clause: "8.2", description: "Service level management." },
                { id: "7ac4cc0f-499e-4ee7-aa7f-2ab215d4f0d2", clause: "8.3", description: "Incident and request management." },
                { id: "049be948-ccdf-4374-88c9-08fa8e059eb6", clause: "8.4", description: "Change management." },
                { id: "c4268592-d7c6-4078-a8e7-7c0a08b5fb4c", clause: "8.5", description: "Configuration management." },
              ],
            },
            {
              id: "9dd36a4f-f7aa-4c63-b3ae-f2572d3304d9",
              clause: "9",
              title: "Performance Evaluation",
              subClauses: [
                { id: "e3965044-cd59-43d5-a550-44181faa874f", clause: "9.1", description: "Monitoring and measurement." },
                { id: "68ac1307-2493-42ba-8ab2-f4e93a6bc8c0", clause: "9.2", description: "Internal audit." },
                { id: "c381e4db-7c0b-427d-8330-462a2e5e4226", clause: "9.3", description: "Management review." },
              ],
            },
            {
              id: "66be6e11-34eb-4554-8889-623e942b27d1",
              clause: "10",
              title: "Improvement",
              subClauses: [
                { id: "46b5d4a8-a9ba-4dae-95b7-896ddac43a01", clause: "10.1", description: "Nonconformity and corrective action." },
                { id: "2f71bf7d-8a5b-491c-844c-b350d39083e1", clause: "10.2", description: "Continual improvement." },
              ],
            },
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          setStandardClauses(MOCK_CLAUSES);
          setLoadingClauses(false);
          return;
        }
        
        // Fetch from API
        const response = await apiService.request(`${STANDARDS_ENDPOINT}/${standardId}`, {
          method: "GET",
        });
        
        const data = response?.data || response;
        const clauses = data?.clauses || [];
        setStandardClauses(clauses);
      } catch (error) {
        console.error("Failed to fetch standard clauses:", error);
        setStandardClauses([]);
      } finally {
        setLoadingClauses(false);
      }
    };
    
    fetchStandardClauses();
  }, [schedule?.standard]);

  if (!schedule?._id) return "";

  // Show form if no organizations exist or if user clicked "Add Organization"
  const shouldShowForm = organizations?.length === 0 || showOrgForm;

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
              standardClausesFromParent={standardClauses}
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
