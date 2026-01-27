import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  IconButton,
  Box,
  Text,
  Badge,
  HStack,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const WEIGHT_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const WEIGHT_COLORS = {
  low: "green",
  medium: "yellow",
  high: "red",
};

const ObjectivesModal = ({ isOpen, onClose, objectives = [], onSave }) => {
  const [localObjectives, setLocalObjectives] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const cardBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (isOpen) {
      // If there are no objectives, start with one empty form
      if (!objectives || objectives.length === 0) {
        setLocalObjectives([
          {
            id: uuidv4(),
            title: "",
            description: "",
            weight: "medium",
          },
        ]);
      } else {
        setLocalObjectives([...objectives]);
      }
      setHasChanges(false);
    }
  }, [isOpen, objectives]);

  const handleAddObjective = () => {
    setLocalObjectives([
      ...localObjectives,
      {
        id: uuidv4(),
        title: "",
        description: "",
        weight: "medium",
      },
    ]);
    setHasChanges(true);
  };

  const handleRemoveObjective = (id) => {
    setLocalObjectives(localObjectives.filter((obj) => obj.id !== id));
    setHasChanges(true);
  };

  const handleObjectiveChange = (id, field, value) => {
    setLocalObjectives(
      localObjectives.map((obj) =>
        obj.id === id ? { ...obj, [field]: value } : obj
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    // Filter out invalid objectives (title and description are required)
    const validObjectives = localObjectives.filter(
      (obj) => obj.title.trim() !== "" && obj.description.trim() !== ""
    );
    onSave(validObjectives);
    onClose();
  };

  const handleCancel = () => {
    setHasChanges(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Team Objectives</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {localObjectives.length === 0 && (
              <Text color="gray.500" textAlign="center" py={4}>
                No objectives yet. Click &quot;Add Objective&quot; to create one.
              </Text>
            )}
            {localObjectives.map((objective, index) => (
              <Box
                key={objective.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor={borderColor}
                bg={cardBg}
              >
                <Flex justify="space-between" align="start" mb={3}>
                  <HStack spacing={2}>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                      Objective {index + 1}
                    </Text>
                    <Badge colorScheme={WEIGHT_COLORS[objective.weight]}>
                      {objective.weight}
                    </Badge>
                  </HStack>
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Remove objective"
                    onClick={() => handleRemoveObjective(objective.id)}
                  />
                </Flex>
                <VStack align="stretch" spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Title</FormLabel>
                    <Input
                      value={objective.title}
                      onChange={(e) =>
                        handleObjectiveChange(
                          objective.id,
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Enter objective title"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Description</FormLabel>
                    <Textarea
                      value={objective.description}
                      onChange={(e) =>
                        handleObjectiveChange(
                          objective.id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Enter objective description"
                      rows={3}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Priority Weight</FormLabel>
                    <Select
                      value={WEIGHT_OPTIONS.find(
                        (opt) => opt.value === objective.weight
                      )}
                      onChange={(option) =>
                        handleObjectiveChange(
                          objective.id,
                          "weight",
                          option.value
                        )
                      }
                      options={WEIGHT_OPTIONS}
                      placeholder="Select weight"
                    />
                  </FormControl>
                </VStack>
              </Box>
            ))}
            <Button
              leftIcon={<FiPlus />}
              onClick={handleAddObjective}
              variant="outline"
              colorScheme="brandPrimary"
            >
              Add Objective
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSave}
            isDisabled={!hasChanges}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ObjectivesModal;
