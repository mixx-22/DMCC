import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Box,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiTrash2,
  FiDownload,
  FiMove,
  FiShare2,
  FiFile,
  FiFolder,
  FiCalendar,
} from "react-icons/fi";
import Timestamp from "./Timestamp";
import EditDocumentModal from "./EditDocumentModal";
import DeleteDocumentModalV2 from "./DeleteDocumentModalV2";
import MoveDocumentModal from "./MoveDocumentModal";
import PrivacySettingsModal from "./PrivacySettingsModal";

const DocumentDrawer = ({ document, isOpen, onClose }) => {
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isMoveOpen,
    onOpen: onMoveOpen,
    onClose: onMoveClose,
  } = useDisclosure();

  const {
    isOpen: isPrivacyOpen,
    onOpen: onPrivacyOpen,
    onClose: onPrivacyClose,
  } = useDisclosure();

  if (!document) return null;

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      "-1": { label: "Draft", color: "gray" },
      "0": { label: "Under Review", color: "yellow" },
      "1": { label: "Approved", color: "green" },
      "2": { label: "Archived", color: "blue" },
      "3": { label: "Expired", color: "red" },
    };
    const statusInfo = statusMap[String(status)] || statusMap["0"];
    return (
      <Badge colorScheme={statusInfo.color} fontSize="sm">
        {statusInfo.label}
      </Badge>
    );
  };

  // Get document icon
  const getDocumentIcon = () => {
    switch (document.type) {
      case "folder":
        return <FiFolder size={48} color="#3182CE" />;
      case "auditSchedule":
        return <FiCalendar size={48} color="#805AD5" />;
      case "file":
      default:
        return <FiFile size={48} color="#718096" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = () => {
    if (document.type === "file" && document.metadata.key) {
      const link = window.document.createElement("a");
      link.href = document.metadata.key;
      link.download = document.metadata.filename || document.title;
      link.click();
    }
  };

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Document Details</DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={4}>
              {/* Icon and Title */}
              <VStack align="center" py={4}>
                {getDocumentIcon()}
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  {document.title || "Untitled"}
                </Text>
                {getStatusBadge(document.status)}
              </VStack>

              <Divider />

              {/* Action Buttons */}
              <VStack spacing={2} align="stretch">
                {document.type === "file" && (
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                )}
                <Button
                  leftIcon={<FiEdit />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={onEditOpen}
                >
                  Edit Details
                </Button>
                <Button
                  leftIcon={<FiMove />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={onMoveOpen}
                >
                  Move
                </Button>
                <Button
                  leftIcon={<FiShare2 />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={onPrivacyOpen}
                >
                  Privacy Settings
                </Button>
                <Button
                  leftIcon={<FiTrash2 />}
                  colorScheme="red"
                  variant="outline"
                  onClick={onDeleteOpen}
                >
                  Delete
                </Button>
              </VStack>

              <Divider />

              {/* Document Information */}
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Information
                </Text>
                <VStack align="stretch" spacing={2}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Type
                    </Text>
                    <Text fontSize="sm">
                      {document.type === "auditSchedule"
                        ? "Audit Schedule"
                        : document.type.charAt(0).toUpperCase() +
                          document.type.slice(1)}
                    </Text>
                  </Box>

                  {document.description && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Description
                      </Text>
                      <Text fontSize="sm">{document.description}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Owner
                    </Text>
                    <Text fontSize="sm">
                      {document.owner.firstName} {document.owner.lastName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {document.owner.team}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Created
                    </Text>
                    <Timestamp date={document.createdAt} fontSize="sm" />
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Modified
                    </Text>
                    <Timestamp date={document.updatedAt} fontSize="sm" />
                  </Box>
                </VStack>
              </Box>

              {/* File-specific metadata */}
              {document.type === "file" && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      File Details
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Filename
                        </Text>
                        <Text fontSize="sm" wordBreak="break-all">
                          {document.metadata.filename}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Size
                        </Text>
                        <Text fontSize="sm">
                          {formatFileSize(document.metadata.size)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Version
                        </Text>
                        <Text fontSize="sm">{document.metadata.version}</Text>
                      </Box>
                    </VStack>
                  </Box>
                </>
              )}

              {/* Folder-specific metadata */}
              {document.type === "folder" && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Folder Settings
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Privacy Inheritance
                        </Text>
                        <Badge
                          colorScheme={
                            document.metadata.allowInheritance ? "green" : "gray"
                          }
                        >
                          {document.metadata.allowInheritance
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </Box>
                    </VStack>
                  </Box>
                </>
              )}

              {/* Audit Schedule-specific metadata */}
              {document.type === "auditSchedule" && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Audit Details
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {document.metadata.code && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Code
                          </Text>
                          <Text fontSize="sm">{document.metadata.code}</Text>
                        </Box>
                      )}
                      {document.metadata.type && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Audit Type
                          </Text>
                          <Text fontSize="sm">
                            {document.metadata.type
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </Text>
                        </Box>
                      )}
                      {document.metadata.standard && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Standard
                          </Text>
                          <Text fontSize="sm">{document.metadata.standard}</Text>
                        </Box>
                      )}
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Auditors
                        </Text>
                        <Text fontSize="sm">
                          {document.metadata.auditors.length} assigned
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </>
              )}

              {/* Privacy Information */}
              <Divider />
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Privacy
                </Text>
                <VStack align="stretch" spacing={2}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Shared with
                    </Text>
                    {document.privacy.users.length === 0 &&
                    document.privacy.teams.length === 0 &&
                    document.privacy.roles.length === 0 ? (
                      <Text fontSize="sm" color="gray.500">
                        Public (Everyone can view)
                      </Text>
                    ) : (
                      <VStack align="stretch" spacing={1} mt={1}>
                        {document.privacy.users.length > 0 && (
                          <Text fontSize="sm">
                            {document.privacy.users.length} user(s)
                          </Text>
                        )}
                        {document.privacy.teams.length > 0 && (
                          <Text fontSize="sm">
                            {document.privacy.teams.length} team(s)
                          </Text>
                        )}
                        {document.privacy.roles.length > 0 && (
                          <Text fontSize="sm">
                            {document.privacy.roles.length} role(s)
                          </Text>
                        )}
                      </VStack>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Permissions
                    </Text>
                    <HStack spacing={2} mt={1}>
                      <Badge
                        colorScheme={
                          document.permissionOverrides.readOnly ? "orange" : "gray"
                        }
                      >
                        {document.permissionOverrides.readOnly
                          ? "Read Only"
                          : "Can Edit"}
                      </Badge>
                      <Badge
                        colorScheme={
                          document.permissionOverrides.restricted ? "red" : "gray"
                        }
                      >
                        {document.permissionOverrides.restricted
                          ? "Restricted"
                          : "Open"}
                      </Badge>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Modals */}
      <EditDocumentModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        document={document}
      />
      <DeleteDocumentModalV2
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        document={document}
        onDeleteSuccess={onClose}
      />
      <MoveDocumentModal
        isOpen={isMoveOpen}
        onClose={onMoveClose}
        document={document}
      />
      <PrivacySettingsModal
        isOpen={isPrivacyOpen}
        onClose={onPrivacyClose}
        document={document}
      />
    </>
  );
};

export default DocumentDrawer;
