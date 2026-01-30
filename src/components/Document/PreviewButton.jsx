import { useState, useEffect, useRef } from "react";
import { Button, IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import { toast } from "sonner";
import apiService from "../../services/api";
import {
  isPreviewable,
  getPreviewDisabledMessage,
} from "../../utils/fileTypes";
import PreviewModal from "./modals/PreviewModal";

/**
 * Reusable preview button component for documents
 * @param {Object} document - Document object with id and metadata {fileName}
 * @param {boolean} isDisabled - Disable the button
 * @param {string} variant - Chakra UI button variant (default: "outline")
 * @param {string} size - Chakra UI button size (default: "md")
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} iconOnly - Show only icon without text
 * @param {Function} onPreviewStart - Callback when preview starts
 * @param {Function} onPreviewComplete - Callback when preview completes
 * @param {Function} onPreviewError - Callback when preview fails
 */
export const PreviewButton = ({
  document,
  isDisabled = false,
  variant = "outline",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  onPreviewStart,
  onPreviewComplete,
  onPreviewError,
}) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [cachedBlob, setCachedBlob] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const documentIdRef = useRef(null);

  // Clear cache when document changes
  useEffect(() => {
    if (document?.id !== documentIdRef.current) {
      setCachedBlob(null);
      documentIdRef.current = document?.id;
    }
  }, [document?.id]);

  /**
   * Helper to get filename from document metadata
   * Handles both 'filename' and 'fileName' properties for consistency
   * @returns {string|null} - The filename or null if not found
   */
  const getFileName = () => {
    return document?.metadata?.filename || document?.metadata?.fileName || null;
  };

  /**
   * Validates document metadata before preview
   * @returns {Object} - Validation result with isValid and error message
   */
  const validateDocument = () => {
    if (!document) {
      return {
        isValid: false,
        error: "No document provided",
      };
    }

    if (document.type !== "file") {
      return {
        isValid: false,
        error: "Only files can be previewed",
      };
    }

    if (!document?.id) {
      return {
        isValid: false,
        error: "Document ID is missing",
      };
    }

    if (!getFileName()) {
      return {
        isValid: false,
        error: "Document filename is missing",
      };
    }

    return {
      isValid: true,
      error: null,
    };
  };

  /**
   * Check if the file is previewable
   * @returns {boolean}
   */
  const canPreview = () => {
    const fileName = getFileName();
    return fileName && isPreviewable(fileName);
  };

  /**
   * Handles the preview process
   */
  const handlePreview = async () => {
    // Validate document
    const validation = validateDocument();
    if (!validation.isValid) {
      toast.error("Cannot Preview", {
        description: validation.error,
        duration: 3000,
      });
      onPreviewError?.(new Error(validation.error));
      return;
    }

    // Check if file type is previewable
    if (!canPreview()) {
      const fileName = getFileName();
      toast.error("Cannot Preview", {
        description: getPreviewDisabledMessage(fileName),
        duration: 3000,
      });
      onPreviewError?.(new Error("File type not previewable"));
      return;
    }

    // If we have a cached blob, use it directly
    if (cachedBlob) {
      onOpen();
      onPreviewComplete?.();
      return;
    }

    setIsPreviewing(true);
    onPreviewStart?.();

    try {
      // Extract fileName and id from document
      const fileName = getFileName();
      const id = document.id;

      // Call API to preview document (fileName only used in mock mode)
      const blob = await apiService.previewDocument(id, fileName);

      // Cache the blob and open the modal
      setCachedBlob(blob);
      onOpen();

      onPreviewComplete?.();
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Preview Failed", {
        description: error.message || "Unable to preview file",
        duration: 3000,
      });
      onPreviewError?.(error);
    } finally {
      setIsPreviewing(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    onClose();
    // Note: We keep the cached blob for subsequent previews
  };

  // Determine if button should be disabled
  const buttonDisabled = isDisabled || isPreviewing || !canPreview();

  // Get tooltip message
  const getTooltipLabel = () => {
    if (!canPreview()) {
      const fileName = getFileName();
      return getPreviewDisabledMessage(fileName);
    }
    return "Preview document";
  };

  // If iconOnly, render IconButton
  if (iconOnly) {
    return (
      <>
        <Tooltip label={getTooltipLabel()} placement="top">
          <IconButton
            icon={<FiEye />}
            onClick={handlePreview}
            isDisabled={buttonDisabled}
            isLoading={isPreviewing}
            variant={variant}
            size={size}
            aria-label="Preview document"
          />
        </Tooltip>
        <PreviewModal
          isOpen={isOpen}
          onClose={handleModalClose}
          title={document?.title}
          fileName={getFileName()}
          fileBlob={cachedBlob}
        />
      </>
    );
  }

  // Render regular Button
  return (
    <>
      <Tooltip
        label={!canPreview() ? getTooltipLabel() : ""}
        placement="top"
        isDisabled={canPreview()}
      >
        <Button
          leftIcon={<FiEye />}
          onClick={handlePreview}
          isDisabled={buttonDisabled}
          isLoading={isPreviewing}
          variant={variant}
          size={size}
          w={fullWidth ? "full" : "auto"}
          loadingText="Loading..."
        >
          Preview
        </Button>
      </Tooltip>
      <PreviewModal
        isOpen={isOpen}
        onClose={handleModalClose}
        title={document?.title}
        fileName={getFileName()}
        fileBlob={cachedBlob}
      />
    </>
  );
};

export default PreviewButton;
