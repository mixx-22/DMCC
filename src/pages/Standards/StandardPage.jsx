import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Divider,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit2,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Timestamp from "../../components/Timestamp";
import apiService from "../../services/api";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import ChakraTreeDropdown from "../../components/TreeDropdown";

const STANDARDS_ENDPOINT =
  import.meta.env.VITE_API_PACKAGE_STANDARDS || "/standards";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Sample data for tree dropdown demo
const sampleTreeData = [
  {
    id: "003073c2-e848-4725-983c-553283d77460",
    clause: "4",
    title: "Context of the Organization",
    subClauses: [
      {
        id: "97124ee1-8267-45c7-b381-6e2e39080357",
        clause: "4.1",
        description: "Context of the ITSMS.",
      },
      {
        id: "1fc0e589-89a3-4248-a94f-7e21a218358a",
        clause: "4.2",
        description: "Interested parties.",
      },
      {
        id: "8a6a88af-02f0-4b06-a40f-0b55a4ffa17c",
        clause: "4.3",
        description: "Scope of the ITSMS.",
      },
      {
        id: "b8e835b1-77ca-48ed-a0de-667645ae4d97",
        clause: "4.4",
        description: "Service management system.",
      },
    ],
  },
  {
    id: "a8060b89-6c41-4ab6-bdff-dcdb2d4a59eb",
    clause: "5",
    title: "Leadership",
    subClauses: [
      {
        id: "4dcdc959-023f-4930-ab08-15ac49f5ddb1",
        clause: "5.1",
        description: "Leadership and commitment.",
      },
      {
        id: "7f3f5c1e-5240-41bd-90ba-0126d9af5b80",
        clause: "5.2",
        description: "Service management policy.",
      },
      {
        id: "84887b66-0e22-4a9d-8bb3-a81de9d37f34",
        clause: "5.3",
        description: "Roles and responsibilities.",
      },
    ],
  },
  {
    id: "84862eb4-92e1-44c5-9a65-37d5dfb48012",
    clause: "6",
    title: "Planning",
    subClauses: [
      {
        id: "f0782c18-9d9f-4e7f-ba24-e284ff19c6e3",
        clause: "6.1",
        description: "Risks and opportunities.",
      },
      {
        id: "9e0f7878-00c6-46c5-a938-063c9477cc5b",
        clause: "6.2",
        description: "Service management objectives.",
      },
    ],
  },
  {
    id: "20808972-d3b2-4539-8d77-14b08919e5df",
    clause: "7",
    title: "Support",
    subClauses: [
      {
        id: "b48fc49e-519e-451e-a681-6bcc20f034d4",
        clause: "7.1",
        description: "Resources.",
      },
      {
        id: "69b0ca89-ab5a-4e14-a03d-b03471668feb",
        clause: "7.2",
        description: "Competence.",
      },
      {
        id: "6ab7935c-387e-4f97-a03d-c407c7ca6f37",
        clause: "7.3",
        description: "Awareness.",
      },
      {
        id: "5e1c70ef-a8f6-4c7b-80b5-a55adda31ea6",
        clause: "7.4",
        description: "Communication.",
      },
      {
        id: "f501418a-84ec-4972-8728-d0667e954971",
        clause: "7.5",
        description: "Documented information.",
      },
    ],
  },
  {
    id: "89cf6146-2385-4273-8bf3-d2ef73407598",
    clause: "8",
    title: "Operation",
    subClauses: [
      {
        id: "09577f7b-91be-4153-b982-0d863122be80",
        clause: "8.1",
        description: "Service portfolio management.",
      },
      {
        id: "7d27a6be-e811-41d7-9b36-a9440f3f3cd1",
        clause: "8.2",
        description: "Service level management.",
      },
      {
        id: "7ac4cc0f-499e-4ee7-aa7f-2ab215d4f0d2",
        clause: "8.3",
        description: "Incident and request management.",
      },
      {
        id: "049be948-ccdf-4374-88c9-08fa8e059eb6",
        clause: "8.4",
        description: "Change management.",
      },
      {
        id: "c4268592-d7c6-4078-a8e7-7c0a08b5fb4c",
        clause: "8.5",
        description: "Configuration management.",
      },
    ],
  },
  {
    id: "9dd36a4f-f7aa-4c63-b3ae-f2572d3304d9",
    clause: "9",
    title: "Performance Evaluation",
    subClauses: [
      {
        id: "e3965044-cd59-43d5-a550-44181faa874f",
        clause: "9.1",
        description: "Monitoring and measurement.",
      },
      {
        id: "68ac1307-2493-42ba-8ab2-f4e93a6bc8c0",
        clause: "9.2",
        description: "Internal audit.",
      },
      {
        id: "c381e4db-7c0b-427d-8330-462a2e5e4226",
        clause: "9.3",
        description: "Management review.",
      },
    ],
  },
  {
    id: "66be6e11-34eb-4554-8889-623e942b27d1",
    clause: "10",
    title: "Improvement",
    subClauses: [
      {
        id: "46b5d4a8-a9ba-4dae-95b7-896ddac43a01",
        clause: "10.1",
        description: "Nonconformity and corrective action.",
      },
      {
        id: "2f71bf7d-8a5b-491c-844c-b350d39083e1",
        clause: "10.2",
        description: "Continual improvement.",
      },
    ],
  },
];

// Mock data removed; API data only

const StandardPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [standard, setStandard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSavingClause, setIsSavingClause] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingClauseIndex, setEditingClauseIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [standardForm, setStandardForm] = useState({
    standard: "",
    description: "",
  });
  const [clauseForm, setClauseForm] = useState({
    id: uuidv4(),
    clause: "",
    title: "",
    subClauses: [{ id: uuidv4(), clause: "", description: "" }],
  });
  const [selectedTreeItems, setSelectedTreeItems] = useState([]);

  // Transform sample data to tree dropdown format
  const treeDropdownData = useMemo(() => {
    return sampleTreeData.map((item) => ({
      label: `${item.clause} - ${item.title}`,
      value: item.id,
      children: (item.subClauses || []).map((sub) => ({
        label: `${sub.clause} - ${sub.description}`,
        value: sub.id,
      })),
    }));
  }, []);

  const resetClauseForm = useCallback(() => {
    setClauseForm({
      id: uuidv4(),
      clause: "",
      title: "",
      subClauses: [{ id: uuidv4(), clause: "", description: "" }],
    });
  }, []);

  const handleTreeDropdownChange = useCallback((currentNode, selectedNodes) => {
    setSelectedTreeItems(selectedNodes);
  }, []);

  const fetchStandard = useCallback(async () => {
    setLoading(true);
    try {
      if (!USE_API) {
        setStandard(null);
        return;
      }

      const response = await apiService.request(`${STANDARDS_ENDPOINT}/${id}`, {
        method: "GET",
      });

      const data = response?.data || response;
      setStandard(data);
      setStandardForm({
        standard: data?.standard || data?.title || data?.name || "",
        description: data?.description || "",
      });
    } catch (error) {
      setStandard(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStandard();
  }, [fetchStandard]);

  const persistClauses = useCallback(
    async (updatedClauses, successMessage) => {
      if (!standard) return;

      const payload = {
        standard: standard?.standard,
        description: standard?.description,
        clauses: updatedClauses,
      };

      if (USE_API) {
        const response = await apiService.request(
          `${STANDARDS_ENDPOINT}/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );

        const updated = response?.standard || response?.data || response;

        if (!updated?.clauses || updated?.clauses?.length === 0) {
          await apiService.request(`${STANDARDS_ENDPOINT}/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ clauses: updatedClauses }),
          });
        }
      }

      setStandard((prev) => ({
        ...prev,
        ...payload,
      }));

      if (successMessage) {
        toast.success(successMessage);
      }

      await fetchStandard();
    },
    [fetchStandard, id, standard],
  );

  const clausePayload = useMemo(() => {
    const trimmedSubClauses = clauseForm.subClauses
      .map((sub) => ({
        id: sub.id || uuidv4(),
        clause: sub.clause.trim(),
        description: sub.description.trim(),
      }))
      .filter((sub) => sub.clause || sub.description);

    return {
      id: clauseForm.id || uuidv4(),
      clause: clauseForm.clause.trim(),
      title: clauseForm.title.trim(),
      subClauses: trimmedSubClauses,
    };
  }, [clauseForm]);

  const handleAddSubClause = () => {
    setClauseForm((prev) => ({
      ...prev,
      subClauses: [
        ...prev.subClauses,
        { id: uuidv4(), clause: "", description: "" },
      ],
    }));
  };

  const handleRemoveSubClause = (index) => {
    setClauseForm((prev) => ({
      ...prev,
      subClauses: prev.subClauses.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubClauseChange = (index, field, value) => {
    setClauseForm((prev) => ({
      ...prev,
      subClauses: prev.subClauses.map((sub, idx) =>
        idx === index ? { ...sub, [field]: value } : sub,
      ),
    }));
  };

  const handleSaveClause = async () => {
    if (!clausePayload.clause || !clausePayload.title) {
      toast.error("Clause and title are required.");
      return;
    }

    setIsSavingClause(true);
    try {
      const currentClauses = standard?.clauses || [];
      const updatedClauses =
        editingClauseIndex === null
          ? [...currentClauses, clausePayload]
          : currentClauses.map((item, idx) =>
              idx === editingClauseIndex ? clausePayload : item,
            );

      if (USE_API) {
        await persistClauses(
          updatedClauses,
          editingClauseIndex === null ? "Clause added." : "Clause updated.",
        );
      } else if (standard) {
        setStandard((prev) => ({
          ...prev,
          clauses: updatedClauses,
        }));
        toast.success(
          editingClauseIndex === null ? "Clause added." : "Clause updated.",
        );
      }

      resetClauseForm();
      setEditingClauseIndex(null);
      onClose();
    } catch (error) {
      toast.error(
        editingClauseIndex === null
          ? "Failed to add clause."
          : "Failed to update clause.",
      );
    } finally {
      setIsSavingClause(false);
    }
  };

  const openAddClause = () => {
    if (!isEditMode) return;
    resetClauseForm();
    setEditingClauseIndex(null);
    onOpen();
  };

  const openEditClause = (clause, index) => {
    if (!isEditMode) return;
    setClauseForm({
      id: clause.id || uuidv4(),
      clause: clause.clause || "",
      title: clause.title || "",
      subClauses: (clause.subClauses || []).map((sub) => ({
        id: sub.id || uuidv4(),
        clause: sub.clause || "",
        description: sub.description || "",
      })),
    });
    if (!clause.subClauses || clause.subClauses.length === 0) {
      setClauseForm((prev) => ({
        ...prev,
        subClauses: [{ id: uuidv4(), clause: "", description: "" }],
      }));
    }
    setEditingClauseIndex(index);
    onOpen();
  };

  const handleDeleteClause = async (index) => {
    if (!isEditMode) return;
    const clauseLabel = standard?.clauses?.[index]?.clause || "this clause";
    const confirmed = window.confirm(
      `Delete ${clauseLabel} and all its sub-clauses?`,
    );
    if (!confirmed) return;

    setIsSavingClause(true);
    try {
      const updatedClauses = (standard?.clauses || []).filter(
        (_, idx) => idx !== index,
      );

      if (USE_API) {
        await persistClauses(updatedClauses, "Clause deleted.");
      } else if (standard) {
        setStandard((prev) => ({
          ...prev,
          clauses: updatedClauses,
        }));
        toast.success("Clause deleted.");
      }
    } catch (error) {
      toast.error("Failed to delete clause.");
    } finally {
      setIsSavingClause(false);
    }
  };

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading standard...</Text>
      </Box>
    );
  }

  if (!standard) {
    return (
      <Box p={4}>
        <Text>Standard not found</Text>
        <Button mt={4} onClick={() => navigate("/standards")}>
          Back to Standards
        </Button>
      </Box>
    );
  }

  const standardTitle =
    standard.standard || standard.title || standard.name || "Standard";

  const handleStandardFieldChange = (field, value) => {
    setStandardForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveStandard = async () => {
    if (!standardForm.standard.trim()) {
      toast.error("Standard title is required.");
      return;
    }

    setIsSavingClause(true);
    try {
      const payload = {
        standard: standardForm.standard.trim(),
        description: standardForm.description.trim(),
        clauses: standard?.clauses || [],
      };

      if (USE_API) {
        await apiService.request(`${STANDARDS_ENDPOINT}/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Standard updated.");
        await fetchStandard();
      }

      setStandard((prev) => ({
        ...prev,
        ...payload,
      }));
      setIsEditMode(false);
    } catch (error) {
      toast.error("Failed to update standard.");
    } finally {
      setIsSavingClause(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setStandardForm({
      standard: standard?.standard || standard?.title || standard?.name || "",
      description: standard?.description || "",
    });
  };

  const handleDeleteStandard = async () => {
    const result = await Swal.fire({
      title: "Delete Standard",
      text: "This action is irreversible and cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E53E3E",
      cancelButtonColor: "#718096",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsSavingClause(true);
    try {
      if (USE_API) {
        await apiService.request(`${STANDARDS_ENDPOINT}/${id}`, {
          method: "DELETE",
        });
      }

      toast.success("Standard deleted.");
      navigate("/standards");
    } catch (error) {
      toast.error("Failed to delete standard.");
    } finally {
      setIsSavingClause(false);
    }
  };

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle" noOfLines={1}>
          <Button
            as="span"
            variant="ghost"
            onClick={() => navigate("/standards")}
            leftIcon={<FiArrowLeft />}
            mr={2}
          >
            Back
          </Button>
          {standardTitle}
        </Heading>
      </PageHeader>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          {!isEditMode ? (
            <HStack spacing={2}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Standard actions"
                  icon={<FiMoreVertical />}
                  variant="outline"
                />
                <MenuList>
                  <MenuItem
                    icon={<FiTrash2 />}
                    color="red.500"
                    onClick={handleDeleteStandard}
                  >
                    Delete Standard
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button
                colorScheme="brandPrimary"
                onClick={() => setIsEditMode(true)}
              >
                Edit Standard
              </Button>
            </HStack>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                colorScheme="brandPrimary"
                onClick={handleSaveStandard}
                isLoading={isSavingClause}
              >
                Save Changes
              </Button>
            </>
          )}
        </Flex>
      </PageFooter>

      <Flex gap={6} flexWrap={{ base: "wrap", xl: "nowrap" }}>
        <Box w={{ base: "full", xl: "sm" }}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Standard
                  </Text>
                  {isEditMode ? (
                    <Input
                      mt={2}
                      value={standardForm.standard}
                      onChange={(e) =>
                        handleStandardFieldChange("standard", e.target.value)
                      }
                      placeholder="Standard title"
                    />
                  ) : (
                    <Heading size="md" mt={1}>
                      {standardTitle}
                    </Heading>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Description
                  </Text>
                  {isEditMode ? (
                    <Textarea
                      mt={2}
                      value={standardForm.description}
                      onChange={(e) =>
                        handleStandardFieldChange("description", e.target.value)
                      }
                      placeholder="Standard description"
                      rows={4}
                    />
                  ) : (
                    <Text mt={1} fontSize="sm">
                      {standard.description || "No description available."}
                    </Text>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Last Modified
                  </Text>
                  <Timestamp
                    date={
                      standard.updatedAt ||
                      standard.updated_at ||
                      standard.modifiedAt ||
                      standard.lastModified
                    }
                    showTime={true}
                    fontSize="sm"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box flex={1} minW={{ base: "full", xl: 0 }}>
          <Card mb={6}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Clause Selection (Tree Dropdown Demo)</Heading>
                <Text fontSize="sm" color="gray.600">
                  Select clauses and sub-clauses using the tree dropdown below.
                  This demonstrates multiselect functionality with partial selection
                  support for parent nodes.
                </Text>
                <FormControl>
                  <FormLabel>Select Clauses</FormLabel>
                  <ChakraTreeDropdown
                    data={treeDropdownData}
                    onChange={handleTreeDropdownChange}
                    placeholderText="Select clauses..."
                    showPartiallySelected={true}
                    keepTreeOnSearch={true}
                    keepChildrenOnSearch={true}
                    keepOpenOnSelect={true}
                    mode="multiSelect"
                  />
                </FormControl>
                {selectedTreeItems.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                      Selected Items ({selectedTreeItems.length}):
                    </Text>
                    <Box
                      p={3}
                      borderRadius="md"
                      bg="gray.50"
                      maxH="200px"
                      overflowY="auto"
                    >
                      <VStack align="stretch" spacing={1}>
                        {selectedTreeItems.map((item) => (
                          <Text key={item.value} fontSize="sm">
                            • {item.label}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Flex justify="space-between" align="center" mb={4} gap={4}>
                <Heading size="md">Clauses</Heading>
                {isEditMode && (
                  <Button leftIcon={<FiPlus />} onClick={openAddClause}>
                    Add Clause
                  </Button>
                )}
              </Flex>
              {standard.clauses && standard.clauses.length > 0 ? (
                <Accordion allowMultiple>
                  {standard.clauses.map((clause, index) => (
                    <AccordionItem
                      key={clause.clause || clause.title}
                      border="1px solid"
                      borderColor="gray.100"
                      borderRadius="md"
                      mb={3}
                    >
                      <AccordionButton>
                        <HStack flex={1} textAlign="left" spacing={3}>
                          <Badge colorScheme="brandPrimary">
                            {clause.clause}
                          </Badge>
                          <Text fontWeight="semibold">
                            {clause.title || "Clause"}
                          </Text>
                        </HStack>
                        {isEditMode && (
                          <HStack spacing={1} mr={2}>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              aria-label="Edit clause"
                              icon={<FiEdit2 />}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                openEditClause(clause, index);
                              }}
                            />
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              aria-label="Delete clause"
                              icon={<FiTrash2 />}
                              isDisabled={isSavingClause}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleDeleteClause(index);
                              }}
                            />
                          </HStack>
                        )}
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <VStack align="stretch" spacing={3}>
                          {(clause.subClauses || []).length === 0 ? (
                            <Text fontSize="sm" color="gray.500">
                              No sub-clauses available.
                            </Text>
                          ) : (
                            clause.subClauses.map((sub) => (
                              <Box
                                key={sub.clause || sub.description}
                                p={3}
                                borderRadius="md"
                                bg="gray.50"
                              >
                                <HStack spacing={2} mb={1}>
                                  <Badge variant="subtle" colorScheme="gray">
                                    {sub.clause}
                                  </Badge>
                                  <Text fontWeight="medium" fontSize="sm">
                                    {sub.title || "Sub-clause"}
                                  </Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {sub.description || "No description"}
                                </Text>
                              </Box>
                            ))
                          )}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Text color="gray.500">No clauses available.</Text>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingClauseIndex === null ? "Add Clause" : "Edit Clause"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Clause</FormLabel>
                <Input
                  value={clauseForm.clause}
                  onChange={(e) =>
                    setClauseForm((prev) => ({
                      ...prev,
                      clause: e.target.value,
                    }))
                  }
                  placeholder="e.g., 4"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={clauseForm.title}
                  onChange={(e) =>
                    setClauseForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Context of the Organization"
                />
              </FormControl>

              <Divider />

              <Flex justify="space-between" align="center">
                <Heading size="sm">Sub-clauses</Heading>
                <Button
                  leftIcon={<FiPlus />}
                  size="sm"
                  variant="outline"
                  onClick={handleAddSubClause}
                >
                  Add Sub-clause
                </Button>
              </Flex>

              {clauseForm.subClauses.map((sub, index) => (
                <Box
                  key={sub.id}
                  p={3}
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      Sub-clause {index + 1}
                    </Text>
                    {clauseForm.subClauses.length > 1 && (
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Remove sub-clause"
                        icon={<FiTrash2 />}
                        onClick={() => handleRemoveSubClause(index)}
                      />
                    )}
                  </Flex>
                  <VStack align="stretch" spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Clause</FormLabel>
                      <Input
                        value={sub.clause}
                        onChange={(e) =>
                          handleSubClauseChange(index, "clause", e.target.value)
                        }
                        placeholder="e.g., 4.1"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Description</FormLabel>
                      <Textarea
                        value={sub.description}
                        onChange={(e) =>
                          handleSubClauseChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Describe the sub-clause"
                      />
                    </FormControl>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brandPrimary"
              onClick={handleSaveClause}
              isLoading={isSavingClause}
            >
              {editingClauseIndex === null ? "Save Clause" : "Update Clause"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StandardPage;
