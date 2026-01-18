import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  VStack,
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
  FiAlertCircle,
} from "react-icons/fi";
import { useDocuments } from "../../context/DocumentsContext";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import EditDocumentModal from "../../components/Document/modals/EditDocumentModal";
import DeleteDocumentModal from "../../components/Document/modals/DeleteDocumentModal";
import MoveDocumentModal from "../../components/Document/modals/MoveDocumentModal";
import PrivacySettingsModal from "../../components/Document/modals/PrivacySettingsModal";
import Timestamp from "../../components/Timestamp";
import Breadcrumbs from "../../components/Document/Breadcrumbs";

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDocumentById, loading } = useDocuments();

  const [document, setDocument] = useState(null);
  const fetchedRef = useRef(false);
  const currentIdRef = useRef(null);

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

  // Fetch document using useRef to prevent duplicates
  useEffect(() => {
    const loadDocument = async () => {
      // Prevent duplicate requests
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
          // Document not found, redirect to documents root
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

    // Reset fetchedRef when id changes
    return () => {
      if (currentIdRef.current !== id) {
        fetchedRef.current = false;
      }
    };
  }, [id, fetchDocumentById, navigate]);

  // Get document icon
  const getDocumentIcon = () => {
    if (!document || typeof document !== "object") {
      return <FiAlertCircle size={64} color="#E53E3E" />;
    }

    switch (document?.type) {
      case "folder":
        return <FiFolder size={64} color="#3182CE" />;
      case "auditSchedule":
        return <FiCalendar size={64} color="#805AD5" />;
      case "file":
        if (!document?.metadata?.filename) {
          return (
            <FiAlertCircle
              size={64}
              color="#E53E3E"
              title="Broken file - missing metadata"
            />
          );
        }
        return <FiFile size={64} color="#718096" />;
      default:
        return (
          <FiAlertCircle
            size={64}
            color="#E53E3E"
            title="Unknown document type"
          />
        );
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
    if (document?.type === "file" && document?.metadata?.key) {
      const link = window.document.createElement("a");
      link.href = document.metadata.key;
      link.download =
        document?.metadata?.filename || document?.title || "download";
      link.click();
    }
  };

  const isDocumentValid = () => {
    if (!document || typeof document !== "object") return false;
    if (!document.type) return false;
    if (document.type === "file" && !document?.metadata?.filename) return false;
    return true;
  };

  const isValid = isDocumentValid();

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
                colorScheme="brandPrimary"
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
        <Heading variant="pageTitle">{document?.title || "Untitled"}</Heading>
      </PageHeader>
      <Box flex="1" bg="gray.50" p={8}>
        <Container maxW="container.md">
          <VStack spacing={6} align="stretch">
            {/* Breadcrumbs */}
            <Breadcrumbs document={document} />

            {/* Document Icon and Title Card */}
            <Card>
              <CardBody>
                <VStack spacing={4}>
                  {getDocumentIcon()}
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    textAlign="center"
                    color={isValid ? "inherit" : "red.500"}
                  >
                    {document?.title || "Untitled"}
                  </Text>
                  {!isValid && (
                    <Badge colorScheme="red" fontSize="sm">
                      Broken Document
                    </Badge>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Action Buttons Card */}
            <Card>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {document?.type === "file" && document?.metadata?.key && (
                    <Button
                      leftIcon={<FiDownload />}
                      colorScheme="brandPrimary"
                      onClick={handleDownload}
                      isDisabled={!isValid}
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
              </CardBody>
            </Card>

            {/* Document Information Card */}
            <Card>
              <CardBody>
                <Text fontWeight="semibold" mb={4} fontSize="lg">
                  Information
                </Text>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Type
                    </Text>
                    <Text fontSize="md">
                      {document?.type === "auditSchedule"
                        ? "Audit Schedule"
                        : document?.type
                          ? document.type.charAt(0).toUpperCase() +
                            document.type.slice(1)
                          : "Unknown"}
                    </Text>
                  </Box>

                  {document?.description && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Description
                        </Text>
                        <Text fontSize="md">{document.description}</Text>
                      </Box>
                    </>
                  )}

                  <Divider />
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Owner
                    </Text>
                    <Text fontSize="md">
                      {document?.owner?.firstName && document?.owner?.lastName
                        ? `${document.owner.firstName} ${document.owner.lastName}`
                        : "Unknown"}
                    </Text>
                    {document?.owner?.team && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        {document.owner.team}
                      </Text>
                    )}
                  </Box>

                  {document?.createdAt && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Created
                        </Text>
                        <Timestamp date={document.createdAt} fontSize="md" />
                      </Box>
                    </>
                  )}

                  {document?.updatedAt && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Modified
                        </Text>
                        <Timestamp date={document.updatedAt} fontSize="md" />
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* File-specific metadata */}
            {document?.type === "file" && (
              <Card>
                <CardBody>
                  <Text fontWeight="semibold" mb={4} fontSize="lg">
                    File Details
                  </Text>
                  <VStack align="stretch" spacing={4}>
                    {document?.metadata?.filename ? (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Filename
                        </Text>
                        <Text fontSize="md" wordBreak="break-all">
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

                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Size
                      </Text>
                      <Text fontSize="md">
                        {formatFileSize(document?.metadata?.size)}
                      </Text>
                    </Box>

                    {document?.metadata?.version && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Version
                          </Text>
                          <Text fontSize="md">{document.metadata.version}</Text>
                        </Box>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Folder-specific metadata */}
            {document?.type === "folder" && (
              <Card>
                <CardBody>
                  <Text fontWeight="semibold" mb={4} fontSize="lg">
                    Folder Settings
                  </Text>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Privacy Inheritance
                      </Text>
                      <Badge
                        colorScheme={
                          document?.metadata?.allowInheritance
                            ? "green"
                            : "gray"
                        }
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {document?.metadata?.allowInheritance
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Audit Schedule-specific metadata */}
            {document?.type === "auditSchedule" && (
              <Card>
                <CardBody>
                  <Text fontWeight="semibold" mb={4} fontSize="lg">
                    Audit Details
                  </Text>
                  <VStack align="stretch" spacing={4}>
                    {document?.metadata?.code && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Code
                        </Text>
                        <Text fontSize="md">{document.metadata.code}</Text>
                      </Box>
                    )}

                    {document?.metadata?.type && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Audit Type
                          </Text>
                          <Text fontSize="md">
                            {document.metadata.type
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </Text>
                        </Box>
                      </>
                    )}

                    {document?.metadata?.standard && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            Standard
                          </Text>
                          <Text fontSize="md">
                            {document.metadata.standard}
                          </Text>
                        </Box>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Privacy Settings Card */}
            <Card>
              <CardBody>
                <Text fontWeight="semibold" mb={4} fontSize="lg">
                  Privacy & Permissions
                </Text>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Access
                    </Text>
                    <Text fontSize="md">
                      {document?.privacy?.users?.length === 0 &&
                      document?.privacy?.teams?.length === 0 &&
                      document?.privacy?.roles?.length === 0
                        ? "Public"
                        : "Restricted"}
                    </Text>
                  </Box>

                  {document?.privacy?.users?.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Shared with Users
                        </Text>
                        <Text fontSize="md">
                          {document.privacy.users.length} user(s)
                        </Text>
                      </Box>
                    </>
                  )}

                  {document?.privacy?.teams?.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Shared with Teams
                        </Text>
                        <Text fontSize="md">
                          {document.privacy.teams.length} team(s)
                        </Text>
                      </Box>
                    </>
                  )}

                  {document?.privacy?.roles?.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Shared with Roles
                        </Text>
                        <Text fontSize="md">
                          {document.privacy.roles.length} role(s)
                        </Text>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
      <PageFooter />

      {/* Modals */}
      <EditDocumentModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        document={document}
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
      <DeleteDocumentModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        document={document}
        onDelete={() => navigate("/documents")}
      />
    </>
  );
};

export default DocumentDetail;
