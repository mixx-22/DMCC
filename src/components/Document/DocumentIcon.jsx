import { 
  IoFolder, 
  IoDocument, 
  IoCalendar, 
  IoAlertCircle, 
  IoDocumentText,
  IoImage,
  IoVideocam,
  IoMusicalNotes,
  IoCode,
  IoArchive
} from "react-icons/io5";
import { getFileExtension } from "../../utils/fileTypes";

/**
 * Get file-type-specific icon and color based on file extension
 * @param {string} filename - The filename with extension
 * @returns {Object} - Object with icon component and color
 */
export const getFileIconByExtension = (filename) => {
  const extension = getFileExtension(filename);
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(extension)) {
    return { icon: IoImage, color: "#D69E2E" }; // Yellow/Gold for images
  }
  
  // Videos
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(extension)) {
    return { icon: IoVideocam, color: "#805AD5" }; // Purple for videos
  }
  
  // Audio
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'].includes(extension)) {
    return { icon: IoMusicalNotes, color: "#38A169" }; // Green for audio
  }
  
  // Documents/Text
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return { icon: IoDocumentText, color: "#E53E3E" }; // Red for documents
  }
  
  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
    return { icon: IoDocumentText, color: "#38A169" }; // Green for spreadsheets
  }
  
  // Presentations
  if (['ppt', 'pptx', 'odp'].includes(extension)) {
    return { icon: IoDocumentText, color: "#DD6B20" }; // Orange for presentations
  }
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'json', 'xml', 'yml', 'yaml', 'sh', 'sql'].includes(extension)) {
    return { icon: IoCode, color: "#3182CE" }; // Blue for code
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return { icon: IoArchive, color: "#718096" }; // Gray for archives
  }
  
  // Default file icon
  return { icon: IoDocument, color: "#718096" }; // Gray for unknown types
};

/**
 * Get document icon based on document type and file extension
 * @param {Object} doc - The document object
 * @param {number} size - Icon size (default: 24)
 * @returns {JSX.Element} - Icon component
 */
export const getDocumentIcon = (doc, size = 24) => {
  if (!doc || typeof doc !== "object") {
    return <IoAlertCircle size={size} color="#E53E3E" />;
  }

  const type = doc?.type;

  switch (type) {
    case "folder":
      return <IoFolder size={size} color="#3182CE" />;
    case "auditSchedule":
      return <IoCalendar size={size} color="#805AD5" />;
    case "formTemplate":
      return <IoDocumentText size={size} color="#38A169" />;
    case "file":
      if (!doc?.metadata?.filename) {
        return (
          <IoAlertCircle
            size={size}
            color="#E53E3E"
            title="Broken file - missing metadata"
          />
        );
      }
      // Get file-specific icon based on extension
      const { icon: IconComponent, color } = getFileIconByExtension(doc.metadata.filename);
      return <IconComponent size={size} color={color} title={doc.metadata.filename} />;
    default:
      return (
        <IoAlertCircle
          size={size}
          color="#E53E3E"
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
