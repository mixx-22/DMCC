import PropTypes from "prop-types";
import { Badge, Stack } from "@chakra-ui/react";

const DocumentBadges = ({ data = {}, isValid }) => {
  const { type = "file", metadata = {}, permissionOverrides = {} } = data;
  const { version, fileType } = metadata;
  const { readOnly = false, restricted = false } = permissionOverrides;
  if (!data) return "";
  return (
    <Stack direction="row">
      <Badge
        colorScheme={
          type === "folder"
            ? "brandPrimary"
            : type === "auditSchedule"
              ? "purple"
              : ["formTemplate", "formResponse"].includes(type)
                ? "green"
                : type === "file"
                  ? "brandPrimary"
                  : "gray"
        }
      >
        {type === "auditSchedule"
          ? "Audit Schedule"
          : type === "formTemplate"
            ? "Form Template"
            : type === "formResponse"
              ? "Form Response"
              : type === "file"
                ? fileType.trackVersioning
                  ? version
                  : "File"
                : type
                  ? type.charAt(0).toUpperCase() + type.slice(1)
                  : "Unknown"}
      </Badge>
      {readOnly && <Badge colorScheme="orange">Read Only</Badge>}
      {restricted && <Badge colorScheme="red">Restricted</Badge>}
      {!isValid && <Badge colorScheme="red">Broken</Badge>}
    </Stack>
  );
};

DocumentBadges.propTypes = {
  data: PropTypes.object,
  isValid: PropTypes.bool,
};

export default DocumentBadges;
