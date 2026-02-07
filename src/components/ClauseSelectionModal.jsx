import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  Grid,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";

/**
 * Calculate the depth level of a clause based on its number format
 * Examples: "4" = 1, "4.1" = 2, "4.1.1" = 3, "9.9.9.9" = 4
 */
const getClauseDepth = (clauseNumber) => {
  if (!clauseNumber || typeof clauseNumber !== "string") return 1;
  return clauseNumber.split(".").filter(Boolean).length;
};

/**
 * Calculate indentation margin based on clause depth
 * Base indentation is 0 for parent, then 8 units per depth level
 */
const getIndentationMargin = (clauseNumber) => {
  const depth = getClauseDepth(clauseNumber);
  // Parent clauses (depth 1) have no indentation
  // Each subsequent level gets 8 units more (in Chakra spacing units)
  return depth > 1 ? (depth - 1) * 8 : 0;
};

/**
 * ClauseSelectionModal - A modal for selecting multiple clauses with hierarchical checkbox structure
 * Behaves like a controlled input component with value and onChange props
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {Array} clauses - Array of clause objects with structure: { id, clause, title, subClauses: [{ id, clause, description }] }
 * @param {Array} value - Currently selected clauses (array of objects with id and name) - controlled component
 * @param {function} onChange - Callback function that receives updated array of selected clause objects { id, name }
 */
const ClauseSelectionModal = ({
  isOpen,
  onClose,
  clauses = [],
  value = [],
  onChange,
}) => {
  // Track which parent clauses are expanded
  const [expandedClauses, setExpandedClauses] = useState(() => {
    // Initially expand all clauses
    return clauses.reduce((acc, clause) => {
      acc[clause.id] = true;
      return acc;
    }, {});
  });

  // Track selected clause IDs - sync with value prop
  const [selectedIds, setSelectedIds] = useState(() => {
    return new Set(value.map((c) => c.id));
  });

  // Sync selectedIds with value prop when it changes externally
  useEffect(() => {
    setSelectedIds(new Set(value.map((c) => c.id)));
  }, [value]);

  // Toggle expansion of a parent clause
  const toggleExpanded = useCallback((clauseId) => {
    setExpandedClauses((prev) => ({
      ...prev,
      [clauseId]: !prev[clauseId],
    }));
  }, []);

  // Check if a parent clause is indeterminate (some but not all children selected)
  const isIndeterminate = useCallback(
    (clause) => {
      if (!clause.subClauses || clause.subClauses.length === 0) return false;
      const selectedSubClauses = clause.subClauses.filter((sub) =>
        selectedIds.has(sub.id),
      );
      return (
        selectedSubClauses.length > 0 &&
        selectedSubClauses.length < clause.subClauses.length
      );
    },
    [selectedIds],
  );

  // Check if all children of a parent clause are selected
  const areAllChildrenSelected = useCallback(
    (clause) => {
      if (!clause.subClauses || clause.subClauses.length === 0) return false;
      return clause.subClauses.every((sub) => selectedIds.has(sub.id));
    },
    [selectedIds],
  );

  // Handle parent checkbox change - immediately updates via onChange
  const handleParentChange = useCallback(
    (clause) => {
      const allSelected = areAllChildrenSelected(clause);
      const newSet = new Set(selectedIds);
      if (allSelected) {
        // Unselect all children
        clause.subClauses.forEach((sub) => newSet.delete(sub.id));
      } else {
        // Select all children
        clause.subClauses.forEach((sub) => newSet.add(sub.id));
      }
      
      // Build result array and call onChange immediately
      const result = [];
      clauses.forEach((c) => {
        if (c.subClauses) {
          c.subClauses.forEach((sub) => {
            if (newSet.has(sub.id)) {
              result.push({
                id: sub.id,
                name: `${sub.clause} - ${sub.description}`,
              });
            }
          });
        }
      });
      
      onChange(result);
    },
    [areAllChildrenSelected, selectedIds, clauses, onChange],
  );

  // Handle child checkbox change - immediately updates via onChange
  const handleChildChange = useCallback(
    (subClauseId) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(subClauseId)) {
        newSet.delete(subClauseId);
      } else {
        newSet.add(subClauseId);
      }
      
      // Build result array and call onChange immediately
      const result = [];
      clauses.forEach((clause) => {
        if (clause.subClauses) {
          clause.subClauses.forEach((sub) => {
            if (newSet.has(sub.id)) {
              result.push({
                id: sub.id,
                name: `${sub.clause} - ${sub.description}`,
              });
            }
          });
        }
      });
      
      onChange(result);
    },
    [selectedIds, clauses, onChange],
  );

  // Build the result array for display
  const selectedClauses = useMemo(() => {
    const result = [];
    clauses.forEach((clause) => {
      if (clause.subClauses) {
        clause.subClauses.forEach((sub) => {
          if (selectedIds.has(sub.id)) {
            result.push({
              id: sub.id,
              name: `${sub.clause} - ${sub.description}`,
            });
          }
        });
      }
    });
    return result;
  }, [clauses, selectedIds]);

  // Handle remove from selected list
  const handleRemoveClause = useCallback(
    (clauseId) => {
      const newSet = new Set(selectedIds);
      newSet.delete(clauseId);
      
      // Build result array and call onChange
      const result = [];
      clauses.forEach((clause) => {
        if (clause.subClauses) {
          clause.subClauses.forEach((sub) => {
            if (newSet.has(sub.id)) {
              result.push({
                id: sub.id,
                name: `${sub.clause} - ${sub.description}`,
              });
            }
          });
        }
      });
      
      onChange(result);
    },
    [selectedIds, clauses, onChange],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Clauses</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="1fr 350px" gap={6} h="500px">
            {/* Left column: Clause tree */}
            <Box overflowY="auto" pr={2}>
              <VStack align="stretch" spacing={3}>
                {clauses.length === 0 ? (
                  <Text color="gray.500">No clauses available.</Text>
                ) : (
                  clauses.map((clause) => (
                    <Box
                      key={clause.id}
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      p={3}
                    >
                      {/* Parent Clause */}
                      <Flex align="center" gap={2}>
                        <Checkbox
                          colorScheme="brandPrimary"
                          isChecked={areAllChildrenSelected(clause)}
                          isIndeterminate={isIndeterminate(clause)}
                          onChange={() => handleParentChange(clause)}
                          fontWeight="semibold"
                        >
                          {clause.clause} - {clause.title}
                        </Checkbox>
                        <Spacer />
                        <IconButton
                          icon={
                            expandedClauses[clause.id] ? (
                              <FiChevronDown />
                            ) : (
                              <FiChevronRight />
                            )
                          }
                          size="sm"
                          variant="ghost"
                          isRound
                          onClick={() => toggleExpanded(clause.id)}
                          px={1}
                        ></IconButton>
                      </Flex>

                      {/* Sub Clauses */}
                      <Collapse in={expandedClauses[clause.id]} animateOpacity>
                        <VStack align="stretch" spacing={2} mt={2}>
                          {clause.subClauses && clause.subClauses.length > 0 ? (
                            clause.subClauses.map((sub) => (
                              <Box
                                key={sub.id}
                                ml={getIndentationMargin(sub.clause)}
                              >
                                <Checkbox
                                  colorScheme="brandPrimary"
                                  isChecked={selectedIds.has(sub.id)}
                                  onChange={() => handleChildChange(sub.id)}
                                >
                                  <Text fontSize="sm">
                                    {sub.clause} - {sub.description}
                                  </Text>
                                </Checkbox>
                              </Box>
                            ))
                          ) : (
                            <Text fontSize="sm" color="gray.500" ml={8}>
                              No sub-clauses available.
                            </Text>
                          )}
                        </VStack>
                      </Collapse>
                    </Box>
                  ))
                )}
              </VStack>
            </Box>

            {/* Right column: Selected clauses */}
            <Box
              borderLeftWidth="1px"
              borderColor="gray.200"
              pl={6}
              overflowY="auto"
            >
              <VStack align="stretch" spacing={3}>
                <Heading size="sm" mb={2}>
                  Selected Clauses ({selectedClauses.length})
                </Heading>
                {selectedClauses.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No clauses selected yet
                  </Text>
                ) : (
                  selectedClauses.map((clause) => (
                    <Flex
                      key={clause.id}
                      align="center"
                      gap={2}
                      p={2}
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="blue.50"
                    >
                      <Text fontSize="sm" flex={1}>
                        {clause.name}
                      </Text>
                      <IconButton
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Remove clause"
                        onClick={() => handleRemoveClause(clause.id)}
                      />
                    </Flex>
                  ))
                )}
              </VStack>
            </Box>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClauseSelectionModal;
