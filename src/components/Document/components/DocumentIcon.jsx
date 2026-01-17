import { FiFolder, FiFile, FiCalendar, FiAlertCircle } from "react-icons/fi";

export const getDocumentIcon = (doc) => {
  if (!doc || typeof doc !== "object") {
    return <FiAlertCircle size={24} color="#E53E3E" />;
  }

  const type = doc?.type;

  switch (type) {
    case "folder":
      return <FiFolder size={24} color="#3182CE" />;
    case "auditSchedule":
      return <FiCalendar size={24} color="#805AD5" />;
    case "file":
      if (!doc?.metadata?.filename) {
        return (
          <FiAlertCircle
            size={24}
            color="#E53E3E"
            title="Broken file - missing metadata"
          />
        );
      }
      return <FiFile size={24} color="#718096" />;
    default:
      return (
        <FiAlertCircle
          size={24}
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
