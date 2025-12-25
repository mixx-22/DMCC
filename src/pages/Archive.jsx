import React from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  HStack,
  useToast,
  useDisclosure,
  Badge,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  Input,
} from "@chakra-ui/react";
import { FiDownload, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import ArchiveDeleteConfirmModal from "../components/ArchiveDeleteConfirmModal";
import ArchiveRestoreConfirmModal from "../components/ArchiveRestoreConfirmModal";

const Archive = () => {
  const {
    archivedDocuments,
    restoreDocument,
    deleteArchivedDocument,
    currentUser,
  } = useApp();
  const toast = useToast();
  const [selectedDocId, setSelectedDocId] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isRestoreOpen,
    onOpen: onRestoreOpen,
    onClose: onRestoreClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteAllOpen,
    onOpen: onDeleteAllOpen,
    onClose: onDeleteAllClose,
  } = useDisclosure();
  const [deleteAllConfirm, setDeleteAllConfirm] = React.useState("");

  const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

  const handleView = (fileUrl) => {
    if (!fileUrl) {
      toast({
        title: "File Not Available",
        description: "No file for this document",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleRestoreClick = (id) => {
    setSelectedDocId(id);
    onRestoreOpen();
  };

  const handleConfirmRestore = () => {
    if (selectedDocId) {
      setIsRestoring(true);
      restoreDocument(selectedDocId);
      toast({
        title: "Restored",
        description: "Document restored to Documents",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsRestoring(false);
      setSelectedDocId(null);
      onRestoreClose();
    }
  };

  const calculateDaysLeft = (archivedAt) => {
    if (!archivedAt) return null;
    const archiveDate = new Date(archivedAt).getTime();
    const now = new Date().getTime();
    const daysLeft = Math.ceil(
      (TWO_YEARS_MS - (now - archiveDate)) / (24 * 60 * 60 * 1000)
    );
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getObsoleteStatus = (daysLeft) => {
    if (daysLeft === 0) return "obsolete";
    if (daysLeft <= 30) return "expiring";
    return "active";
  };

  const handleDeleteClick = (id, title) => {
    setSelectedDocId(id);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    if (selectedDocId) {
      setIsDeleting(true);
      deleteArchivedDocument(selectedDocId);
      toast({
        title: "Deleted Permanently",
        description: "Document removed from archive",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setIsDeleting(false);
      setSelectedDocId(null);
      onDeleteClose();
    }
  };

  const handleDeleteAll = () => {
    if (deleteAllConfirm === "DELETE ALL DOCUMENTS") {
      visibleArchived.forEach((doc) => {
        deleteArchivedDocument(doc.id);
      });
      toast({
        title: "All documents deleted",
        description: "All archived documents have been permanently deleted",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setDeleteAllConfirm("");
      onDeleteAllClose();
    }
  };

  const visibleArchived = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.userType === "Admin") return archivedDocuments || [];
    return (archivedDocuments || []).filter(
      (doc) => doc.department === currentUser.department
    );
  }, [archivedDocuments, currentUser]);

  React.useEffect(() => {
    visibleArchived.forEach((doc) => {
      const daysLeft = calculateDaysLeft(doc.archivedAt);
      if (daysLeft === 0) {
        deleteArchivedDocument(doc.id);
      }
    });
  }, [visibleArchived]);

  const expiringDocuments = React.useMemo(() => {
    const TWO_MONTHS_DAYS = 60;
    return visibleArchived.filter((doc) => {
      const daysLeft = calculateDaysLeft(doc.archivedAt);
      return daysLeft > 0 && daysLeft <= TWO_MONTHS_DAYS;
    });
  }, [visibleArchived]);

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Archive</Heading>
        {visibleArchived.length > 0 && (
          <Button
            leftIcon={<FiTrash2 />}
            colorScheme="red"
            variant="outline"
            onClick={onDeleteAllOpen}
          >
            Delete All
          </Button>
        )}
      </HStack>

      {expiringDocuments.length > 0 && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" mb={2}>
              ⚠️ {expiringDocuments.length} document(s) will be deleted within 2
              months
            </Text>
            <VStack align="start" spacing={1} ml={2}>
              {expiringDocuments.map((doc) => {
                const daysLeft = calculateDaysLeft(doc.archivedAt);
                return (
                  <Text key={`expiring-${doc.id}`} fontSize="sm">
                    • <strong>{doc.title}</strong> - {daysLeft} days remaining
                  </Text>
                );
              })}
            </VStack>
          </Box>
        </Alert>
      )}

      {visibleArchived.length === 0 ? (
        <Text>No archived documents</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Owner</Th>
              <Th>Last Modified By</Th>
              <Th>Archived At</Th>
              <Th>Days Left</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {visibleArchived.map((doc) => {
              const daysLeft = calculateDaysLeft(doc.archivedAt);
              const status = getObsoleteStatus(daysLeft);
              return (
                <Tr key={`archived-${doc.id}`}>
                  <Td fontWeight="semibold">{doc.title}</Td>
                  <Td>{doc.createdByName || doc.createdBy || "Unknown"}</Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text>
                        {doc.lastModifiedBy ||
                          doc.createdByName ||
                          doc.createdBy ||
                          "Unknown"}
                      </Text>
                      {doc.lastModifiedAt && (
                        <Text fontSize="xs" color="gray.500">
                          {new Date(doc.lastModifiedAt).toLocaleString()}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    {doc.archivedAt
                      ? new Date(doc.archivedAt).toLocaleString()
                      : "-"}
                  </Td>
                  <Td>
                    {daysLeft === 0 ? (
                      <Badge colorScheme="red">Obsolete</Badge>
                    ) : daysLeft <= 30 ? (
                      <Badge colorScheme="orange">{daysLeft} days</Badge>
                    ) : (
                      <Text>{daysLeft} days</Text>
                    )}
                  </Td>
                  <Td>
                    <HStack>
                      <Button
                        size="sm"
                        leftIcon={<FiDownload />}
                        onClick={() => handleView(doc.file)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<FiRefreshCw />}
                        colorScheme="green"
                        onClick={() => handleRestoreClick(doc.id)}
                      >
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<FiTrash2 />}
                        colorScheme="red"
                        onClick={() => handleDeleteClick(doc.id, doc.title)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}

      <ArchiveDeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        documentTitle={
          visibleArchived.find((d) => d.id === selectedDocId)?.title || ""
        }
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <ArchiveRestoreConfirmModal
        isOpen={isRestoreOpen}
        onClose={onRestoreClose}
        documentTitle={
          visibleArchived.find((d) => d.id === selectedDocId)?.title || ""
        }
        onConfirm={handleConfirmRestore}
        isRestoring={isRestoring}
      />

      <Modal isOpen={isDeleteAllOpen} onClose={onDeleteAllClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.600">
            Delete All Archived Documents
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error">
                <AlertIcon />
                This will permanently delete all {visibleArchived.length}{" "}
                archived document(s). This action cannot be undone.
              </Alert>
              <Text>
                Type <strong>DELETE ALL DOCUMENTS</strong> to confirm:
              </Text>
              <Input
                value={deleteAllConfirm}
                onChange={(e) => setDeleteAllConfirm(e.target.value)}
                placeholder="Type DELETE ALL DOCUMENTS"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteAllClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteAll}
              isDisabled={deleteAllConfirm !== "DELETE ALL DOCUMENTS"}
            >
              Delete All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Archive;
