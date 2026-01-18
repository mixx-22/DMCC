import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  FiMoreVertical,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUpload,
  FiEye,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import EditDocumentModal from "../../components/Document/modals/EditDocumentModal";
import DeleteDocumentModal from "../../components/Document/modals/DeleteDocumentModal";
import MoveDocumentModal from "../../components/Document/modals/MoveDocumentModal";
import PrivacySettingsModal from "../../components/Document/modals/PrivacySettingsModal";
import Timestamp from "../../components/Timestamp";
import Breadcrumbs from "../../components/Document/Breadcrumbs";
import { useDocuments } from "../../context/_useContext";

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

  const getDocumentIcon = (size = 48) => {
    if (!document || typeof document !== "object") {
      return <Icon as={FiAlertCircle} boxSize={size} color="red.500" />;
    }

    switch (document?.type) {
      case "folder":
        return <Icon as={FiFolder} boxSize={size} color="blue.500" />;
      case "auditSchedule":
        return <Icon as={FiCalendar} boxSize={size} color="purple.500" />;
      case "file":
        if (!document?.metadata?.filename) {
          return <Icon as={FiAlertCircle} boxSize={size} color="red.500" />;
        }
        return <Icon as={FiFile} boxSize={size} color="gray.500" />;
      default:
        return <Icon as={FiAlertCircle} boxSize={size} color="red.500" />;
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
              <Button colorScheme="blue" onClick={() => navigate("/documents")} mt={4}>
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
        <Breadcrumbs data={document} />
      </PageHeader>
      <Box flex="1" bg="gray.50" p={{ base: 4, md: 8 }}>
        <Container maxW="container.xl">
          {/* Bento Grid Layout */}
          <SimpleGrid
            columns={{ base: 1, lg: 12 }}
            gap={6}
            autoRows="minmax(120px, auto)"
          >
            {/* Main Document Info - Spans 8 columns, 2 rows */}
            <Card gridColumn={{ base: "1", lg: "1 / 9" }} gridRow={{ base: "auto", lg: "1 / 3" }}>
              <CardBody>
                <Flex justify="space-between" align="start" mb={4}>
                  <HStack spacing={4} flex="1">
                    {getDocumentIcon(56)}
                    <VStack align="start" spacing={1} flex="1">
                      <Heading
                        size="lg"
                        color={isValid ? "inherit" : "red.500"}
                        wordBreak="break-word"
                      >
                        {document?.title || "Untitled"}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme={document?.type === "folder" ? "blue" : document?.type === "auditSchedule" ? "purple" : "gray"}>
                          {document?.type === "auditSchedule"
                            ? "Audit Schedule"
                            : document?.type
                              ? document.type.charAt(0).toUpperCase() + document.type.slice(1)
                              : "Unknown"}
                        </Badge>
                        {!isValid && (
                          <Badge colorScheme="red">Broken</Badge>
                        )}
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
                      <MenuItem icon={<FiEdit />} onClick={onEditOpen}>
                        Edit Details
                      </MenuItem>
                      <MenuItem icon={<FiMove />} onClick={onMoveOpen}>
                        Move
                      </MenuItem>
                      <MenuItem icon={<FiShare2 />} onClick={onPrivacyOpen}>
                        Privacy Settings
                      </MenuItem>
                      <Divider />
                      <MenuItem icon={<FiTrash2 />} color="red.500" onClick={onDeleteOpen}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>

                {document?.description && (
                  <>
                    <Divider mb={4} />
                    <Text color="gray.700" fontSize="md" mb={4}>
                      {document.description}
                    </Text>
                  </>
                )}

                <Divider mb={4} />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Owner
                    </Text>
                    <HStack mt={2}>
                      <Avatar
                        size="sm"
                        name={
                          document?.owner?.firstName && document?.owner?.lastName
                            ? `${document.owner.firstName} ${document.owner.lastName}`
                            : "Unknown"
                        }
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {document?.owner?.firstName && document?.owner?.lastName
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
            <Card gridColumn={{ base: "1", lg: "9 / 13" }} gridRow={{ base: "auto", lg: "1 / 3" }}>
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
                      {document?.metadata?.allowInheritance ? "Enabled" : "Disabled"}
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
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

            {/* Privacy & Permissions */}
            <Card gridColumn={{ base: "1", lg: "1 / 13" }}>
              <CardBody>
                <Text fontWeight="semibold" mb={4}>
                  Privacy & Permissions
                </Text>
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
            <Tooltip label="Download this file">
              <Button
                leftIcon={<FiDownload />}
                size="md"
                colorScheme="blue"
                onClick={handleDownload}
                isDisabled={!isValid}
              >
                Download
              </Button>
            </Tooltip>
          )}
          <Tooltip label="Preview document">
            <Button
              leftIcon={<FiEye />}
              size="md"
              colorScheme="gray"
              variant="outline"
            >
              Preview
            </Button>
          </Tooltip>
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
      <EditDocumentModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        document={{ ...document, id }}
      />
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
