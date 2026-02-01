import PropTypes from "prop-types";
import { Badge, WrapItem } from "@chakra-ui/react";

const DocumentBadges = ({ data = {}, isValid }) => {
  const { type = "file", metadata = {}, permissionOverrides = {} } = data;
  const { version, fileType } = metadata;
  const { readOnly = false, restricted = false } = permissionOverrides;
  if (!data) return "";
  return (
    <>
      <WrapItem>
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
      </WrapItem>
      {readOnly ? (
        <WrapItem>
          <Badge colorScheme="orange">Read Only</Badge>
        </WrapItem>
      ) : (
        ""
      )}
      {restricted ? (
        <WrapItem>
          <Badge colorScheme="red">Restricted</Badge>
        </WrapItem>
      ) : (
        ""
      )}
      {!isValid ? (
        <WrapItem>
          <Badge colorScheme="red">Broken</Badge>
        </WrapItem>
      ) : (
        ""
      )}
    </>
  );
};

DocumentBadges.propTypes = {
  data: PropTypes.object,
  isValid: PropTypes.bool,
};

export default DocumentBadges;
