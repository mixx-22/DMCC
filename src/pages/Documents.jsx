import { useState } from "react";
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
  Badge,
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
  const {
    viewMode,
    currentFolderId,
    selectedDocument,
    getCurrentFolderDocuments,
    getBreadcrumbPath,
    navigateToFolder,
    toggleViewMode,
    setSelectedDocument,
  } = useDocuments();

  const [searchTerm, setSearchTerm] = useState("");
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickId, setLastClickId] = useState(null);

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
      // Double click - open file or folder
      if (doc.type === "folder" || doc.type === "auditSchedule") {
        navigateToFolder(doc.id);
      } else if (doc.type === "file") {
        // Open file (would typically open in new tab or viewer)
        window.open(doc.metadata.key || "#", "_blank");
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

  // Get icon based on document type
  const getDocumentIcon = (type) => {
    switch (type) {
      case "folder":
        return <FiFolder size={24} color="#3182CE" />;
      case "auditSchedule":
        return <FiCalendar size={24} color="#805AD5" />;
      case "file":
      default:
        return <FiFile size={24} color="#718096" />;
    }
  };

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
      <Badge colorScheme={statusInfo.color} size="sm">
        {statusInfo.label}
      </Badge>
    );
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
              <Text>Root</Text>
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
        {filteredDocuments.length === 0 ? (
          <VStack spacing={4} py={12}>
            <Text color="gray.500" fontSize="lg">
              {searchTerm
                ? "No documents found"
                : "This folder is empty"}
            </Text>
            <HStack>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onFileModalOpen}
              >
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
          <Grid
            templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
            gap={4}
          >
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                cursor="pointer"
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                onClick={() => handleDocumentClick(doc)}
                bg={selectedDocument?.id === doc.id ? "blue.50" : "white"}
                borderWidth={selectedDocument?.id === doc.id ? 2 : 1}
                borderColor={
                  selectedDocument?.id === doc.id ? "blue.500" : "gray.200"
                }
              >
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      {getDocumentIcon(doc.type)}
                      <IconButton
                        icon={<FiMoreVertical />}
                        size="sm"
                        variant="ghost"
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                        }}
                      />
                    </HStack>
                    <Text
                      fontWeight="semibold"
                      isTruncated
                      maxW="full"
                      title={doc.title}
                    >
                      {doc.title || "Untitled"}
                    </Text>
                    {doc.type === "file" && doc.metadata.filename && (
                      <Text fontSize="xs" color="gray.500" isTruncated maxW="full">
                        {doc.metadata.filename}
                      </Text>
                    )}
                    {getStatusBadge(doc.status)}
                    <Timestamp
                      date={doc.updatedAt}
                      fontSize="xs"
                      color="gray.400"
                    />
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        ) : (
          <Box bg="white" borderRadius="md" overflow="hidden">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Owner</Th>
                  <Th>Modified</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredDocuments.map((doc) => (
                  <Tr
                    key={doc.id}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleDocumentClick(doc)}
                    bg={selectedDocument?.id === doc.id ? "blue.50" : "white"}
                  >
                    <Td>
                      <HStack>
                        {getDocumentIcon(doc.type)}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold">
                            {doc.title || "Untitled"}
                          </Text>
                          {doc.type === "file" && doc.metadata.filename && (
                            <Text fontSize="xs" color="gray.500">
                              {doc.metadata.filename}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge>
                        {doc.type === "auditSchedule"
                          ? "Audit Schedule"
                          : doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                      </Badge>
                    </Td>
                    <Td>{getStatusBadge(doc.status)}</Td>
                    <Td>
                      <Text fontSize="sm">
                        {doc.owner.firstName} {doc.owner.lastName}
                      </Text>
                    </Td>
                    <Td>
                      <Timestamp date={doc.updatedAt} />
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FiMoreVertical />}
                        size="sm"
                        variant="ghost"
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                        }}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
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
