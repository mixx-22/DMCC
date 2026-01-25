import {
  IoDocument,
  IoCalendar,
  IoAlertCircle,
  IoDocumentText,
  IoImage,
  IoVideocam,
  IoMusicalNotes,
  IoCode,
  IoArchive,
  IoClipboard,
} from "react-icons/io5";
import { getFileExtension } from "../../utils/fileTypes";
import AuptilyzeFolder from "../AuptilyzeFolder";
import { Icon } from "@chakra-ui/react";

/**
 * Get file-type-specific icon and color based on file extension
 * @param {string} filename - The filename with extension
 * @returns {Object} - Object with icon component and color
 */
export const getFileIconByExtension = (filename) => {
  const extension = getFileExtension(filename);

  // Images
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "ico"].includes(
      extension,
    )
  ) {
    return {
      icon: IoImage,
      color: "brandPrimary.600",
      _dark: { color: "brandPrimary.200" },
    }; // Yellow/Gold for images
  }

  // Videos
  if (
    ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv"].includes(
      extension,
    )
  ) {
    return {
      icon: IoVideocam,
      color: "purple.600",
      _dark: { color: "purple.200" },
    }; // Purple for videos
  }

  // Audio
  if (["mp3", "wav", "ogg", "aac", "flac", "wma", "m4a"].includes(extension)) {
    return {
      icon: IoMusicalNotes,
      color: "green.600",
      _dark: { color: "green.200" },
    }; // Green for audio
  }

  // Documents/Text
  if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(extension)) {
    return {
      icon: IoDocumentText,
      color: "error.600",
      _dark: { color: "error.200" },
    }; // Red for documents
  }

  // Spreadsheets
  if (["xls", "xlsx", "csv", "ods"].includes(extension)) {
    return {
      icon: IoDocumentText,
      color: "green.600",
      _dark: { color: "green.200" },
    }; // Green for spreadsheets
  }

  // Presentations
  if (["ppt", "pptx", "odp"].includes(extension)) {
    return {
      icon: IoDocumentText,
      color: "DD6B20.600",
      _dark: { color: "DD6B20.200" },
    }; // Orange for presentations
  }

  // Code files
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "java",
      "c",
      "cpp",
      "cs",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
      "kt",
      "html",
      "css",
      "scss",
      "json",
      "xml",
      "yml",
      "yaml",
      "sh",
      "sql",
    ].includes(extension)
  ) {
    return {
      icon: IoCode,
      color: "brandPrimary.600",
      _dark: { color: "brandPrimary.200" },
    }; // Blue for code
  }

  // Archives
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(extension)) {
    return { icon: IoArchive, color: "gray.600", _dark: { color: "gray.200" } }; // Gray for archives
  }

  // Default file icon
  return { icon: IoDocument, color: "gray.600", _dark: { color: "gray.200" } }; // Gray for unknown types
};

/**
 * Get document icon based on document type and file extension
 * @param {Object} doc - The document object
 * @param {number} size - Icon size (default: 24)
 * @returns {JSX.Element} - Icon component
 */
export const getDocumentIcon = (doc, size = 24) => {
  if (!doc || typeof doc !== "object") {
    return (
      <IoAlertCircle
        boxSize={`${size}px`}
        color="error.600"
        _dark={{ color: "error.200" }}
      />
    );
  }

  const type = doc?.type;

  switch (type) {
    case "folder":
      return <AuptilyzeFolder boxSize={`${size}px`} />;
    case "auditSchedule":
      return (
        <Icon
          as={IoCalendar}
          boxSize={`${size}px`}
          color="purple.600"
          _dark={{ color: "purple.200" }}
        />
      );
    case "formTemplate":
      return (
        <Icon
          as={IoClipboard}
          boxSize={`${size}px`}
          color="green.600"
          _dark={{ color: "green.200" }}
        />
      );
    case "formResponse":
      return (
        <Icon
          as={IoDocumentText}
          boxSize={`${size}px`}
          color="green.600"
          _dark={{ color: "green.200" }}
        />
      );
    case "file": {
      if (!doc?.metadata?.filename) {
        return (
          <Icon
            as={IoAlertCircle}
            boxSize={`${size}px`}
            color="error.600"
            _dark={{ color: "error.200" }}
            title="Broken file - missing metadata"
          />
        );
      }
      const {
        icon: IconComponent,
        color,
        _dark,
      } = getFileIconByExtension(doc.metadata.filename);
      return (
        <Icon
          as={IconComponent}
          boxSize={`${size}px`}
          {...{ color, _dark }}
          title={doc.metadata.filename}
        />
      );
    }
    default:
      return (
        <Icon
          as={IoAlertCircle}
          boxSize={`${size}px`}
          color="error.600"
          _dark={{ color: "error.200" }}
          title="Unknown document type"
        />
      );
  }
};

export const isDocumentValid = (doc) => {
  if (!doc || typeof doc !== "object") return false;
  if (!doc.type) return false;
  if (doc.type === "file" && !doc?.metadata?.filename) return false;
  return true;
};
