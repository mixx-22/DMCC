import PropTypes from "prop-types";
import { Badge, Tooltip, WrapItem } from "@chakra-ui/react";
import {
  isQualityDocument,
  getStatusLabel,
  getModeLabel,
  LIFECYCLE_STATUS,
  WORKFLOW_MODE,
} from "../../utils/qualityDocumentUtils";

/**
 * Displays lifecycle status badges for quality documents
 */
const QualityDocumentBadges = ({ document }) => {
  if (!isQualityDocument(document)) {
    return null;
  }

  const { status, checkedOut, mode } = document;

  // Determine status badge color
  const getStatusColor = () => {
    switch (status) {
      case LIFECYCLE_STATUS.WORKING:
        return "gray";
      case LIFECYCLE_STATUS.UNDER_REVIEW:
        return "blue";
      case LIFECYCLE_STATUS.APPROVED:
        return "green";
      case LIFECYCLE_STATUS.PUBLISHED:
        return "green";
      default:
        return "gray";
    }
  };

  // Determine mode badge color
  const getModeColor = () => {
    switch (mode) {
      case WORKFLOW_MODE.TEAM:
        return "purple";
      case WORKFLOW_MODE.CONTROLLER:
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <>
      {/* Status Badge */}
      <WrapItem>
        <Tooltip label={`Lifecycle Status: ${getStatusLabel(status)}`}>
          <Badge colorScheme={getStatusColor()}>{getStatusLabel(status)}</Badge>
        </Tooltip>
      </WrapItem>

      {/* Checkout Status Badge */}
      {checkedOut === 0 && (
        <WrapItem>
          <Tooltip label="Document is checked in (read-only)">
            <Badge colorScheme="red">Checked In</Badge>
          </Tooltip>
        </WrapItem>
      )}

      {/* Mode Badge */}
      {mode && (
        <WrapItem>
          <Tooltip label={`Current Review Mode: ${getModeLabel(mode)}`}>
            <Badge colorScheme={getModeColor()}>{getModeLabel(mode)}</Badge>
          </Tooltip>
        </WrapItem>
      )}
    </>
  );
};

QualityDocumentBadges.propTypes = {
  document: PropTypes.object.isRequired,
};

export default QualityDocumentBadges;
