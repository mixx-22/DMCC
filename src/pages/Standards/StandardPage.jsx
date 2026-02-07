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
import ClauseSelectionModal from "../../components/ClauseSelectionModal";
import apiService from "../../services/api";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

const STANDARDS_ENDPOINT =
  import.meta.env.VITE_API_PACKAGE_STANDARDS || "/standards";
const USE_API = import.meta.env.VITE_USE_API !== "false";

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
  const {
    isOpen: isClauseSelectionOpen,
    onOpen: onClauseSelectionOpen,
    onClose: onClauseSelectionClose,
  } = useDisclosure();
  const [selectedClauses, setSelectedClauses] = useState([]);
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

  const resetClauseForm = useCallback(() => {
    setClauseForm({
      id: uuidv4(),
      clause: "",
      title: "",
      subClauses: [{ id: uuidv4(), clause: "", description: "" }],
    });
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

  const handleClauseSelection = (clauses) => {
    setSelectedClauses(clauses);
    toast.success(`${clauses.length} clause${clauses.length !== 1 ? "s" : ""} selected`);
    console.log("Selected clauses:", clauses);
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
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center" mb={4} gap={4}>
                <Heading size="md">Clauses</Heading>
                <Flex gap={2}>
                  <Button
                    variant="outline"
                    onClick={onClauseSelectionOpen}
                    size="sm"
                  >
                    Demo: Select Clauses
                  </Button>
                  {isEditMode && (
                    <Button leftIcon={<FiPlus />} onClick={openAddClause}>
                      Add Clause
                    </Button>
                  )}
                </Flex>
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

      {/* Clause Selection Modal */}
      <ClauseSelectionModal
        isOpen={isClauseSelectionOpen}
        onClose={onClauseSelectionClose}
        clauses={standard?.clauses || []}
        initialSelectedClauses={selectedClauses}
        onConfirm={handleClauseSelection}
      />
    </Box>
  );
};

export default StandardPage;
