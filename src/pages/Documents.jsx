import { useState, useEffect } from "react";
import {
  Link as RouterLink,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  Text,
  IconButton,
  Input,
  Grid,
  Card,
  CardBody,
  Flex,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiFolder,
  FiFile,
  FiGrid,
  FiList,
  FiChevronRight,
  FiHome,
  FiCalendar,
  FiMoreVertical,
  FiAlertCircle,
} from "react-icons/fi";
import { useDocuments } from "../context/DocumentsContext";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import CreateFolderModal from "../components/CreateFolderModal";
import CreateAuditScheduleModal from "../components/CreateAuditScheduleModal";
import UploadFileModal from "../components/UploadFileModal";
import DocumentDrawer from "../components/DocumentDrawer";
import Timestamp from "../components/Timestamp";

const Documents = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    viewMode,
    currentFolderId,
    selectedDocument,
    getCurrentFolderDocuments,
    getBreadcrumbPath,
    navigateToFolder,
    toggleViewMode,
    setSelectedDocument,
    fetchDocumentById,
    loading,
  } = useDocuments();

  const [searchTerm, setSearchTerm] = useState("");
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickId, setLastClickId] = useState(null);

  // Determine if we're viewing a specific document or navigating folders
  const isDocumentView =
    location.pathname.match(/^\/documents\/[^/]+$/) &&
    !location.pathname.includes("/folders/");
  const isFolderView = location.pathname.includes("/folders/");

  // Update currentFolderId when URL changes for folder navigation
  useEffect(() => {
    if (isFolderView && id) {
      // Viewing a folder: /documents/folders/:id
      if (id !== currentFolderId) {
        navigateToFolder(id);
      }
    } else if (!isFolderView && !isDocumentView) {
      // Root view: /documents
      if (currentFolderId !== null) {
        navigateToFolder(null);
      }
    }
  }, [id, isFolderView, isDocumentView, currentFolderId, navigateToFolder]);

  // Fetch and display specific document if viewing /documents/:id
  useEffect(() => {
    if (isDocumentView && id) {
      fetchDocumentById(id).then((doc) => {
        if (doc) {
          setSelectedDocument(doc);
        }
      });
    }
  }, [isDocumentView, id, fetchDocumentById, setSelectedDocument]);

  const {
    isOpen: isFolderModalOpen,
    onOpen: onFolderModalOpen,
    onClose: onFolderModalClose,
  } = useDisclosure();

  const {
    isOpen: isAuditModalOpen,
    onOpen: onAuditModalOpen,
    onClose: onAuditModalClose,
  } = useDisclosure();

  const {
    isOpen: isFileModalOpen,
    onOpen: onFileModalOpen,
    onClose: onFileModalClose,
  } = useDisclosure();

  const folderDocuments = getCurrentFolderDocuments();
  const breadcrumbs = getBreadcrumbPath();

  // Filter documents by search term
  const filteredDocuments = folderDocuments.filter((doc) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower)
    );
  });

  // Handle document click (single or double)
  const handleDocumentClick = (doc) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    // Double click detection (within 300ms)
    if (lastClickId === doc.id && timeDiff < 300) {
      // Double click - navigate to proper route
      if (doc.type === "folder" || doc.type === "auditSchedule") {
        // Navigate to folder view: /documents/folders/:id
        navigate(`/documents/folders/${doc.id}`);
      } else if (doc.type === "file") {
        // Navigate to document view: /documents/:id
        navigate(`/documents/${doc.id}`);
      }
      setLastClickTime(0);
      setLastClickId(null);
    } else {
      // Single click - show drawer
      setSelectedDocument(doc);
      setLastClickTime(now);
      setLastClickId(doc.id);
    }
  };

  // Get icon based on document type with validation
  const getDocumentIcon = (doc) => {
    // Validate document structure
    if (!doc || typeof doc !== 'object') {
      return <FiAlertCircle size={24} color="#E53E3E" />;
    }

    const type = doc?.type;
    
    switch (type) {
      case "folder":
        return <FiFolder size={24} color="#3182CE" />;
      case "auditSchedule":
        return <FiCalendar size={24} color="#805AD5" />;
      case "file":
        // Check if file has valid metadata
        if (!doc?.metadata?.filename) {
          return <FiAlertCircle size={24} color="#E53E3E" title="Broken file - missing metadata" />;
        }
        return <FiFile size={24} color="#718096" />;
      default:
        return <FiAlertCircle size={24} color="#E53E3E" title="Unknown document type" />;
    }
  };

  // Check if document is valid and can be displayed
  const isDocumentValid = (doc) => {
    if (!doc || typeof doc !== 'object') return false;
    if (!doc.type) return false;
    if (doc.type === 'file' && !doc?.metadata?.filename) return false;
    return true;
  };

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <Heading variant="pageTitle">Documents</Heading>
          <HStack>
            <IconButton
              icon={viewMode === "grid" ? <FiList /> : <FiGrid />}
              onClick={toggleViewMode}
              aria-label="Toggle view"
              variant="ghost"
            />
          </HStack>
        </Flex>
      </PageHeader>

      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onFileModalOpen}
          >
            Upload File
          </Button>
          <Button
            leftIcon={<FiFolder />}
            variant="outline"
            colorScheme="blue"
            onClick={onFolderModalOpen}
          >
            New Folder
          </Button>
          <Button
            leftIcon={<FiCalendar />}
            variant="outline"
            colorScheme="purple"
            onClick={onAuditModalOpen}
          >
            New Audit Schedule
          </Button>
        </Flex>
      </PageFooter>

      {/* Breadcrumb Navigation */}
      <Box mb={4}>
        <Breadcrumb
          spacing="8px"
          separator={<FiChevronRight color="gray.500" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigateToFolder(null)}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <FiHome />
              <Text>All Documents</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((folder) => (
            <BreadcrumbItem key={folder.id}>
              <BreadcrumbLink onClick={() => navigateToFolder(folder.id)}>
                {folder.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </Box>

      {/* Search Bar */}
      <Box mb={6}>
        <Box position="relative" maxW="600px">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pl={10}
            size="lg"
            id="search"
            name="search"
          />
          <Box
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
          >
            <FiSearch />
          </Box>
        </Box>
      </Box>

      {/* Documents Grid/List View */}
      <Box>
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : filteredDocuments.length === 0 ? (
          <VStack spacing={4} py={12}>
            <Text color="gray.500" fontSize="lg">
              {searchTerm
                ? "No documents found"
                : currentFolderId
                  ? "This folder is empty"
                  : "No Documents"}
            </Text>
            <HStack>
              <Button size="sm" colorScheme="blue" onClick={onFileModalOpen}>
                Upload File
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={onFolderModalOpen}
              >
                Create Folder
              </Button>
            </HStack>
          </VStack>
        ) : viewMode === "grid" ? (
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
            {filteredDocuments.map((doc) => {
              const isFolderType =
                doc?.type === "folder" || doc?.type === "auditSchedule";
              const CardWrapper = isFolderType ? Link : Box;
              const linkProps = isFolderType
                ? {
                    as: RouterLink,
                    to: `/documents/folders/${doc?.id}`,
                    style: { textDecoration: "none" },
                    onClick: (e) => {
                      e.preventDefault();
                      handleDocumentClick(doc);
                    },
                  }
                : {
                    onClick: () => handleDocumentClick(doc),
                  };

              const isValid = isDocumentValid(doc);
              const isSelected = selectedDocument?.id === doc?.id;

              return (
                <CardWrapper key={doc?.id || Math.random()} {...linkProps}>
                  <Card
                    variant={isSelected ? "documentSelected" : "document"}
                    cursor="pointer"
                    opacity={isValid ? 1 : 0.6}
                  >
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          {getDocumentIcon(doc)}
                          <IconButton
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                            aria-label="More options"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setSelectedDocument(doc);
                            }}
                          />
                        </HStack>
                        <Text
                          fontWeight="semibold"
                          isTruncated
                          maxW="full"
                          title={doc?.title || "Untitled"}
                          color={isValid ? "inherit" : "red.500"}
                        >
                          {doc?.title || "Untitled"}
                        </Text>
                        {doc?.type === "file" && doc?.metadata?.filename && (
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            isTruncated
                            maxW="full"
                          >
                            {doc.metadata.filename}
                          </Text>
                        )}
                        {doc?.type === "file" && !doc?.metadata?.filename && (
                          <Text
                            fontSize="xs"
                            color="red.500"
                            isTruncated
                            maxW="full"
                          >
                            Broken file - missing metadata
                          </Text>
                        )}
                        {doc?.updatedAt && (
                          <Timestamp
                            date={doc.updatedAt}
                            fontSize="xs"
                            color="gray.400"
                          />
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </CardWrapper>
              );
            })}
          </Grid>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Owner</Th>
                <Th>Modified</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredDocuments.map((doc) => {
                const isFolderType =
                  doc?.type === "folder" || doc?.type === "auditSchedule";
                const RowWrapper = isFolderType ? "a" : "tr";
                const rowProps = isFolderType
                  ? {
                      href: `/documents/folders/${doc?.id}`,
                      onClick: (e) => {
                        e.preventDefault();
                        handleDocumentClick(doc);
                      },
                      style: { display: "table-row" },
                    }
                  : {};

                const isValid = isDocumentValid(doc);

                return (
                  <Tr
                    as={RowWrapper}
                    {...rowProps}
                    key={doc?.id || Math.random()}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    bg={
                      selectedDocument?.id === doc?.id
                        ? "blue.50"
                        : "transparent"
                    }
                    opacity={isValid ? 1 : 0.6}
                  >
                    <Td>
                      <HStack>
                        {getDocumentIcon(doc)}
                        <VStack align="start" spacing={0}>
                          <HStack spacing={2}>
                            <Text 
                              fontWeight="semibold"
                              color={isValid ? "inherit" : "red.500"}
                            >
                              {doc?.title || "Untitled"}
                            </Text>
                            {!isValid && (
                              <Text fontSize="xs" color="red.500">
                                (Broken)
                              </Text>
                            )}
                          </HStack>
                          {doc?.type === "file" && doc?.metadata?.filename && (
                            <Text fontSize="xs" color="gray.500">
                              {doc.metadata.filename}
                            </Text>
                          )}
                          {doc?.type === "file" && !doc?.metadata?.filename && (
                            <Text fontSize="xs" color="red.500">
                              Missing metadata
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {doc?.type === "auditSchedule"
                          ? "Audit Schedule"
                          : doc?.type
                          ? doc.type.charAt(0).toUpperCase() +
                            doc.type.slice(1)
                          : "Unknown"}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {doc?.owner?.firstName && doc?.owner?.lastName
                          ? `${doc.owner.firstName} ${doc.owner.lastName}`
                          : "Unknown"}
                      </Text>
                    </Td>
                    <Td>
                      {doc?.updatedAt ? (
                        <Timestamp date={doc.updatedAt} />
                      ) : (
                        <Text fontSize="sm" color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FiMoreVertical />}
                        size="sm"
                        variant="ghost"
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedDocument(doc);
                        }}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={onFolderModalClose}
        parentId={currentFolderId}
      />
      <CreateAuditScheduleModal
        isOpen={isAuditModalOpen}
        onClose={onAuditModalClose}
        parentId={currentFolderId}
      />
      <UploadFileModal
        isOpen={isFileModalOpen}
        onClose={onFileModalClose}
        parentId={currentFolderId}
      />

      {/* Document Drawer */}
      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </Box>
  );
};

export default Documents;
