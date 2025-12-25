import { useState, useRef } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  HStack,
  Input,
  Select,
  VStack,
  Text,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiStar,
  FiSearch,
  FiFolder,
  FiFileText,
  FiCheck,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import DocumentUploadModal from "../components/DocumentUploadModal";
import { formatDistanceToNow } from "date-fns";

const Documents = () => {
  const {
    documents,
    toggleStar,
    starredDocuments,
    recentDocuments,
    recentFolders,
    addRecentFolder,
    approveDocument,
    rejectDocument,
    currentUser,
  } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isRejectOpen,
    onOpen: onRejectOpen,
    onClose: onRejectClose,
  } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const canViewDocument = (doc) => {
    if (currentUser?.userType === "Admin") {
      return true;
    }
    return doc.department === currentUser?.department;
  };

  const visibleDocuments = documents.filter(canViewDocument);

  const folders = [
    ...new Set(visibleDocuments.map((doc) => doc.category || "Uncategorized")),
  ];

  const recentDocItems = recentDocuments
    .filter((doc) => doc.type === "documents")
    .filter((recentDoc) => {
      const doc = documents.find((d) => d.id === recentDoc.id);
      return doc ? canViewDocument(doc) : false;
    });

  const recentFolderItems = recentFolders
    .map((folder) => ({
      ...folder,
      count: visibleDocuments.filter(
        (doc) => (doc.category || "Uncategorized") === folder.name
      ).length,
    }))
    .filter((folder) => folder.count > 0);

  const canApproveDocument = (doc) => {
    if (currentUser?.userType === "Admin") {
      return true;
    }
    if (
      currentUser?.userType !== "Supervisor" &&
      currentUser?.userType !== "Manager"
    ) {
      return false;
    }
    if (doc.createdByUserType === "Supervisor") {
      return currentUser?.userType === "Manager";
    }
    return true;
  };

  const filteredDocuments = documents.filter((doc) => {
    if (!canViewDocument(doc)) {
      return false;
    }
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesFolder =
      folderFilter === "all" ||
      (doc.category || "Uncategorized") === folderFilter;
    return matchesSearch && matchesStatus && matchesFolder;
  });

  const handleFolderClick = (folderName) => {
    setFolderFilter(folderName);
    addRecentFolder(folderName);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "pending":
        return "yellow";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  const pendingDocuments = documents.filter((doc) => {
    return (
      doc.status === "pending" &&
      canViewDocument(doc) &&
      canApproveDocument(doc)
    );
  });

  const handleApprove = (docId) => {
    approveDocument(docId);
    toast({
      title: "Document Approved",
      description: "Document has been approved and posted",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRejectClick = (doc) => {
    setSelectedDoc(doc);
    setRejectionReason("");
    onRejectOpen();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    rejectDocument(selectedDoc.id, rejectionReason);
    toast({
      title: "Document Rejected",
      description: "Document has been rejected",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    onRejectClose();
    setSelectedDoc(null);
    setRejectionReason("");
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Documents</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
          Upload New Document
        </Button>
      </Flex>

      {/* Search Bar */}
      <Box mb={6}>
        <HStack spacing={4}>
          <Box position="relative" flex={1}>
            <Input
              placeholder="Search by Document ID, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pl={10}
              size="lg"
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
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            w="200px"
            size="lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            w="200px"
            size="lg"
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </Select>
        </HStack>
      </Box>

      {/* Recent Opened Folders */}
      {recentFolderItems.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={4}>
            Recent Opened Folders
          </Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
            {recentFolderItems.slice(0, 6).map((folder, index) => (
              <Card
                key={index}
                cursor="pointer"
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                onClick={() => handleFolderClick(folder.name)}
              >
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <FiFolder size={24} color="#3182CE" />
                      <Text fontWeight="semibold" isTruncated maxW="150px">
                        {folder.name}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {folder.count} document{folder.count !== 1 ? "s" : ""}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {formatDistanceToNow(new Date(folder.openedAt), {
                        addSuffix: true,
                      })}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recent Opened Documents */}
      {recentDocItems.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={4}>
            Recent Opened Documents
          </Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
            {recentDocItems.slice(0, 6).map((recentDoc) => {
              const doc = documents.find((d) => d.id === recentDoc.id);
              if (!doc) return null;
              return (
                <Card
                  key={`recent-doc-${recentDoc.id}`}
                  cursor="pointer"
                  _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  onClick={() => navigate(`/documents/${recentDoc.id}`)}
                >
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <FiFileText size={20} color="#3182CE" />
                          <Text fontWeight="semibold" isTruncated maxW="200px">
                            {recentDoc.name}
                          </Text>
                        </HStack>
                        <IconButton
                          icon={<FiStar />}
                          size="sm"
                          variant="ghost"
                          color={
                            starredDocuments.includes(recentDoc.id)
                              ? "yellow.500"
                              : "gray.400"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(recentDoc.id);
                          }}
                          aria-label="Star document"
                        />
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {doc.category || "Uncategorized"}
                      </Text>
                      <Badge
                        colorScheme={
                          doc.status === "approved"
                            ? "green"
                            : doc.status === "pending"
                            ? "yellow"
                            : "red"
                        }
                      >
                        {doc.status}
                      </Badge>
                      <Text fontSize="xs" color="gray.400">
                        {formatDistanceToNow(new Date(recentDoc.openedAt), {
                          addSuffix: true,
                        })}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Pending Approvals Section */}
      {pendingDocuments.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={4} color="orange.600">
            <HStack>
              <FiCheckCircle />
              <Text>Pending Approvals ({pendingDocuments.length})</Text>
            </HStack>
          </Heading>
          <Box
            bg="white"
            borderRadius="md"
            overflow="hidden"
            border="2px"
            borderColor="orange.200"
          >
            <Table variant="simple">
              <Thead bg="orange.50">
                <Tr>
                  <Th>Document ID</Th>
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Type</Th>
                  <Th>Version</Th>
                  <Th>Uploaded</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pendingDocuments.map((doc) => (
                  <Tr
                    key={`pending-${doc.id}`}
                    cursor="pointer"
                    _hover={{ bg: "orange.50" }}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <Td fontWeight="semibold" color="blue.600">
                      {doc.documentId || "N/A"}
                    </Td>
                    <Td fontWeight="semibold">{doc.title}</Td>
                    <Td>{doc.category || "Uncategorized"}</Td>
                    <Td>
                      <Badge colorScheme={doc.isNew ? "blue" : "purple"}>
                        {doc.isNew ? "New Document" : "Revised Document"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">
                        {String(doc.versions?.length || 1).padStart(2, "0")}
                      </Badge>
                    </Td>
                    <Td>{new Date(doc.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      {canApproveDocument(doc) ? (
                        <HStack
                          spacing={2}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<FiCheck />}
                            onClick={() => handleApprove(doc.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            leftIcon={<FiX />}
                            onClick={() => handleRejectClick(doc)}
                          >
                            Reject
                          </Button>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          No permission
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Full List of Documents */}
      <Box>
        <Heading size="md" mb={4}>
          All Documents
        </Heading>

        <Box bg="white" borderRadius="md" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Document ID</Th>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Versions</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredDocuments.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <VStack>
                      <Text color="gray.500">No documents found</Text>
                      <Button size="sm" colorScheme="blue" onClick={onOpen}>
                        Upload Your First Document
                      </Button>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <Tr
                    key={`doc-${doc.id}`}
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <Td fontWeight="semibold" color="blue.600">
                      {doc.documentId || "N/A"}
                    </Td>
                    <Td fontWeight="semibold">{doc.title}</Td>
                    <Td>{doc.category || "Uncategorized"}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </Td>
                    <Td>{doc.versions?.length || 1}</Td>
                    <Td>{new Date(doc.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <IconButton
                        icon={<FiStar />}
                        size="sm"
                        variant="ghost"
                        color={
                          starredDocuments.includes(doc.id)
                            ? "yellow.500"
                            : "gray.400"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(doc.id);
                        }}
                        aria-label="Star document"
                      />
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <DocumentUploadModal isOpen={isOpen} onClose={onClose} />

      {/* Reject Document Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Are you sure you want to reject{" "}
                <strong>{selectedDoc?.title}</strong>?
              </Text>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRejectClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleReject}>
              Reject Document
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Documents;
