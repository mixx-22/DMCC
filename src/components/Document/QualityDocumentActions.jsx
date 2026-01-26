import PropTypes from "prop-types";
import { useState } from "react";
import {
  Button,
  ButtonGroup,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiTrash2,
  FiLock,
} from "react-icons/fi";
import { toast } from "sonner";
import {
  isQualityDocument,
  validateTransition,
  WORKFLOW_MODE,
} from "../../utils/qualityDocumentUtils";
import { useDocuments } from "../../context/_useContext";

/**
 * Displays lifecycle action buttons for quality documents
 */
const QualityDocumentActions = ({ document, onUpdate }) => {
  const {
    submitDocumentForReview,
    discardDocumentRequest,
    endorseDocumentForPublish,
    rejectDocumentRequest,
    publishDocument,
  } = useDocuments();

  const [isProcessing, setIsProcessing] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!isQualityDocument(document)) {
    return null;
  }

  const { mode } = document;

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
      default:
        return "";
    }
  };

  // Determine which buttons to show based on mode and state
  const canSubmit = validateTransition(document, "submit").valid;
  const canDiscard = validateTransition(document, "discard").valid;
  const canEndorse = validateTransition(document, "endorse").valid;
  const canReject = validateTransition(document, "reject").valid;
  const canPublish = validateTransition(document, "publish").valid;

  // Show buttons based on mode
  const showTeamActions = mode === WORKFLOW_MODE.TEAM || mode === null;
  const showControllerActions = mode === WORKFLOW_MODE.CONTROLLER;

  return (
    <>
      <ButtonGroup size="sm" spacing={2}>
        {/* TEAM mode actions */}
        {showTeamActions && canSubmit && (
          <Button
            leftIcon={<FiCheckCircle />}
            colorScheme="blue"
            onClick={() => openConfirmation("submit")}
            isLoading={isProcessing}
          >
            Submit for Review
          </Button>
        )}

        {showTeamActions && canDiscard && (
          <Button
            leftIcon={<FiTrash2 />}
            colorScheme="red"
            variant="outline"
            onClick={() => openConfirmation("discard")}
            isLoading={isProcessing}
          >
            Discard Request
          </Button>
        )}

        {/* CONTROLLER mode actions */}
        {showControllerActions && canEndorse && (
          <Button
            leftIcon={<FiLock />}
            colorScheme="green"
            onClick={() => openConfirmation("endorse")}
            isLoading={isProcessing}
          >
            Endorse
          </Button>
        )}

        {showControllerActions && canReject && (
          <Button
            leftIcon={<FiXCircle />}
            colorScheme="red"
            variant="outline"
            onClick={() => openConfirmation("reject")}
            isLoading={isProcessing}
          >
            Reject
          </Button>
        )}

        {showControllerActions && canPublish && (
          <Button
            leftIcon={<FiUpload />}
            colorScheme="green"
            onClick={() => openConfirmation("publish")}
            isLoading={isProcessing}
          >
            Publish
          </Button>
        )}
      </ButtonGroup>

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
