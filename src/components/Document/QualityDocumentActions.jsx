import PropTypes from "prop-types";
import { useState } from "react";
import {
  Button,
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiTrash2,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import { toast } from "sonner";
import {
  isQualityDocument,
  validateTransition,
} from "../../utils/qualityDocumentUtils";
import { useDocuments } from "../../context/_useContext";

/**
 * Displays lifecycle action buttons for quality documents
 * Shows all possible actions but disables invalid ones based on state
 */
const QualityDocumentActions = ({ document, onUpdate }) => {
  const {
    submitDocumentForReview,
    discardDocumentRequest,
    endorseDocumentForPublish,
    rejectDocumentRequest,
    publishDocument,
    checkoutDocument,
  } = useDocuments();

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!isQualityDocument(document)) {
    return null;
  }

  // Action handlers
  const handleAction = async (action, actionFunc, successMessage) => {
    setIsProcessing(true);
    try {
      const updatedDoc = await actionFunc(document);
      toast.success("Success", {
        description: successMessage,
        duration: 3000,
      });
      if (onUpdate) {
        onUpdate(updatedDoc);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      toast.error("Error", {
        description: error.message || `Failed to ${action}`,
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const openConfirmation = (action) => {
    setActionToConfirm(action);
    onOpen();
  };

  const executeAction = () => {
    switch (actionToConfirm) {
      case "submit":
        handleAction(
          "submit",
          submitDocumentForReview,
          "Document submitted for review",
        );
        break;
      case "discard":
        handleAction(
          "discard",
          discardDocumentRequest,
          "Request discarded successfully",
        );
        break;
      case "endorse":
        handleAction(
          "endorse",
          endorseDocumentForPublish,
          "Document endorsed for publish",
        );
        break;
      case "reject":
        handleAction(
          "reject",
          rejectDocumentRequest,
          "Document rejected",
        );
        break;
      case "publish":
        handleAction(
          "publish",
          publishDocument,
          "Document published successfully",
        );
        break;
      case "checkout":
        handleAction(
          "checkout",
          checkoutDocument,
          "Document checked out - workflow restarted",
        );
        break;
      default:
        onClose();
    }
  };
  // Get action confirmation text
  const getConfirmationText = () => {
    switch (actionToConfirm) {
      case "submit":
        return "Are you sure you want to submit this document for review? The document will be locked for editing.";
      case "discard":
        return "Are you sure you want to discard this request? This will return the document to working status.";
      case "endorse":
        return "Are you sure you want to endorse this document for publish? This will move it to controller review.";
      case "reject":
        return "Are you sure you want to reject this document? The team will need to resubmit or discard.";
      case "publish":
        return "Are you sure you want to publish this document? This action is final and the document will be locked permanently.";
      case "checkout":
        return "Are you sure you want to check out this document? This will restart the workflow and allow you to make changes.";
      default:
        return "";
    }
  };

  // Validate all possible actions
  const submitValidation = validateTransition(document, "submit");
  const discardValidation = validateTransition(document, "discard");
  const endorseValidation = validateTransition(document, "endorse");
  const rejectValidation = validateTransition(document, "reject");
  const publishValidation = validateTransition(document, "publish");
  const checkoutValidation = validateTransition(document, "checkout");

  // Check if at least one action is valid
  const hasAnyValidAction = 
    submitValidation.valid ||
    discardValidation.valid ||
    endorseValidation.valid ||
    rejectValidation.valid ||
    publishValidation.valid ||
    checkoutValidation.valid;

  // Don't render anything if no actions are valid
  if (!hasAnyValidAction) {
    return null;
  }

  return (
    <>
      <VStack spacing={3} align="stretch">
        {/* Submit Button */}
        <Box>
          <Tooltip 
            label={!submitValidation.valid ? submitValidation.message : ""} 
            isDisabled={submitValidation.valid}
          >
            <Button
              leftIcon={<FiCheckCircle />}
              colorScheme="blue"
              onClick={() => openConfirmation("submit")}
              isLoading={isProcessing}
              isDisabled={!submitValidation.valid}
              size="sm"
              w="full"
            >
              Submit
            </Button>
          </Tooltip>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Submit document for review. Locks editing until request is resolved.
          </Text>
        </Box>

        {/* Approve (Endorse) Button */}
        <Box>
          <Tooltip 
            label={!endorseValidation.valid ? endorseValidation.message : ""} 
            isDisabled={endorseValidation.valid}
          >
            <Button
              leftIcon={<FiLock />}
              colorScheme="green"
              onClick={() => openConfirmation("endorse")}
              isLoading={isProcessing}
              isDisabled={!endorseValidation.valid}
              size="sm"
              w="full"
            >
              Approve
            </Button>
          </Tooltip>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Approve document and move to controller review for final publishing.
          </Text>
        </Box>

        {/* Reject Button */}
        <Box>
          <Tooltip 
            label={!rejectValidation.valid ? rejectValidation.message : ""} 
            isDisabled={rejectValidation.valid}
          >
            <Button
              leftIcon={<FiXCircle />}
              colorScheme="red"
              variant="outline"
              onClick={() => openConfirmation("reject")}
              isLoading={isProcessing}
              isDisabled={!rejectValidation.valid}
              size="sm"
              w="full"
            >
              Reject
            </Button>
          </Tooltip>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Reject document and return to team. Team must discard or resubmit.
          </Text>
        </Box>

        {/* Publish Button */}
        <Box>
          <Tooltip 
            label={!publishValidation.valid ? publishValidation.message : ""} 
            isDisabled={publishValidation.valid}
          >
            <Button
              leftIcon={<FiUpload />}
              colorScheme="purple"
              onClick={() => openConfirmation("publish")}
              isLoading={isProcessing}
              isDisabled={!publishValidation.valid}
              size="sm"
              w="full"
            >
              Publish
            </Button>
          </Tooltip>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Publish document as final version. Locks permanently until checked out.
          </Text>
        </Box>

        {/* Discard Button */}
        <Box>
          <Tooltip 
            label={!discardValidation.valid ? discardValidation.message : ""} 
            isDisabled={discardValidation.valid}
          >
            <Button
              leftIcon={<FiTrash2 />}
              colorScheme="orange"
              variant="outline"
              onClick={() => openConfirmation("discard")}
              isLoading={isProcessing}
              isDisabled={!discardValidation.valid}
              size="sm"
              w="full"
            >
              Discard
            </Button>
          </Tooltip>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Discard current request and return document to editable working state.
          </Text>
        </Box>

        {/* Check Out Button */}
        <Box>
          <Tooltip 
            label={!checkoutValidation.valid ? checkoutValidation.message : ""} 
            isDisabled={checkoutValidation.valid}
          >
            <Button
              leftIcon={<FiUnlock />}
              colorScheme="teal"
              onClick={() => openConfirmation("checkout")}
              isLoading={isProcessing}
              isDisabled={!checkoutValidation.valid}
              size="sm"
              w="full"
            >
              Check Out
            </Button>
          </Tooltip>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Check out published document to make changes and restart workflow.
          </Text>
        </Box>
      </VStack>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{getConfirmationText()}</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={executeAction}
              isLoading={isProcessing}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

QualityDocumentActions.propTypes = {
  document: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
};

export default QualityDocumentActions;
