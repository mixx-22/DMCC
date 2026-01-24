import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Divider,
  useDisclosure,
  Spinner,
  Center,
  Badge,
  Container,
  Heading,
  SimpleGrid,
  Avatar,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
  Tooltip,
  Editable,
  EditableTextarea,
  EditablePreview,
  Link,
} from "@chakra-ui/react";
import {
  FiTrash2,
  FiMove,
  FiShare2,
  FiEdit,
  FiMoreVertical,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUpload,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import DeleteDocumentModal from "../../components/Document/modals/DeleteDocumentModal";
import MoveDocumentModal from "../../components/Document/modals/MoveDocumentModal";
import PrivacySettingsModal from "../../components/Document/modals/PrivacySettingsModal";
import DownloadButton from "../../components/Document/DownloadButton";
import PreviewButton from "../../components/Document/PreviewButton";
import Timestamp from "../../components/Timestamp";
import Breadcrumbs from "../../components/Document/Breadcrumbs";
import { useDocuments } from "../../context/_useContext";
import { toast } from "sonner";
import { getDocumentIcon } from "../../components/Document/DocumentIcon";

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchDocumentById, updateDocument, loading } = useDocuments();

  const [document, setDocument] = useState(null);
  const fetchedRef = useRef(false);
  const currentIdRef = useRef(null);
  const titleTextareaRef = useRef(null);
  const descriptionTextareaRef = useRef(null);

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

  // Fetch document using useRef to prevent duplicates
  useEffect(() => {
    const loadDocument = async () => {
      if (currentIdRef.current === id && fetchedRef.current) {
        return;
      }

      fetchedRef.current = true;
      currentIdRef.current = id;

      try {
        const doc = await fetchDocumentById(id);
        if (doc) {
          setDocument(doc);
        } else {
          navigate("/documents");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        navigate("/documents");
      }
    };

    if (id) {
      loadDocument();
    }

    return () => {
      if (currentIdRef.current !== id) {
        fetchedRef.current = false;
      }
    };
  }, [id, fetchDocumentById, navigate]);

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

  // Handle inline title update on blur
  const handleTitleBlur = async (newTitle) => {
    const trimmedTitle = newTitle.trim();

    // If title is empty, revert and notify
    if (!trimmedTitle) {
      toast.error("Validation Error", {
        description: "Title cannot be empty. Reverted to previous value.",
        duration: 3000,
      });
      // Force re-render to show original value
      setDocument((prev) => ({ ...prev }));
      return;
    }

    // Only update if value actually changed
    if (trimmedTitle === document?.title) {
      return;
    }

    try {
      await updateDocument(id, { title: trimmedTitle });
      setDocument((prev) => ({ ...prev, title: trimmedTitle }));
      toast.success("Title Updated", {
        description: "Document title has been updated",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: "Failed to update title",
        duration: 3000,
      });
      // Revert on error
      setDocument((prev) => ({ ...prev }));
    }
  };

  // Handle inline description update on blur
  const handleDescriptionBlur = async (newDescription) => {
    // Allow empty descriptions
    // Only update if value actually changed
    if (newDescription === document?.description) {
      return;
    }

    try {
      await updateDocument(id, { description: newDescription });
      setDocument((prev) => ({ ...prev, description: newDescription }));
      toast.success("Description Updated", {
        description: "Document description has been updated",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: "Failed to update description",
        duration: 3000,
      });
      // Revert on error
      setDocument((prev) => ({ ...prev }));
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader>
          <Heading variant="pageTitle">Documents</Heading>
        </PageHeader>
        <Box flex="1" bg="gray.50" p={8}>
          <Center h="400px">
            <VStack>
              <Spinner size="xl" color="blue.500" />
              <Text mt={4} color="gray.600">
                Loading document...
              </Text>
            </VStack>
          </Center>
        </Box>
        <PageFooter />
      </>
    );
  }

  if (!document) {
    return (
      <>
        <PageHeader>
          <Heading variant="pageTitle">Documents</Heading>
        </PageHeader>
        <Box flex="1" bg="gray.50" p={8}>
          <Center h="400px">
            <VStack>
              <Text fontSize="xl" color="gray.600">
                Document not found
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => navigate("/documents")}
                mt={4}
              >
                Back to Documents
              </Button>
            </VStack>
          </Center>
        </Box>
        <PageFooter />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <Breadcrumbs data={document} from={location.state?.from} />
      </PageHeader>
      <Box flex="1" p={{ base: 4, md: 8 }}>
        <Container maxW="container.xl">
          {/* Bento Grid Layout */}
          <SimpleGrid
            columns={{ base: 1, lg: 12 }}
            gap={6}
            autoRows="minmax(120px, auto)"
          >
            {/* Main Document Info - Spans 8 columns, 2 rows */}
            <Card
              gridColumn={{ base: "1", lg: "1 / 9" }}
              gridRow={{ base: "auto", lg: "1 / 3" }}
            >
              <CardBody>
                <Flex justify="space-between" align="start" mb={4}>
                  <HStack spacing={4} flex="1" align="start">
                    {getDocumentIcon(document, 56)}
                    <VStack align="start" spacing={2} flex="1">
                      <Editable
                        key={`title-${document?.id || document?._id}`}
                        defaultValue={document?.title || "Untitled"}
                        onSubmit={handleTitleBlur}
                        fontSize="2xl"
                        fontWeight="bold"
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
                          resize="vertical"
                          minH="auto"
                          rows={1}
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
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={
                            document?.type === "folder"
                              ? "blue"
                              : document?.type === "auditSchedule"
                                ? "purple"
                                : document?.type === "formTemplate"
                                  ? "green"
                                  : "gray"
                          }
                        >
                          {document?.type === "auditSchedule"
                            ? "Audit Schedule"
                            : document?.type === "formTemplate"
                              ? "Form Template"
                              : document?.type
                                ? document.type.charAt(0).toUpperCase() +
                                  document.type.slice(1)
                                : "Unknown"}
                        </Badge>
                        {!isValid && <Badge colorScheme="red">Broken</Badge>}
                      </HStack>
                    </VStack>
                  </HStack>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<FiMove />} onClick={onMoveOpen}>
                        Move
                      </MenuItem>
                      <Divider />
                      <MenuItem
                        icon={<FiTrash2 />}
                        color="red.500"
                        onClick={onDeleteOpen}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>

                <Divider mb={4} />

                <Editable
                  key={`description-${document?.id || document?._id}`}
                  defaultValue={document?.description || ""}
                  onSubmit={handleDescriptionBlur}
                  placeholder="Add a description..."
                  w="full"
                  isPreviewFocusable={true}
                  submitOnBlur={true}
                  selectAllOnFocus={false}
                >
                  <EditablePreview
                    py={2}
                    px={2}
                    borderRadius="md"
                    color={document?.description ? "gray.700" : "gray.400"}
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

                <Divider mb={4} />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Owner
                    </Text>
                    {document?.owner?.id ? (
                      <Link
                        as={RouterLink}
                        to={`/users/${document.owner.id}`}
                        _hover={{ textDecoration: "none" }}
                      >
                        <HStack mt={2} _hover={{ opacity: 0.8 }}>
                          <Avatar
                            size="sm"
                            name={
                              document?.owner?.firstName &&
                              document?.owner?.lastName
                                ? `${document.owner.firstName} ${document.owner.lastName}`
                                : "Unknown"
                            }
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {document?.owner?.firstName &&
                              document?.owner?.lastName
                                ? `${document.owner.firstName} ${document.owner.lastName}`
                                : "Unknown"}
                            </Text>
                            {document?.owner?.team && (
                              <Text fontSize="xs" color="gray.500">
                                {document.owner.team}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Link>
                    ) : (
                      <HStack mt={2}>
                        <Avatar
                          size="sm"
                          name={
                            document?.owner?.firstName &&
                            document?.owner?.lastName
                              ? `${document.owner.firstName} ${document.owner.lastName}`
                              : "Unknown"
                          }
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {document?.owner?.firstName &&
                            document?.owner?.lastName
                              ? `${document.owner.firstName} ${document.owner.lastName}`
                              : "Unknown"}
                          </Text>
                          {document?.owner?.team && (
                            <Text fontSize="xs" color="gray.500">
                              {document.owner.team}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    )}
                  </Box>

                  {document?.createdAt && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Created
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        <Timestamp date={document.createdAt} />
                      </Text>
                    </Box>
                  )}

                  {document?.updatedAt && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Last Modified
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        <Timestamp date={document.updatedAt} />
                      </Text>
                    </Box>
                  )}

                  {document?.type === "file" && document?.metadata?.size && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        File Size
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        {formatFileSize(document.metadata.size)}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Version Control & Approval Status Combined - Spans 4 columns, 2 rows */}
            <Card
              gridColumn={{ base: "1", lg: "9 / 13" }}
              gridRow={{ base: "auto", lg: "1 / 3" }}
            >
              <CardBody>
                <Text fontWeight="semibold" mb={4}>
                  Version Control
                </Text>
                <VStack spacing={3} align="stretch" mb={6}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={FiLock} color="gray.500" />
                      <Text fontSize="sm">Status</Text>
                    </HStack>
                    <Badge colorScheme="green">Available</Badge>
                  </HStack>
                  <Button
                    leftIcon={<FiUnlock />}
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    w="full"
                    onClick={() => {
                      // Pass full document object with ID from URL
                      console.log("Check Out document:", { ...document, id });
                    }}
                  >
                    Check Out
                  </Button>
                  <Button
                    leftIcon={<FiUpload />}
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    w="full"
                    isDisabled
                    onClick={() => {
                      // Pass full document object with ID from URL
                      console.log("Check In document:", { ...document, id });
                    }}
                  >
                    Check In
                  </Button>
                </VStack>

                <Divider mb={4} />

                <Text fontWeight="semibold" mb={4}>
                  Approval Status
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={FiClock} color="orange.500" />
                      <Text fontSize="sm">Awaiting review</Text>
                    </HStack>
                    <Badge colorScheme="yellow">Pending</Badge>
                  </HStack>
                  <Button
                    leftIcon={<FiCheckCircle />}
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    w="full"
                    onClick={() => {
                      // Pass full document object with ID from URL
                      console.log("Approve document:", { ...document, id });
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    leftIcon={<FiXCircle />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    w="full"
                    onClick={() => {
                      // Pass full document object with ID from URL
                      console.log("Reject document:", { ...document, id });
                    }}
                  >
                    Reject
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* File/Folder Specific Details */}
            {document?.type === "file" && (
              <Card gridColumn={{ base: "1", lg: "1 / 13" }}>
                <CardBody>
                  <Text fontWeight="semibold" mb={4}>
                    File Details
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    {document?.metadata?.filename ? (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Filename
                        </Text>
                        <Text fontSize="sm" wordBreak="break-all" mt={1}>
                          {document.metadata.filename}
                        </Text>
                      </Box>
                    ) : (
                      <Text fontSize="sm" color="red.500">
                        ⚠️ Missing filename metadata
                      </Text>
                    )}
                    {document?.metadata?.version && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Version
                        </Text>
                        <Text fontSize="sm" mt={1}>
                          {document.metadata.version}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {document?.type === "folder" && (
              <Card gridColumn={{ base: "1", lg: "1 / 13" }}>
                <CardBody>
                  <Text fontWeight="semibold" mb={4}>
                    Folder Settings
                  </Text>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Privacy Inheritance
                    </Text>
                    <Badge
                      colorScheme={
                        document?.metadata?.allowInheritance ? "green" : "gray"
                      }
                    >
                      {document?.metadata?.allowInheritance
                        ? "Enabled"
                        : "Disabled"}
                    </Badge>
                  </HStack>
                </CardBody>
              </Card>
            )}

            {document?.type === "auditSchedule" && (
              <Card gridColumn={{ base: "1", lg: "1 / 13" }}>
                <CardBody>
                  <Text fontWeight="semibold" mb={4}>
                    Audit Details
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    {document?.metadata?.code && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Code
                        </Text>
                        <Text fontSize="sm" mt={1}>
                          {document.metadata.code}
                        </Text>
                      </Box>
                    )}
                    {document?.metadata?.type && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Audit Type
                        </Text>
                        <Text fontSize="sm" mt={1}>
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
                    {document?.metadata?.standard && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Standard
                        </Text>
                        <Text fontSize="sm" mt={1}>
                          {document.metadata.standard}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {document?.type === "formTemplate" && (
              <Card gridColumn={{ base: "1", lg: "1 / 13" }}>
                <CardBody>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text fontWeight="semibold">
                      Form Questions (
                      {document?.metadata?.questions?.length || 0})
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      leftIcon={<FiEdit />}
                      onClick={() => navigate(`/edit-form/${document._id}`)}
                    >
                      Edit Form
                    </Button>
                  </Flex>
                  {document?.metadata?.questions &&
                  document.metadata.questions.length > 0 ? (
                    <VStack align="stretch" spacing={4}>
                      {document.metadata.questions.map((question, index) => (
                        <Box
                          key={question.id}
                          p={4}
                          borderWidth={1}
                          borderRadius="md"
                          borderColor="gray.200"
                          bg="gray.50"
                        >
                          <HStack justify="space-between" align="start" mb={2}>
                            <Text fontWeight="medium" flex={1}>
                              {index + 1}. {question.label}
                            </Text>
                            {question.required && (
                              <Badge colorScheme="red" size="sm">
                                Required
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Type: <strong>{question.type}</strong>
                          </Text>
                          {question.options && question.options.length > 0 && (
                            <Box mt={2}>
                              <Text fontSize="sm" color="gray.600" mb={1}>
                                Options:
                              </Text>
                              <VStack align="start" spacing={1} pl={4}>
                                {question.options.map((option, optIndex) => (
                                  <Text key={optIndex} fontSize="sm">
                                    • {option}
                                  </Text>
                                ))}
                              </VStack>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No questions have been added to this form template yet.
                    </Text>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Privacy & Permissions */}
            <Card gridColumn={{ base: "1", lg: "1 / 13" }}>
              <CardBody>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="semibold">Privacy & Permissions</Text>
                  <Button
                    leftIcon={<FiShare2 />}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={onPrivacyOpen}
                  >
                    Privacy Settings
                  </Button>
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Access Level
                    </Text>
                    <Badge
                      mt={2}
                      colorScheme={
                        document?.privacy?.users?.length === 0 &&
                        document?.privacy?.teams?.length === 0 &&
                        document?.privacy?.roles?.length === 0
                          ? "green"
                          : "orange"
                      }
                    >
                      {document?.privacy?.users?.length === 0 &&
                      document?.privacy?.teams?.length === 0 &&
                      document?.privacy?.roles?.length === 0
                        ? "Public"
                        : "Restricted"}
                    </Badge>
                  </Box>

                  {document?.privacy?.users?.length > 0 && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Shared with Users
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        {document.privacy.users.length} user(s)
                      </Text>
                    </Box>
                  )}

                  {document?.privacy?.teams?.length > 0 && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Shared with Teams
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        {document.privacy.teams.length} team(s)
                      </Text>
                    </Box>
                  )}

                  {document?.privacy?.roles?.length > 0 && (
                    <Box>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Shared with Roles
                      </Text>
                      <Text fontSize="sm" mt={2}>
                        {document.privacy.roles.length} role(s)
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Quick Actions in PageFooter */}
      <PageFooter>
        <HStack spacing={3} justify="flex-end" w="full">
          {document?.type === "file" && document?.metadata?.key && (
            <>
              <Tooltip label="Download this file">
                <Box>
                  <DownloadButton
                    document={document}
                    size="md"
                    isDisabled={!isValid}
                  />
                </Box>
              </Tooltip>
              <Box>
                <PreviewButton
                  document={{ ...document, id }}
                  size="md"
                  isDisabled={!isValid}
                />
              </Box>
            </>
          )}
          <Tooltip label="Share with others">
            <Button
              leftIcon={<FiShare2 />}
              size="md"
              colorScheme="gray"
              variant="outline"
              onClick={onPrivacyOpen}
            >
              Share
            </Button>
          </Tooltip>
        </HStack>
      </PageFooter>

      {/* Modals - All receive full document object with ID from URL */}
      <MoveDocumentModal
        isOpen={isMoveOpen}
        onClose={onMoveClose}
        document={{ ...document, id }}
      />
      <PrivacySettingsModal
        isOpen={isPrivacyOpen}
        onClose={onPrivacyClose}
        document={{ ...document, id }}
      />
      <DeleteDocumentModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        document={{ ...document, id }}
        onDelete={() => navigate("/documents")}
      />
    </>
  );
};

export default DocumentDetail;
