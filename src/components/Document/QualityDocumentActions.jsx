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
import { isQualityDocument } from "../../utils/qualityDocumentUtils";
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
        handleAction("reject", rejectDocumentRequest, "Document rejected");
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

  // Get document state properties
  const status = document?.status;
  const checkedOut = document?.metadata?.checkedOut;
  const mode = document?.requestData?.mode || "";

  // Determine which buttons should be visible based on specific state combinations
  const showSubmit =
    status === -1 && checkedOut === 1 && (mode === "NEW" || mode === "DISCARD");
  const showDiscard = status === -1 && checkedOut === 1 && mode === "REJECT";
  const showApprove = status === 0 && checkedOut === 0 && mode === "TEAM";
  const showReject = status === 0 && checkedOut === 0 && mode === "TEAM";
  const showPublish = status === 0 && checkedOut === 0 && mode === "CONTROLLER";
  const showCheckOut = status === 2 && checkedOut === 0 && mode === "PUBLISH";

  // Don't render anything if no buttons should be visible
  const hasAnyVisibleButton =
    showSubmit ||
    showDiscard ||
    showApprove ||
    showReject ||
    showPublish ||
    showCheckOut;

  if (!hasAnyVisibleButton) {
    return null;
  }

  return (
    <>
      <VStack spacing={3} align="stretch">
        {/* Submit Button */}
        {showSubmit && (
          <Box>
            <Button
              leftIcon={<FiCheckCircle />}
              colorScheme="blue"
              onClick={() => openConfirmation("submit")}
              isLoading={isProcessing}
              size="sm"
              w="full"
            >
              Submit
            </Button>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Submit document for review. Locks editing until request is
              resolved.
            </Text>
          </Box>
        )}

        {/* Approve (Endorse) Button */}
        {showApprove && (
          <Box>
            <Button
              leftIcon={<FiLock />}
              colorScheme="green"
              onClick={() => openConfirmation("endorse")}
              isLoading={isProcessing}
              size="sm"
              w="full"
            >
              Approve
            </Button>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Approve document and move to controller review for final
              publishing.
            </Text>
          </Box>
        )}

        {/* Reject Button */}
        {showReject && (
          <Box>
            <Button
              leftIcon={<FiXCircle />}
              colorScheme="red"
              variant="outline"
              onClick={() => openConfirmation("reject")}
              isLoading={isProcessing}
              size="sm"
              w="full"
            >
              Reject
            </Button>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Reject document and return to team. Team must discard or resubmit.
            </Text>
          </Box>
        )}

        {/* Publish Button */}
        {showPublish && (
          <Box>
            <Button
              leftIcon={<FiUpload />}
              colorScheme="purple"
              onClick={() => openConfirmation("publish")}
              isLoading={isProcessing}
              size="sm"
              w="full"
            >
              Publish
            </Button>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Publish document as final version. Locks permanently until checked
              out.
            </Text>
          </Box>
        )}

        {/* Discard Button */}
        {showDiscard && (
          <Box>
            <Button
              leftIcon={<FiTrash2 />}
              colorScheme="orange"
              variant="outline"
              onClick={() => openConfirmation("discard")}
              isLoading={isProcessing}
              size="sm"
              w="full"
            >
              Discard
            </Button>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Discard current request and return document to editable working
              state.
            </Text>
          </Box>
        )}

        {/* Check Out Button */}
        {showCheckOut && (
          <Box>
            <Button
              leftIcon={<FiUnlock />}
              colorScheme="teal"
              onClick={() => openConfirmation("checkout")}
              isLoading={isProcessing}
              size="sm"
              w="full"
            >
              Check Out
            </Button>
            <Text fontSize="xs" color="gray.600" mt={1}>
              Check out published document to make changes and restart workflow.
            </Text>
          </Box>
        )}
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
