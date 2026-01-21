import { useState } from "react";
import { Button, IconButton, Tooltip } from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";
import { toast } from "sonner";
import apiService from "../../services/api";

/**
 * Reusable download button component for documents
 * @param {Object} document - Document object with metadata {fileName, key}
 * @param {boolean} isDisabled - Disable the button
 * @param {string} variant - Chakra UI button variant (default: "outline")
 * @param {string} size - Chakra UI button size (default: "md")
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} iconOnly - Show only icon without text
 * @param {Function} onDownloadStart - Callback when download starts
 * @param {Function} onDownloadComplete - Callback when download completes
 * @param {Function} onDownloadError - Callback when download fails
 */
export const DownloadButton = ({
  document,
  isDisabled = false,
  variant = "outline",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Validates document metadata before download
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
        error: "Only files can be downloaded",
      };
    }

    if (!document?.metadata?.key) {
      return {
        isValid: false,
        error: "Document key is missing",
      };
    }

    if (!document?.metadata?.filename && !document?.metadata?.fileName) {
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
   * Handles the download process
   */
  const handleDownload = async () => {
    // Validate document
    const validation = validateDocument();
    if (!validation.isValid) {
      toast.error("Cannot Download", {
        description: validation.error,
        duration: 3000,
      });
      onDownloadError?.(new Error(validation.error));
      return;
    }

    setIsDownloading(true);
    onDownloadStart?.();

    try {
      // Extract fileName and key from metadata
      const fileName = document.metadata.filename || document.metadata.fileName;
      const key = document.metadata.key;

      // Call API to download document
      const blob = await apiService.downloadDocument(fileName, key);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName || document?.title || "download";
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);

      toast.success("Download Started", {
        description: `${fileName} is downloading`,
        duration: 2000,
      });

      onDownloadComplete?.();
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download Failed", {
        description: error.message || "Unable to download file",
        duration: 3000,
      });
      onDownloadError?.(error);
    } finally {
      setIsDownloading(false);
    }
  };

  // If iconOnly, render IconButton
  if (iconOnly) {
    return (
      <Tooltip label="Download" placement="top">
        <IconButton
          icon={<FiDownload />}
          onClick={handleDownload}
          isDisabled={isDisabled || isDownloading}
          isLoading={isDownloading}
          variant={variant}
          size={size}
          aria-label="Download document"
        />
      </Tooltip>
    );
  }

  // Render regular Button
  return (
    <Button
      leftIcon={<FiDownload />}
      onClick={handleDownload}
      isDisabled={isDisabled || isDownloading}
      isLoading={isDownloading}
      variant={variant}
      size={size}
      w={fullWidth ? "full" : "auto"}
      loadingText="Downloading..."
    >
      Download
    </Button>
  );
};

export default DownloadButton;
