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
  CardHeader,
  useDisclosure,
  Spinner,
  Center,
  Container,
  Heading,
  SimpleGrid,
  Badge,
  Icon,
  IconButton,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Breadcrumbs from "../../components/Document/Breadcrumbs";
import AddOrganizationModal from "../../components/Document/modals/AddOrganizationModal";
import DocumentSelector from "../../components/Document/DocumentSelector";
import UserAsyncSelect from "../../components/UserAsyncSelect";
import { useDocuments } from "../../context/_useContext";
import { toast } from "sonner";
import Timestamp from "../../components/Timestamp";

const AuditScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDocumentById, updateDocument, loading } = useDocuments();

  const [auditSchedule, setAuditSchedule] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const fetchedRef = useRef(false);
  const currentIdRef = useRef(null);

  const {
    isOpen: isAddOrgOpen,
    onOpen: onAddOrgOpen,
    onClose: onAddOrgClose,
  } = useDisclosure();

  // Fetch audit schedule
  useEffect(() => {
    const loadAuditSchedule = async () => {
      if (currentIdRef.current === id && fetchedRef.current) {
        return;
      }

      fetchedRef.current = true;
      currentIdRef.current = id;

      try {
        const doc = await fetchDocumentById(id);
        if (doc && doc.type === "auditSchedule") {
          setAuditSchedule(doc);
        } else {
          toast.error("Invalid Document", {
            description: "This is not an audit schedule",
            duration: 3000,
          });
          navigate("/documents");
        }
      } catch (error) {
        console.error("Error fetching audit schedule:", error);
        toast.error("Failed to Load Audit", {
          description: error?.message || "Unknown error",
          duration: 3000,
        });
        navigate("/documents");
      }
    };

    if (id) {
      loadAuditSchedule();
    }

    return () => {
      if (currentIdRef.current !== id) {
        fetchedRef.current = false;
      }
    };
  }, [id, fetchDocumentById, navigate]);

  const handleAddOrganizations = async (organizations) => {
    try {
      const updatedOrganizations = {
        ...(auditSchedule.metadata?.organization || {}),
        ...organizations,
      };

      await updateDocument(id, {
        metadata: {
          ...auditSchedule.metadata,
          organization: updatedOrganizations,
        },
      });

      // Refresh the audit schedule
      const updated = await fetchDocumentById(id);
      setAuditSchedule(updated);
    } catch (error) {
      throw new Error(error?.message || "Failed to add organizations");
    }
  };

  const handleUpdateOrganization = async (orgId, updates) => {
    try {
      const updatedOrganizations = {
        ...(auditSchedule.metadata?.organization || {}),
        [orgId]: {
          ...(auditSchedule.metadata?.organization?.[orgId] || {}),
          ...updates,
        },
      };

      await updateDocument(id, {
        metadata: {
          ...auditSchedule.metadata,
          organization: updatedOrganizations,
        },
      });

      toast.success("Organization Updated", {
        description: "Changes saved successfully",
        duration: 3000,
      });

      // Refresh the audit schedule
      const updated = await fetchDocumentById(id);
      setAuditSchedule(updated);
      setEditingOrg(null);
    } catch (error) {
      toast.error("Update Failed", {
        description: error?.message || "Failed to update organization",
        duration: 3000,
      });
    }
  };

  const handleRemoveOrganization = async (orgId) => {
    if (!window.confirm("Are you sure you want to remove this organization from the audit?")) {
      return;
    }

    try {
      const updatedOrganizations = { ...auditSchedule.metadata?.organization };
      delete updatedOrganizations[orgId];

      await updateDocument(id, {
        metadata: {
          ...auditSchedule.metadata,
          organization: updatedOrganizations,
        },
      });

      toast.success("Organization Removed", {
        description: "Organization has been removed from the audit",
        duration: 3000,
      });

      // Refresh the audit schedule
      const updated = await fetchDocumentById(id);
      setAuditSchedule(updated);
    } catch (error) {
      toast.error("Removal Failed", {
        description: error?.message || "Failed to remove organization",
        duration: 3000,
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: "Scheduled", color: "blue" },
      1: { label: "In Progress", color: "orange" },
      2: { label: "Completed", color: "green" },
    };
    const statusInfo = statusMap[status] || { label: "Unknown", color: "gray" };
    return <Badge colorScheme={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <>
        <PageHeader>
          <Heading variant="pageTitle">Audit Schedule</Heading>
        </PageHeader>
        <Box flex="1" bg="gray.50" p={8}>
          <Center h="400px">
            <VStack>
              <Spinner size="xl" color="purple.500" />
              <Text mt={4} color="gray.600">
                Loading audit schedule...
              </Text>
            </VStack>
          </Center>
        </Box>
        <PageFooter />
      </>
    );
  }

  if (!auditSchedule) {
    return (
      <>
        <PageHeader>
          <Heading variant="pageTitle">Audit Schedule</Heading>
        </PageHeader>
        <Box flex="1" bg="gray.50" p={8}>
          <Center h="400px">
            <VStack>
              <Text fontSize="xl" color="gray.600">
                Audit schedule not found
              </Text>
              <Button colorScheme="purple" onClick={() => navigate("/documents")} mt={4}>
                Back to Documents
              </Button>
            </VStack>
          </Center>
        </Box>
        <PageFooter />
      </>
    );
  }

  const organizations = auditSchedule.metadata?.organization || {};
  const organizationCount = Object.keys(organizations).length;

  return (
    <>
      <PageHeader>
        <Breadcrumbs data={auditSchedule} />
      </PageHeader>
      <Box flex="1" bg="gray.50" p={{ base: 4, md: 8 }}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            {/* Audit Schedule Header */}
            <Card>
              <CardBody>
                <Flex justify="space-between" align="start" mb={4}>
                  <HStack spacing={4} align="start">
                    <Icon as={FiCalendar} boxSize={12} color="purple.500" />
                    <VStack align="start" spacing={2}>
                      <Heading size="lg">{auditSchedule.title}</Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="purple">Audit Schedule</Badge>
                        {getStatusBadge(auditSchedule.metadata?.status || 0)}
                      </HStack>
                    </VStack>
                  </HStack>
                </Flex>

                {auditSchedule.description && (
                  <>
                    <Divider my={4} />
                    <Text color="gray.700">{auditSchedule.description}</Text>
                  </>
                )}

                <Divider my={4} />

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {auditSchedule.metadata?.code && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Audit Code
                      </Text>
                      <Text fontSize="sm" mt={1}>
                        {auditSchedule.metadata.code}
                      </Text>
                    </Box>
                  )}
                  {auditSchedule.metadata?.type && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Audit Type
                      </Text>
                      <Text fontSize="sm" mt={1}>
                        {auditSchedule.metadata.type
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Text>
                    </Box>
                  )}
                  {auditSchedule.metadata?.standard && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Standard
                      </Text>
                      <Text fontSize="sm" mt={1}>
                        {auditSchedule.metadata.standard}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Organizations Section */}
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FiUsers} color="purple.500" />
                    <Heading size="md">Organizations ({organizationCount})</Heading>
                  </HStack>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="purple"
                    size="sm"
                    onClick={onAddOrgOpen}
                  >
                    Add Organization
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                {organizationCount === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Icon as={FiUsers} boxSize={12} color="gray.300" />
                      <Text color="gray.500">No organizations added yet</Text>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="purple"
                        variant="outline"
                        size="sm"
                        onClick={onAddOrgOpen}
                      >
                        Add First Organization
                      </Button>
                    </VStack>
                  </Center>
                ) : (
                  <Accordion allowMultiple>
                    {Object.entries(organizations).map(([orgId, org]) => (
                      <AccordionItem key={orgId} border="none" mb={4}>
                        <Card>
                          <AccordionButton
                            _hover={{ bg: "gray.50" }}
                            borderRadius="md"
                            p={4}
                          >
                            <HStack flex="1" spacing={4}>
                              <Icon as={FiUsers} color="purple.500" boxSize={5} />
                              <VStack align="start" spacing={1} flex="1">
                                <Text fontWeight="semibold">{org.teamName}</Text>
                                <HStack spacing={2}>
                                  {getStatusBadge(org.status)}
                                  {org.visitDate && (
                                    <Text fontSize="xs" color="gray.500">
                                      Visit: {new Date(org.visitDate).toLocaleDateString()}
                                    </Text>
                                  )}
                                </HStack>
                              </VStack>
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Remove organization"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveOrganization(orgId);
                                }}
                              />
                            </HStack>
                            <AccordionIcon ml={4} />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <Tabs colorScheme="purple" variant="enclosed">
                              <TabList>
                                <Tab>Details</Tab>
                                <Tab>Documents</Tab>
                                <Tab>Findings</Tab>
                                <Tab>CAPA</Tab>
                              </TabList>

                              <TabPanels>
                                {/* Details Tab */}
                                <TabPanel>
                                  <VStack spacing={4} align="stretch">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                      <FormControl>
                                        <FormLabel fontSize="sm">Visit Date</FormLabel>
                                        <Input
                                          type="date"
                                          value={org.visitDate || ""}
                                          onChange={(e) =>
                                            handleUpdateOrganization(orgId, {
                                              visitDate: e.target.value,
                                            })
                                          }
                                          size="sm"
                                        />
                                      </FormControl>
                                      <FormControl>
                                        <FormLabel fontSize="sm">Revisit Date</FormLabel>
                                        <Input
                                          type="date"
                                          value={org.revisitDate || ""}
                                          onChange={(e) =>
                                            handleUpdateOrganization(orgId, {
                                              revisitDate: e.target.value,
                                            })
                                          }
                                          size="sm"
                                        />
                                      </FormControl>
                                    </SimpleGrid>

                                    <UserAsyncSelect
                                      value={org.auditors || []}
                                      onChange={(auditors) =>
                                        handleUpdateOrganization(orgId, { auditors })
                                      }
                                      label="Auditors"
                                      displayMode="badges"
                                    />

                                    {org.previousAudit && org.previousAudit.id && (
                                      <Box>
                                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                                          Previous Audit
                                        </Text>
                                        <Card size="sm" variant="outline">
                                          <CardBody>
                                            <HStack>
                                              <Icon as={FiCalendar} color="purple.500" />
                                              <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight="medium">
                                                  {org.previousAudit.title}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                  {org.previousAudit.code}
                                                </Text>
                                              </VStack>
                                            </HStack>
                                          </CardBody>
                                        </Card>
                                      </Box>
                                    )}
                                  </VStack>
                                </TabPanel>

                                {/* Documents Tab */}
                                <TabPanel>
                                  <DocumentSelector
                                    label="Audit Documents"
                                    value={org.documents || {}}
                                    onChange={(documents) =>
                                      handleUpdateOrganization(orgId, { documents })
                                    }
                                    organizationId={orgId}
                                    auditScheduleId={id}
                                  />
                                </TabPanel>

                                {/* Findings Tab */}
                                <TabPanel>
                                  <Center py={8}>
                                    <VStack spacing={3}>
                                      <Icon as={FiAlertCircle} boxSize={10} color="gray.300" />
                                      <Text color="gray.500" fontSize="sm">
                                        Findings section - To be implemented
                                      </Text>
                                      <Text color="gray.400" fontSize="xs">
                                        This section will be available when resolving the audit
                                      </Text>
                                    </VStack>
                                  </Center>
                                </TabPanel>

                                {/* CAPA Tab */}
                                <TabPanel>
                                  <Center py={8}>
                                    <VStack spacing={3}>
                                      <Icon as={FiCheckCircle} boxSize={10} color="gray.300" />
                                      <Text color="gray.500" fontSize="sm">
                                        CAPA section - To be implemented
                                      </Text>
                                      <Text color="gray.400" fontSize="xs">
                                        Corrective and Preventive Actions will be managed here
                                      </Text>
                                    </VStack>
                                  </Center>
                                </TabPanel>
                              </TabPanels>
                            </Tabs>
                          </AccordionPanel>
                        </Card>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardBody>
            </Card>

            {/* Metadata Section */}
            <Card>
              <CardHeader>
                <Heading size="md">Audit Metadata</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {auditSchedule.createdAt && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Created
                      </Text>
                      <Text fontSize="sm" mt={1}>
                        <Timestamp date={auditSchedule.createdAt} />
                      </Text>
                    </Box>
                  )}
                  {auditSchedule.updatedAt && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Last Modified
                      </Text>
                      <Text fontSize="sm" mt={1}>
                        <Timestamp date={auditSchedule.updatedAt} />
                      </Text>
                    </Box>
                  )}
                  {auditSchedule.owner && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Owner
                      </Text>
                      <HStack mt={2}>
                        <Avatar
                          size="sm"
                          name={
                            auditSchedule.owner.firstName && auditSchedule.owner.lastName
                              ? `${auditSchedule.owner.firstName} ${auditSchedule.owner.lastName}`
                              : "Unknown"
                          }
                        />
                        <Text fontSize="sm">
                          {auditSchedule.owner.firstName && auditSchedule.owner.lastName
                            ? `${auditSchedule.owner.firstName} ${auditSchedule.owner.lastName}`
                            : "Unknown"}
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </SimpleGrid>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      <PageFooter>
        <HStack spacing={3} justify="flex-end" w="full">
          <Button
            variant="outline"
            onClick={() => navigate("/documents")}
          >
            Back to Documents
          </Button>
        </HStack>
      </PageFooter>

      <AddOrganizationModal
        isOpen={isAddOrgOpen}
        onClose={onAddOrgClose}
        onAdd={handleAddOrganizations}
      />
    </>
  );
};

export default AuditScheduleDetail;
