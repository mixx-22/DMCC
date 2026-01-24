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
  Editable,
  EditableTextarea,
  EditablePreview,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import {
  FiTrash2,
  FiMove,
  FiShare2,
  FiMoreVertical,
} from "react-icons/fi";
import Timestamp from "../Timestamp";
import DeleteDocumentModal from "./modals/DeleteDocumentModal";
import MoveDocumentModal from "./modals/MoveDocumentModal";
import PrivacySettingsModal from "./modals/PrivacySettingsModal";
import DownloadButton from "./DownloadButton";
import { useDocuments } from "../../context/_useContext";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getDocumentIcon } from "./DocumentIcon";
import FileTypeAsyncSelect from "../FileTypeAsyncSelect";

const DocumentDrawer = ({ document, isOpen, onClose }) => {
  const { updateDocument } = useDocuments();
  const [titleCache, setTitleCache] = useState("");
  const [descriptionCache, setDescriptionCache] = useState("");
  const [fileTypeCache, setFileTypeCache] = useState(null);
  const titleTextareaRef = useRef(null);
  const descriptionTextareaRef = useRef(null);
  const fileTypeDebounceRef = useRef(null);

  useEffect(() => {
    setTitleCache(document?.title || "");
    setDescriptionCache(document?.description || "");
    setFileTypeCache(document?.metadata?.fileType || null);
  }, [document]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (fileTypeDebounceRef.current) {
        clearTimeout(fileTypeDebounceRef.current);
      }
    };
  }, []);

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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isDocumentValid = () => {
    if (!document || typeof document !== "object") return false;
    if (!document.type) return false;
    if (document.type === "file" && !document?.metadata?.filename) return false;
    return true;
  };

  const isValid = isDocumentValid();

  const handleTitleBlur = async (newTitle) => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      toast.error("Validation Error", {
        description: "Title cannot be empty. Reverted to previous value.",
        duration: 3000,
      });
      return;
    }

    if (titleCache === trimmedTitle) {
      return;
    }

    try {
      await updateDocument(document.id || document._id, {
        title: trimmedTitle,
      });
      toast.success("Title Updated", {
        description: "Document title has been updated",
        duration: 2000,
      });
      setTitleCache(trimmedTitle);
    } catch (error) {
      toast.error("Update Failed", {
        description: "Failed to update title",
        duration: 3000,
      });
    }
  };

  const handleDescriptionBlur = async (newDescription) => {
    if (descriptionCache === newDescription) {
      return;
    }

    try {
      await updateDocument(document.id || document._id, {
        description: newDescription,
      });
      toast.success("Description Updated", {
        description: "Document description has been updated",
        duration: 2000,
      });
      setDescriptionCache(newDescription);
    } catch (error) {
      toast.error("Update Failed", {
        description: "Failed to update description",
        duration: 3000,
      });
    }
  };

  const handleFileTypeChange = async (newFileType) => {
    // Store original value for rollback
    const originalFileType = fileTypeCache;
    
    // Check if value actually changed
    const isSame = (originalFileType?.id === newFileType?.id) || 
                   (!originalFileType && !newFileType);
    
    if (isSame) {
      return;
    }

    // Prevent request if clearing file type (setting to null/empty)
    if (!newFileType || !newFileType.id) {
      setFileTypeCache(null);
      return;
    }

    // Optimistically update UI
    setFileTypeCache(newFileType);

    // Clear any existing debounce timer
    if (fileTypeDebounceRef.current) {
      clearTimeout(fileTypeDebounceRef.current);
    }

    // Debounce the API call
    fileTypeDebounceRef.current = setTimeout(async () => {
      try {
        await updateDocument(document.id || document._id, {
          metadata: {
            ...document.metadata,
            fileType: newFileType.id,
          },
        });
        toast.success("File Type Updated", {
          description: "Document file type has been updated",
          duration: 2000,
        });
      } catch (error) {
        // Revert to original value on error
        setFileTypeCache(originalFileType);
        toast.error("Update Failed", {
          description: "Failed to update file type",
          duration: 3000,
        });
      }
    }, 500); // 500ms debounce delay
  };

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Document Details</DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={4}>
              <VStack align="center" py={4}>
                {getDocumentIcon(document, 48)}
                <Editable
                  key={`drawer-title-${document?.id || document?._id}`}
                  defaultValue={document?.title || "Untitled"}
                  onSubmit={handleTitleBlur}
                  fontSize="lg"
                  fontWeight="bold"
                  textAlign="center"
                  color={isValid ? "inherit" : "red.500"}
                  w="full"
                  isPreviewFocusable={true}
                  submitOnBlur={true}
                  selectAllOnFocus={false}
                >
                  <EditablePreview
                    py={2}
                    px={2}
                    borderRadius="md"
                    _hover={{
                      background: "gray.100",
                      cursor: "pointer",
                    }}
                  />
                  <EditableTextarea
                    ref={titleTextareaRef}
                    py={2}
                    px={2}
                    textAlign="center"
                    resize="vertical"
                    minH="auto"
                    rows={1}
                    onFocus={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                  />
                </Editable>
                {!isValid && (
                  <Badge colorScheme="red" fontSize="sm">
                    Broken Document
                  </Badge>
                )}
              </VStack>

              <Divider />

              {/* Editable Description */}
              <Box w="full">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  mb={2}
                  color="gray.600"
                >
                  Description
                </Text>
                <Editable
                  key={`drawer-description-${document?.id || document?._id}`}
                  defaultValue={document?.description || ""}
                  onSubmit={handleDescriptionBlur}
                  placeholder="Add a description..."
                  w="full"
                  isPreviewFocusable={true}
                  submitOnBlur={true}
                  selectAllOnFocus={false}
                >
                  <EditablePreview
                    w="full"
                    py={2}
                    px={2}
                    borderRadius="md"
                    color={descriptionCache?.length ? "inherit" : "gray.400"}
                    fontSize="sm"
                    minH="60px"
                    _hover={{
                      background: "gray.100",
                      cursor: "pointer",
                    }}
                  />
                  <EditableTextarea
                    ref={descriptionTextareaRef}
                    py={2}
                    px={2}
                    fontSize="sm"
                    minH="60px"
                    resize="vertical"
                    onFocus={(e) => {
                      // Auto-resize on focus
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onInput={(e) => {
                      // Continue resizing as user types
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                  />
                </Editable>
              </Box>

              <Divider />

              {/* Action Buttons */}
              <VStack spacing={2} align="stretch">
                {document?.type === "file" && document?.metadata?.key && (
                  <DownloadButton
                    document={document}
                    variant="outline"
                    fullWidth={true}
                    isDisabled={!isValid}
                  />
                )}
                <Button
                  leftIcon={<FiMove />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={onMoveOpen}
                >
                  Move
                </Button>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<FiMoreVertical />}
                    colorScheme="gray"
                    variant="outline"
                  >
                    More Options
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      icon={<FiTrash2 />}
                      color="red.500"
                      onClick={onDeleteOpen}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
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
                      {document?.type === "auditSchedule"
                        ? "Audit Schedule"
                        : document?.type === "formTemplate"
                          ? "Form Template"
                          : document?.type
                            ? document.type.charAt(0).toUpperCase() +
                              document.type.slice(1)
                            : "Unknown"}
                    </Text>
                  </Box>

                  {document?.description && (
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
                    {document?.owner?.id ? (
                      <Link
                        as={RouterLink}
                        to={`/users/${document.owner.id}`}
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {document?.owner?.firstName && document?.owner?.lastName
                          ? `${document.owner.firstName} ${document.owner.lastName}`
                          : "Unknown"}
                      </Link>
                    ) : (
                      <Text fontSize="sm">
                        {document?.owner?.firstName && document?.owner?.lastName
                          ? `${document.owner.firstName} ${document.owner.lastName}`
                          : "Unknown"}
                      </Text>
                    )}
                    {document?.owner?.team && (
                      <Text fontSize="xs" color="gray.500">
                        {document.owner.team}
                      </Text>
                    )}
                  </Box>

                  {document?.createdAt && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Created
                      </Text>
                      <Timestamp date={document.createdAt} fontSize="sm" />
                    </Box>
                  )}

                  {document?.updatedAt && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">
                        Modified
                      </Text>
                      <Timestamp date={document.updatedAt} fontSize="sm" />
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* File-specific metadata */}
              {document?.type === "file" && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      File Details
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {document?.metadata?.filename ? (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Filename
                          </Text>
                          <Text fontSize="sm" wordBreak="break-all">
                            {document.metadata.filename}
                          </Text>
                        </Box>
                      ) : (
                        <Box>
                          <Text fontSize="sm" color="red.500">
                            ⚠️ Missing filename metadata
                          </Text>
                        </Box>
                      )}
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Size
                        </Text>
                        <Text fontSize="sm">
                          {formatFileSize(document?.metadata?.size)}
                        </Text>
                      </Box>
                      {document?.metadata?.version && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Version
                          </Text>
                          <Text fontSize="sm">{document.metadata.version}</Text>
                        </Box>
                      )}
                      <Box>
                        <FileTypeAsyncSelect
                          value={fileTypeCache}
                          onChange={handleFileTypeChange}
                          label="File Type"
                          helperText=""
                        />
                      </Box>
                    </VStack>
                  </Box>
                </>
              )}

              {/* Folder-specific metadata */}
              {document?.type === "folder" && (
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
                            document?.metadata?.allowInheritance
                              ? "green"
                              : "gray"
                          }
                        >
                          {document?.metadata?.allowInheritance
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </Box>
                    </VStack>
                  </Box>
                </>
              )}

              {/* Audit Schedule-specific metadata */}
              {document?.type === "auditSchedule" && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Audit Details
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {document?.metadata?.code && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Code
                          </Text>
                          <Text fontSize="sm">{document.metadata.code}</Text>
                        </Box>
                      )}
                      {document?.metadata?.type && (
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Audit Type
                          </Text>
                          <Text fontSize="sm">
                            {document.metadata.type
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
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
                          <Text fontSize="sm">
                            {document.metadata.standard}
                          </Text>
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

              {/* Form Template-specific metadata */}
              {document?.type === "formTemplate" && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="semibold" mb={2}>
                      Form Questions
                    </Text>
                    {document?.metadata?.questions && document.metadata.questions.length > 0 ? (
                      <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          {document.metadata.questions.length} question{document.metadata.questions.length !== 1 ? 's' : ''} defined
                        </Text>
                        <VStack align="stretch" spacing={1}>
                          {document.metadata.questions.slice(0, 3).map((question, index) => (
                            <Text key={question.id} fontSize="sm">
                              {index + 1}. {question.label} ({question.type})
                            </Text>
                          ))}
                          {document.metadata.questions.length > 3 && (
                            <Text fontSize="sm" color="gray.500" fontStyle="italic">
                              ... and {document.metadata.questions.length - 3} more
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No questions defined
                      </Text>
                    )}
                  </Box>
                </>
              )}

              {/* Privacy Information */}
              <Divider />
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="semibold">Privacy</Text>
                  <Button
                    leftIcon={<FiShare2 />}
                    size="xs"
                    colorScheme="blue"
                    variant="outline"
                    onClick={onPrivacyOpen}
                  >
                    Settings
                  </Button>
                </Flex>
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
                          document.permissionOverrides.readOnly
                            ? "orange"
                            : "gray"
                        }
                      >
                        {document.permissionOverrides.readOnly
                          ? "Read Only"
                          : "Can Edit"}
                      </Badge>
                      <Badge
                        colorScheme={
                          document.permissionOverrides.restricted
                            ? "red"
                            : "gray"
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
      <DeleteDocumentModal
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
