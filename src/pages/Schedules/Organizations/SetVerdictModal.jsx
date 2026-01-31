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
  Text,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState, useEffect } from "react";
import { FiSave, FiX } from "react-icons/fi";

// Verdict options
const VERDICT_OPTIONS = [
  {
    value: "COMPLIANT",
    label: "COMPLIANT",
    color: "green",
    description: "No major or minor non-conformities found",
  },
  {
    value: "OBSERVATIONS",
    label: "OBSERVATIONS",
    color: "blue",
    description: "Findings noted but no non-conformities",
  },
  {
    value: "OPPORTUNITIES_FOR_IMPROVEMENTS",
    label: "OPPORTUNITIES FOR IMPROVEMENTS",
    color: "yellow",
    description: "Areas for improvement identified",
  },
  {
    value: "MINOR_NC",
    label: "MINOR NON-CONFORMITY",
    color: "orange",
    description: "Minor non-conformity found",
  },
  {
    value: "MAJOR_NC",
    label: "MAJOR NON-CONFORMITY",
    color: "red",
    description: "Major non-conformity found",
  },
];

const SetVerdictModal = ({
  isOpen,
  onClose,
  organization,
  calculatedVerdict,
  onSave,
}) => {
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const [selectedVerdict, setSelectedVerdict] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with calculated verdict when modal opens
  useEffect(() => {
    if (isOpen && calculatedVerdict) {
      const defaultOption = VERDICT_OPTIONS.find(
        (opt) => opt.value === calculatedVerdict
      );
      setSelectedVerdict(defaultOption || null);
    }
  }, [isOpen, calculatedVerdict]);

  const handleSave = async () => {
    if (!selectedVerdict) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(selectedVerdict.value);
      onClose();
    } catch (error) {
      console.error("Failed to set verdict:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedVerdict(null);
    onClose();
  };

  const selectedOption = VERDICT_OPTIONS.find(
    (opt) => opt.value === selectedVerdict?.value
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Set Organization Verdict</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle fontSize="sm">
                  Set Final Verdict for {organization?.team?.name || "Organization"}
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  Based on all visits and findings, the recommended verdict is:{" "}
                  <Badge
                    colorScheme={
                      VERDICT_OPTIONS.find(
                        (opt) => opt.value === calculatedVerdict
                      )?.color || "gray"
                    }
                  >
                    {calculatedVerdict}
                  </Badge>
                </AlertDescription>
              </VStack>
            </Alert>

            <FormControl isRequired>
              <FormLabel color={labelColor} fontSize="sm">
                Final Verdict
              </FormLabel>
              <Select
                value={selectedVerdict}
                options={VERDICT_OPTIONS}
                onChange={setSelectedVerdict}
                placeholder="Select verdict..."
                chakraStyles={{
                  container: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                }}
              />
              {selectedOption && (
                <Text fontSize="xs" color={labelColor} mt={2}>
                  {selectedOption.description}
                </Text>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            leftIcon={<FiX />}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSave}
            leftIcon={<FiSave />}
            isDisabled={!selectedVerdict}
            isLoading={isSubmitting}
          >
            Save Verdict
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SetVerdictModal;
