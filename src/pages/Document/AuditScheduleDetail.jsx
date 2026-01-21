import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Center,
  Badge,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiUsers,
  FiFile,
  FiAlertCircle,
  FiCheckCircle,
  FiTrash2,
  FiSave,
} from "react-icons/fi";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Breadcrumbs from "../../components/Document/Breadcrumbs";
import UserAsyncSelect from "../../components/UserAsyncSelect";
import TeamAsyncSelect from "../../components/TeamAsyncSelect";
import AuditScheduleAsyncSelect from "../../components/AuditScheduleAsyncSelect";
import DocumentSelector from "../../components/DocumentSelector";
import { useDocuments } from "../../context/_useContext";
import Timestamp from "../../components/Timestamp";

const AuditScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDocumentById, updateDocument } = useDocuments();

  const [auditSchedule, setAuditSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamData, setTeamData] = useState({});

  const fetchedRef = useRef(false);

  // Fetch audit schedule
  useEffect(() => {
    const loadAuditSchedule = async () => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        const doc = await fetchDocumentById(id);
        if (!doc) {
          throw new Error("Audit schedule not found");
        }
        if (doc.type !== "auditSchedule") {
          throw new Error("Document is not an audit schedule");
        }
        setAuditSchedule(doc);
      } catch (error) {
        console.error("Failed to load audit schedule:", error);
        toast.error("Failed to Load Audit Schedule", {
          description: error.message || "Could not load audit schedule",
          duration: 3000,
        });
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };

    loadAuditSchedule();
  }, [id, fetchDocumentById, navigate]);

  // Handle adding a team to the organization
  const handleAddTeams = async (teams) => {
    if (!teams || teams.length === 0) return;

    try {
      const updatedOrganization = { ...(auditSchedule.metadata.organization || {}) };

      teams.forEach((team) => {
        if (!updatedOrganization[team.id]) {
          updatedOrganization[team.id] = {
            teamName: team.name,
            status: 0,
            documents: [],
            visitDate: "",
            revisitDate: "",
            findings: [],
            CAPA: [],
            auditors: [],
            previousAudit: null,
          };
        }
      });

      const updatedMetadata = {
        ...auditSchedule.metadata,
        organization: updatedOrganization,
      };

      await updateDocument(id, { metadata: updatedMetadata });

      setAuditSchedule({
        ...auditSchedule,
        metadata: updatedMetadata,
      });

      toast.success("Team(s) Added", {
        description: `${teams.length} team(s) added to audit schedule`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to add teams:", error);
      toast.error("Failed to Add Team(s)", {
        description: error.message || "Could not add team(s) to audit schedule",
        duration: 3000,
      });
    }
  };

  // Handle removing a team from the organization
  const handleRemoveTeam = async (teamId) => {
    try {
      const updatedOrganization = { ...(auditSchedule.metadata.organization || {}) };
      delete updatedOrganization[teamId];

      const updatedMetadata = {
        ...auditSchedule.metadata,
        organization: updatedOrganization,
      };

      await updateDocument(id, { metadata: updatedMetadata });

      setAuditSchedule({
        ...auditSchedule,
        metadata: updatedMetadata,
      });

      toast.success("Team Removed", {
        description: "Team removed from audit schedule",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to remove team:", error);
      toast.error("Failed to Remove Team", {
        description: error.message || "Could not remove team from audit schedule",
        duration: 3000,
      });
    }
  };

  // Handle saving team data (batch update)
  const handleSaveTeamData = async (teamId) => {
    setSaving(true);
    try {
      const data = teamData[teamId];
      if (!data) {
        setSaving(false);
        return;
      }

      const updatedOrganization = { ...(auditSchedule.metadata.organization || {}) };
      updatedOrganization[teamId] = {
        ...updatedOrganization[teamId],
        ...data,
      };

      const updatedMetadata = {
        ...auditSchedule.metadata,
        organization: updatedOrganization,
      };

      await updateDocument(id, { metadata: updatedMetadata });

      setAuditSchedule({
        ...auditSchedule,
        metadata: updatedMetadata,
      });

      // Clear local team data
      setTeamData((prev) => {
        const newData = { ...prev };
        delete newData[teamId];
        return newData;
      });

      toast.success("Changes Saved", {
        description: "Team audit data saved successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to save team data:", error);
      toast.error("Failed to Save Changes", {
        description: error.message || "Could not save team audit data",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Update local team data
  const updateLocalTeamData = (teamId, field, value) => {
    setTeamData((prev) => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [field]: value,
      },
    }));
  };

  // Get current team data (local or from audit schedule)
  const getTeamData = (teamId) => {
    const localData = teamData[teamId] || {};
    const savedData = auditSchedule?.metadata?.organization?.[teamId] || {};
    return { ...savedData, ...localData };
  };

  // Check if team has unsaved changes
  const hasUnsavedChanges = (teamId) => {
    return teamData[teamId] && Object.keys(teamData[teamId]).length > 0;
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <PageHeader />
        <Container maxW="container.xl" py={8}>
          <Center py={20}>
            <Spinner size="xl" color="purple.500" />
          </Center>
        </Container>
        <PageFooter />
      </Box>
    );
  }

  if (!auditSchedule) {
    return (
      <Box minH="100vh" bg="gray.50">
        <PageHeader />
        <Container maxW="container.xl" py={8}>
          <Center py={20}>
            <Text>Audit schedule not found</Text>
          </Center>
        </Container>
        <PageFooter />
      </Box>
    );
  }

  const organizations = auditSchedule.metadata?.organization || {};
  const organizationKeys = Object.keys(organizations);

  return (
    <Box minH="100vh" bg="gray.50">
      <PageHeader />
      <Container maxW="container.xl" py={8}>
        <VStack align="stretch" spacing={6}>
          {/* Breadcrumbs */}
          <Breadcrumbs currentDocument={auditSchedule} />

          {/* Header */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">{auditSchedule.title}</Heading>
                    <HStack>
                      <Badge colorScheme="purple">Audit Schedule</Badge>
                      {auditSchedule.metadata?.code && (
                        <Badge colorScheme="gray">
                          {auditSchedule.metadata.code}
                        </Badge>
                      )}
                      {auditSchedule.metadata?.type && (
                        <Badge colorScheme="blue">
                          {auditSchedule.metadata.type}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>

                {auditSchedule.description && (
                  <Text color="gray.600">{auditSchedule.description}</Text>
                )}

                <Divider />

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Standard
                    </Text>
                    <Text fontWeight="medium">
                      {auditSchedule.metadata?.standard || "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Created
                    </Text>
                    <Timestamp date={auditSchedule.createdAt} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Last Updated
                    </Text>
                    <Timestamp date={auditSchedule.updatedAt} />
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Add Teams Section */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Organizations/Teams</Heading>
                <Text color="gray.600" fontSize="sm">
                  Add organizations or teams to schedule audits for. Each team can
                  have its own audit schedule, documents, and findings.
                </Text>
                <TeamAsyncSelect
                  value={[]}
                  onChange={handleAddTeams}
                  label="Add Teams to Audit"
                />
              </VStack>
            </CardBody>
          </Card>

          {/* Team Audit Details */}
          {organizationKeys.length > 0 ? (
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Team Audit Details</Heading>
                  <Accordion allowMultiple>
                    {organizationKeys.map((teamId) => {
                      const team = organizations[teamId];
                      const currentData = getTeamData(teamId);
                      const hasChanges = hasUnsavedChanges(teamId);

                      return (
                        <AccordionItem key={teamId}>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Text fontWeight="medium">
                                    {team.teamName || `Team ${teamId}`}
                                  </Text>
                                  {hasChanges && (
                                    <Badge colorScheme="orange" fontSize="xs">
                                      Unsaved Changes
                                    </Badge>
                                  )}
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={6}>
                              {/* Visit Date */}
                              <FormControl>
                                <FormLabel>
                                  <HStack>
                                    <FiCalendar />
                                    <Text>Visit Date</Text>
                                  </HStack>
                                </FormLabel>
                                <Input
                                  type="date"
                                  value={currentData.visitDate || ""}
                                  onChange={(e) =>
                                    updateLocalTeamData(
                                      teamId,
                                      "visitDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </FormControl>

                              {/* Revisit Date */}
                              <FormControl>
                                <FormLabel>
                                  <HStack>
                                    <FiCalendar />
                                    <Text>Revisit Date</Text>
                                  </HStack>
                                </FormLabel>
                                <Input
                                  type="date"
                                  value={currentData.revisitDate || ""}
                                  onChange={(e) =>
                                    updateLocalTeamData(
                                      teamId,
                                      "revisitDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </FormControl>

                              {/* Auditors */}
                              <UserAsyncSelect
                                value={currentData.auditors || []}
                                onChange={(auditors) =>
                                  updateLocalTeamData(teamId, "auditors", auditors)
                                }
                                label={
                                  <HStack>
                                    <FiUsers />
                                    <Text>Auditors</Text>
                                  </HStack>
                                }
                                displayMode="table"
                              />

                              {/* Previous Audit */}
                              <AuditScheduleAsyncSelect
                                value={currentData.previousAudit || null}
                                onChange={(audit) =>
                                  updateLocalTeamData(
                                    teamId,
                                    "previousAudit",
                                    audit
                                  )
                                }
                              />

                              {/* Documents */}
                              <DocumentSelector
                                value={currentData.documents || []}
                                onChange={(docs) =>
                                  updateLocalTeamData(teamId, "documents", docs)
                                }
                                label={
                                  <HStack>
                                    <FiFile />
                                    <Text>Audit Documents</Text>
                                  </HStack>
                                }
                                parentId={id}
                              />

                              {/* Findings (Placeholder) */}
                              <Alert status="info" borderRadius="md">
                                <AlertIcon as={FiAlertCircle} />
                                <VStack align="start" spacing={1}>
                                  <AlertTitle fontSize="sm">
                                    Findings Section
                                  </AlertTitle>
                                  <AlertDescription fontSize="xs">
                                    This section will be available when resolving the
                                    audit. Findings will be added during the audit
                                    resolution process.
                                  </AlertDescription>
                                </VStack>
                              </Alert>

                              {/* CAPA (Placeholder) */}
                              <Alert status="info" borderRadius="md">
                                <AlertIcon as={FiCheckCircle} />
                                <VStack align="start" spacing={1}>
                                  <AlertTitle fontSize="sm">CAPA Section</AlertTitle>
                                  <AlertDescription fontSize="xs">
                                    Corrective and Preventive Actions (CAPA) will be
                                    available when resolving the audit. This section
                                    will track actions taken to address findings.
                                  </AlertDescription>
                                </VStack>
                              </Alert>

                              {/* Action Buttons */}
                              <HStack justify="space-between">
                                <Button
                                  leftIcon={<FiTrash2 />}
                                  colorScheme="red"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveTeam(teamId)}
                                >
                                  Remove Team
                                </Button>
                                <Button
                                  leftIcon={<FiSave />}
                                  colorScheme="purple"
                                  onClick={() => handleSaveTeamData(teamId)}
                                  isLoading={saving}
                                  isDisabled={!hasChanges}
                                >
                                  Save Changes
                                </Button>
                              </HStack>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle>No Teams Added</AlertTitle>
                <AlertDescription>
                  Add teams to this audit schedule to begin scheduling audits and
                  managing audit documentation.
                </AlertDescription>
              </VStack>
            </Alert>
          )}
        </VStack>
      </Container>
      <PageFooter />
    </Box>
  );
};

export default AuditScheduleDetail;
