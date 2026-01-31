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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
  Input,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiDownload,
  FiFile,
} from "react-icons/fi";
import { toast } from "sonner";
import apiService from "../../services/api";
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
  const {
    isOpen: isVersionModalOpen,
    onOpen: onVersionModalOpen,
    onClose: onVersionModalClose,
  } = useDisclosure();
  const {
    isOpen: isFinalCopyModalOpen,
    onOpen: onFinalCopyModalOpen,
    onClose: onFinalCopyModalClose,
  } = useDisclosure();

  // Version control state
  const [isNewDocument, setIsNewDocument] = useState("yes");
  const [changeType, setChangeType] = useState("minor");
  const [changeDescription, setChangeDescription] = useState("");
  const [suggestedVersion, setSuggestedVersion] = useState("");

  // Final copy state
  const [finalCopyFile, setFinalCopyFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [effectivityDate, setEffectivityDate] = useState("");

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
    if (action === "publish") {
      // Open version control dialog for publish
      openVersionControlDialog();
    } else {
      setActionToConfirm(action);
      onOpen();
    }
  };

  const openVersionControlDialog = () => {
    // Reset version control state
    setIsNewDocument("yes");
    setChangeType("minor");
    setChangeDescription("");

    // Calculate suggested version
    const currentVersion = document?.metadata?.version || "0.0";
    setSuggestedVersion(currentVersion === "0.0" ? "1.0" : currentVersion);

    onVersionModalOpen();
  };

  const handleVersionControlNext = () => {
    // Calculate the new version based on selections
    let newVersion;

    if (isNewDocument === "yes") {
      newVersion = "1.0";
    } else {
      const currentVersion = document?.metadata?.version || "1.0";
      const [major, minor] = currentVersion.split(".").map(Number);

      if (changeType === "major") {
        newVersion = `${major + 1}.0`;
      } else {
        newVersion = `${major}.${minor + 1}`;
      }
    }

    setSuggestedVersion(newVersion);
    onVersionModalClose();
    // Initialize metadata from document
    setDocumentNumber(document?.metadata?.documentNumber || "");
    setIssuedDate(document?.metadata?.issuedDate || "");
    setEffectivityDate(document?.metadata?.effectivityDate || "");
    // Open final copy modal instead of going straight to confirmation
    onFinalCopyModalOpen();
  };

  const handleDownloadCurrentFile = async () => {
    setIsDownloading(true);
    try {
      const fileName =
        document?.metadata?.filename || document?.title || "document";
      const blob = await apiService.downloadDocument(document.id, fileName);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download Started", {
        description: "File download has started",
        duration: 2000,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download Failed", {
        description: error.message || "Failed to download file",
        duration: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFinalCopyFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate PDF only
      if (file.type !== "application/pdf") {
        toast.error("Invalid File Type", {
          description: "Only PDF files are allowed for publishing",
          duration: 3000,
        });
        e.target.value = "";
        return;
      }
      setFinalCopyFile(file);
    }
  };

  const handleFinalCopyNext = () => {
    // Validate required metadata fields
    if (!documentNumber || !issuedDate || !effectivityDate) {
      toast.error("Required Fields Missing", {
        description:
          "Please fill in Document Number, Issued Date, and Effectivity Date",
        duration: 4000,
      });
      return;
    }

    // Check if current document is PDF or if final copy is uploaded
    const currentFileName = document?.metadata?.filename || "";
    const isPDF =
      currentFileName.toLowerCase().endsWith(".pdf") || finalCopyFile;

    if (!isPDF) {
      toast.error("PDF Required", {
        description:
          "Only PDF files can be published. Please upload a PDF final copy.",
        duration: 4000,
      });
      return;
    }

    onFinalCopyModalClose();
    setActionToConfirm("publish");
    onOpen();
  };

  const handleCloseFinalCopyModal = () => {
    setFinalCopyFile(null);
    setDocumentNumber("");
    setIssuedDate("");
    setEffectivityDate("");
    onFinalCopyModalClose();
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
          () =>
            publishDocument(document, {
              version: suggestedVersion,
              documentNumber,
              issuedDate,
              effectivityDate,
              finalCopyFile,
              documentId: document.id || document._id,
            }),
          `Document published successfully as version ${suggestedVersion}`,
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
        return `Are you sure you want to publish this document as version ${suggestedVersion}? This action is final and the document will be locked permanently.${changeDescription ? `\n\nChanges: ${changeDescription}` : ""}`;
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
    status === -1 &&
    checkedOut === 1 &&
    (mode === "NEW" ||
      mode === "REVISE" ||
      mode === "DISCARD" ||
      mode === "CHECKOUT");
  const showDiscard =
    status === -1 &&
    checkedOut === 1 &&
    (mode === "NEW" ||
      mode === "REVISE" ||
      mode === "REJECT" ||
      mode === "CHECKOUT");
  const showApprove = status === 0 && checkedOut === 0 && mode === "TEAM";
  const showReject = status === 0 && checkedOut === 0 && mode === "TEAM";
  const showPublish = status === 0 && checkedOut === 0 && mode === "CONTROLLER";
  const showCheckOut = status === 2 && checkedOut === 0;

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

      {/* Version Control Modal */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={onVersionModalClose}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Version Control Guidance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  This wizard will help you determine the correct version number
                  for this document.
                </AlertDescription>
              </Alert>

              {/* Question 1: Is this a new document? */}
              <FormControl>
                <FormLabel fontWeight="semibold">
                  Is this a new document?
                </FormLabel>
                <RadioGroup value={isNewDocument} onChange={setIsNewDocument}>
                  <VStack align="start" spacing={2}>
                    <Radio value="yes">Yes, this is a brand new document</Radio>
                    <Radio value="no">
                      No, this is an update to an existing document
                    </Radio>
                  </VStack>
                </RadioGroup>
              </FormControl>

              {/* Question 2: If not new, what type of changes? */}
              {isNewDocument === "no" && (
                <FormControl>
                  <FormLabel fontWeight="semibold">
                    What type of changes were made?
                  </FormLabel>
                  <RadioGroup value={changeType} onChange={setChangeType}>
                    <VStack align="start" spacing={3}>
                      <Box>
                        <Radio value="major" mb={1}>
                          <HStack spacing={2}>
                            <Text>Major Changes</Text>
                            <Badge colorScheme="red">2.0, 3.0, etc.</Badge>
                          </HStack>
                        </Radio>
                        <Text fontSize="xs" color="gray.600" ml={6}>
                          Significant changes: New procedures, restructuring,
                          major content updates
                        </Text>
                      </Box>
                      <Box>
                        <Radio value="minor" mb={1}>
                          <HStack spacing={2}>
                            <Text>Minor Changes</Text>
                            <Badge colorScheme="blue">1.1, 1.2, etc.</Badge>
                          </HStack>
                        </Radio>
                        <Text fontSize="xs" color="gray.600" ml={6}>
                          Small updates: Corrections, clarifications,
                          formatting, minor edits
                        </Text>
                      </Box>
                    </VStack>
                  </RadioGroup>
                </FormControl>
              )}

              {/* Question 3: Describe changes */}
              <FormControl>
                <FormLabel fontWeight="semibold">
                  {isNewDocument === "yes"
                    ? "Describe the document purpose (optional)"
                    : "Describe the changes made (recommended)"}
                </FormLabel>
                <Textarea
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  placeholder={
                    isNewDocument === "yes"
                      ? "e.g., New quality manual for ISO 9001 compliance..."
                      : "e.g., Updated approval workflow section 3.2, corrected typos in section 5..."
                  }
                  rows={3}
                />
              </FormControl>

              {/* Version Preview */}
              <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Suggested Version:
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                      {isNewDocument === "yes"
                        ? "1.0"
                        : changeType === "major"
                          ? `${parseInt(document?.metadata?.version?.split(".")[0] || "1") + 1}.0`
                          : `${document?.metadata?.version?.split(".")[0] || "1"}.${parseInt(document?.metadata?.version?.split(".")[1] || "0") + 1}`}
                    </Text>
                  </VStack>
                  {document?.metadata?.version &&
                    document?.metadata?.version !== "0.0" && (
                      <VStack align="end" spacing={1}>
                        <Text fontSize="sm" color="gray.600">
                          Current Version:
                        </Text>
                        <Text fontSize="lg" fontWeight="semibold">
                          {document?.metadata?.version}
                        </Text>
                      </VStack>
                    )}
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVersionModalClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleVersionControlNext}>
              Continue to Publish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Final Copy Upload Modal */}
      <Modal
        isOpen={isFinalCopyModalOpen}
        onClose={handleCloseFinalCopyModal}
        size="lg"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Final Copy for Publishing</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Only PDF files can be published. Download the current file,
                  convert it to PDF if needed, and upload the final copy.
                </AlertDescription>
              </Alert>

              {/* Version Summary */}
              <Box
                p={3}
                bg="purple.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="purple.200"
              >
                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                  Publishing as Version: {suggestedVersion}
                </Text>
                {changeDescription && (
                  <Text fontSize="xs" color="gray.700">
                    Changes: {changeDescription}
                  </Text>
                )}
              </Box>

              {/* Metadata Fields */}
              <Box
                p={4}
                bg="blue.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <Text fontSize="sm" fontWeight="semibold" mb={3}>
                  Document Metadata (Required)
                </Text>
                <VStack spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Document Number</FormLabel>
                    <Input
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="e.g., QD-001"
                      bg="white"
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Issued Date</FormLabel>
                    <Input
                      type="date"
                      value={issuedDate}
                      onChange={(e) => setIssuedDate(e.target.value)}
                      bg="white"
                      size="sm"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Effectivity Date</FormLabel>
                    <Input
                      type="date"
                      value={effectivityDate}
                      onChange={(e) => setEffectivityDate(e.target.value)}
                      bg="white"
                      size="sm"
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Current File Info */}
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Current File:
                </Text>
                <HStack
                  spacing={3}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  borderWidth="1px"
                >
                  <Icon as={FiFile} boxSize={5} color="gray.600" />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {document?.metadata?.filename ||
                        document?.title ||
                        "Document"}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {document?.metadata?.filename
                        ?.toLowerCase()
                        .endsWith(".pdf") ? (
                        <Badge colorScheme="green" size="sm">
                          PDF - Ready to publish
                        </Badge>
                      ) : (
                        <Badge colorScheme="orange" size="sm">
                          Non-PDF - Final copy required
                        </Badge>
                      )}
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    leftIcon={<FiDownload />}
                    onClick={handleDownloadCurrentFile}
                    isLoading={isDownloading}
                    variant="outline"
                  >
                    Download
                  </Button>
                </HStack>
              </Box>

              {/* Upload Final Copy */}
              <FormControl>
                <FormLabel fontWeight="semibold">
                  Upload Final Copy (PDF only)
                </FormLabel>
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFinalCopyFileChange}
                  p={1}
                />
                {finalCopyFile && (
                  <HStack mt={2} p={2} bg="green.50" borderRadius="md">
                    <Icon as={FiFile} color="green.600" />
                    <Text fontSize="sm" color="green.800">
                      {finalCopyFile.name}
                    </Text>
                  </HStack>
                )}
                <Text fontSize="xs" color="gray.600" mt={2}>
                  {!document?.metadata?.filename
                    ?.toLowerCase()
                    .endsWith(".pdf") && !finalCopyFile
                    ? "Required: Current file is not a PDF"
                    : "Optional: Upload a new PDF version to replace the current file"}
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseFinalCopyModal}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleFinalCopyNext}
              leftIcon={<FiUpload />}
            >
              Proceed to Publish
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
