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
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const CloseAuditModal = ({
  isOpen,
  onClose,
  validation,
  onConfirmClose,
  isClosing = false,
}) => {
  const { canClose, issues } = validation;
  const listIconColor = useColorModeValue("error.500", "error.300");

  const handleConfirm = async () => {
    if (canClose) {
      await onConfirmClose();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {canClose ? "Close Audit Schedule" : "Cannot Close Audit Schedule"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {canClose ? (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle fontSize="sm">Ready to Close</AlertTitle>
                  <AlertDescription fontSize="xs">
                    All requirements have been met. This audit schedule can be
                    closed.
                  </AlertDescription>
                </VStack>
              </Alert>
            ) : (
              <>
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <AlertTitle fontSize="sm">
                      Requirements Not Met
                    </AlertTitle>
                    <AlertDescription fontSize="xs">
                      The following issues must be resolved before closing this
                      audit schedule:
                    </AlertDescription>
                  </VStack>
                </Alert>

                <List spacing={2}>
                  {issues.map((issue, index) => (
                    <ListItem
                      key={index}
                      fontSize="sm"
                      display="flex"
                      alignItems="flex-start"
                    >
                      <ListIcon
                        as={FiAlertCircle}
                        color={listIconColor}
                        mt={1}
                      />
                      <Text>{issue}</Text>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            leftIcon={<FiX />}
            isDisabled={isClosing}
          >
            {canClose ? "Cancel" : "Close"}
          </Button>
          {canClose && (
            <Button
              colorScheme="green"
              onClick={handleConfirm}
              leftIcon={<FiCheckCircle />}
              isLoading={isClosing}
            >
              Close Audit Schedule
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CloseAuditModal;
