import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState, useMemo, useCallback } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

/**
 * ClauseSelectionModal - A modal for selecting multiple clauses with hierarchical checkbox structure
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {Array} clauses - Array of clause objects with structure: { id, clause, title, subClauses: [{ id, clause, description }] }
 * @param {Array} initialSelectedClauses - Initially selected clauses (array of objects with id and name)
 * @param {function} onConfirm - Callback function that receives array of selected clause objects { id, name }
 */
const ClauseSelectionModal = ({
  isOpen,
  onClose,
  clauses = [],
  initialSelectedClauses = [],
  onConfirm,
}) => {
  // Track which parent clauses are expanded
  const [expandedClauses, setExpandedClauses] = useState(() => {
    // Initially expand all clauses
    return clauses.reduce((acc, clause) => {
      acc[clause.id] = true;
      return acc;
    }, {});
  });

  // Track selected clause IDs
  const [selectedIds, setSelectedIds] = useState(() => {
    return new Set(initialSelectedClauses.map((c) => c.id));
  });

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
        selectedIds.has(sub.id)
      );
      return (
        selectedSubClauses.length > 0 &&
        selectedSubClauses.length < clause.subClauses.length
      );
    },
    [selectedIds]
  );

  // Check if all children of a parent clause are selected
  const areAllChildrenSelected = useCallback(
    (clause) => {
      if (!clause.subClauses || clause.subClauses.length === 0) return false;
      return clause.subClauses.every((sub) => selectedIds.has(sub.id));
    },
    [selectedIds]
  );

  // Handle parent checkbox change
  const handleParentChange = useCallback(
    (clause) => {
      const allSelected = areAllChildrenSelected(clause);
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (allSelected) {
          // Unselect all children
          clause.subClauses.forEach((sub) => newSet.delete(sub.id));
        } else {
          // Select all children
          clause.subClauses.forEach((sub) => newSet.add(sub.id));
        }
        return newSet;
      });
    },
    [areAllChildrenSelected]
  );

  // Handle child checkbox change
  const handleChildChange = useCallback((subClauseId) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subClauseId)) {
        newSet.delete(subClauseId);
      } else {
        newSet.add(subClauseId);
      }
      return newSet;
    });
  }, []);

  // Build the result array
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

  const handleConfirm = () => {
    onConfirm(selectedClauses);
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial selection
    setSelectedIds(new Set(initialSelectedClauses.map((c) => c.id)));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Clauses</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(clause.id)}
                      minW="auto"
                      px={1}
                    >
                      {expandedClauses[clause.id] ? (
                        <FiChevronDown />
                      ) : (
                        <FiChevronRight />
                      )}
                    </Button>
                    <Checkbox
                      isChecked={areAllChildrenSelected(clause)}
                      isIndeterminate={isIndeterminate(clause)}
                      onChange={() => handleParentChange(clause)}
                      fontWeight="semibold"
                    >
                      {clause.clause} - {clause.title}
                    </Checkbox>
                  </Flex>

                  {/* Sub Clauses */}
                  <Collapse in={expandedClauses[clause.id]} animateOpacity>
                    <VStack align="stretch" spacing={2} ml={8} mt={2}>
                      {clause.subClauses && clause.subClauses.length > 0 ? (
                        clause.subClauses.map((sub) => (
                          <Checkbox
                            key={sub.id}
                            isChecked={selectedIds.has(sub.id)}
                            onChange={() => handleChildChange(sub.id)}
                            size="sm"
                          >
                            <Text fontSize="sm">
                              {sub.clause} - {sub.description}
                            </Text>
                          </Checkbox>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          No sub-clauses available.
                        </Text>
                      )}
                    </VStack>
                  </Collapse>
                </Box>
              ))
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Flex justify="space-between" w="full" align="center">
            <Text fontSize="sm" color="gray.600">
              {selectedClauses.length} clause{selectedClauses.length !== 1 ? "s" : ""}{" "}
              selected
            </Text>
            <Flex gap={3}>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button colorScheme="brandPrimary" onClick={handleConfirm}>
                Confirm Selection
              </Button>
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClauseSelectionModal;
