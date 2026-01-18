import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Grid,
} from "@chakra-ui/react";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiStar,
  FiDownload,
  FiLogOut,
  FiLogIn,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import { useApp } from "../context/_useContext";
import CheckInModal from "../components/CheckInModal";
import DeleteDocumentModal from "../components/DeleteDocumentModal";
import Timestamp from "../components/Timestamp";

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    documents,
    toggleStar,
    starredDocuments,
    addRecentDocument,
    addRecentFolder,
    checkOutDocument,
    checkInDocument,
    deleteDocument,
    currentUser,
  } = useApp();

  const document = documents.find((d) => d.id === id);

  const canViewDocument = () => {
    if (!document) return false;
    if (currentUser?.userType === "Admin") {
      return true;
    }
    return document.department === currentUser?.department;
  };

  const canApproveDocument = () => {
    if (!document) return false;
    if (currentUser?.userType === "Admin") {
      return true;
    }
    if (
      currentUser?.userType !== "Supervisor" &&
      currentUser?.userType !== "Manager"
    ) {
      return false;
    }
    if (document.createdByUserType === "Supervisor") {
      return currentUser?.userType === "Manager";
    }
    return true;
  };

  if (!document) {
    return (
      <Box>
        <Text>Document not found</Text>
        <Button onClick={() => navigate("/documents")}>
          Back to Documents
        </Button>
      </Box>
    );
  }

  if (!canViewDocument()) {
    return (
      <Box>
        <Text>You do not have permission to view this document.</Text>
        <Button onClick={() => navigate("/documents")} mt={4}>
          Back to Documents
        </Button>
      </Box>
    );
  }

  React.useEffect(() => {
    if (document) {
      addRecentDocument(document.id, document.title, "documents");
      if (document.category) {
        addRecentFolder(document.category);
      } else {
        addRecentFolder("Uncategorized");
      }
    }
  }, [id, document, addRecentDocument, addRecentFolder]);

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

  const userHasCheckoutAccess = React.useMemo(() => {
    if (!document?.checkedOut) return true;
    if (!currentUser) return false;
    const checkedOutBy = document.checkedOutBy;
    if (typeof checkedOutBy === "string") {
      return checkedOutBy === currentUser.name;
    }
    return checkedOutBy?.id === currentUser.id;
  }, [document, currentUser]);

  const handleDownload = (fileUrl) => {
    const link = window.document.createElement("a");
    link.href = fileUrl;
    link.download = document.fileName || "document";
    link.click();
  };

  const handleView = (fileUrl) => {
    if (!fileUrl) {
      toast.error("File Not Available", {
        description: "This document does not have an accessible file.",
        duration: 3000,
      });
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleCheckOut = () => {
    checkOutDocument(document.id);
    toast.info("Document Checked Out", {
      description:
        "Document is now available for revision. You can download it to make changes.",
      duration: 3000,
    });
  };

  const handleCheckIn = () => {
    onOpen();
  };

  return (
    <Box>
      <HStack mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          onClick={() => navigate("/documents")}
          aria-label="Back"
        />
        <Heading flex={1}>{document.title}</Heading>
        <IconButton
          icon={<FiStar />}
          color={
            starredDocuments.includes(document.id) ? "yellow.500" : "gray.400"
          }
          onClick={() => toggleStar(document.id)}
          aria-label="Star document"
        />
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap={6} mb={6}>
        <Card>
          <CardHeader>
            <Heading size="sm">Document Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Document ID
                </Text>
                <Text fontWeight="semibold" color="blue.600">
                  {document.documentId || "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Status
                </Text>
                <Badge colorScheme={getStatusColor(document.status)} mt={1}>
                  {document.status}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Category
                </Text>
                <Text fontWeight="semibold">
                  {document.category || "Uncategorized"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">
                  Created
                </Text>
                <Timestamp date={document.createdAt} />
              </Box>
              {document.approvedAt && (
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Approved
                  </Text>
                  <Timestamp date={document.approvedAt} />
                </Box>
              )}
              {document.checkedOut && (
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Checked Out
                  </Text>
                  <Badge colorScheme="orange" mt={1}>
                    For Revision
                  </Badge>
                  {document.checkedOutAt && (
                    <Timestamp
                      date={document.checkedOutAt}
                      fontSize="xs"
                      color="gray.500"
                      display="block"
                      mt={1}
                    />
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Description</Heading>
          </CardHeader>
          <CardBody>
            <Text>{document.description || "No description provided"}</Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="sm">Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3}>
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                w="full"
                onClick={() => handleDownload(document.file)}
                isDisabled={!userHasCheckoutAccess}
              >
                {document.checkedOut
                  ? "Download for Revision"
                  : "Download Current Version"}
              </Button>
              <Button
                leftIcon={<FiEye />}
                variant="outline"
                colorScheme="blue"
                w="full"
                onClick={() => handleView(document.file)}
              >
                View Document
              </Button>
              {!document.checkedOut ? (
                <Button
                  leftIcon={<FiLogOut />}
                  variant="outline"
                  colorScheme="orange"
                  w="full"
                  onClick={handleCheckOut}
                  isDisabled={
                    document.status === "pending" ||
                    document.status === "rejected"
                  }
                >
                  Check Out for Revision
                </Button>
              ) : (
                <Button
                  leftIcon={<FiLogIn />}
                  colorScheme="green"
                  w="full"
                  onClick={handleCheckIn}
                >
                  Check In & Submit
                </Button>
              )}
              <Button
                leftIcon={<FiTrash2 />}
                variant="outline"
                colorScheme="red"
                w="full"
                onClick={onDeleteOpen}
                isDisabled={!userHasCheckoutAccess}
              >
                Archive Document
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <Heading size="md">Version History</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th>Uploaded</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {document.versions?.map((version) => (
                <Tr key={`${document.id}-v${version.version}`}>
                  <Td fontWeight="semibold">
                    {String(version.version).padStart(2, "0")}
                  </Td>
                  <Td>
                    <Timestamp date={version.uploadedAt} showTime={true} />
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      leftIcon={<FiDownload />}
                      onClick={() => handleDownload(version.file)}
                      isDisabled={!userHasCheckoutAccess}
                    >
                      Download
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {document.rejectionReason && (
        <Card mt={6} borderColor="red.200" borderWidth={2}>
          <CardHeader>
            <Heading size="sm" color="red.600">
              Rejection Reason
            </Heading>
          </CardHeader>
          <CardBody>
            <Text>{document.rejectionReason}</Text>
          </CardBody>
        </Card>
      )}

      <CheckInModal
        isOpen={isOpen}
        onClose={onClose}
        documentId={document.id}
      />

      <DeleteDocumentModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        documentId={document.id}
        documentTitle={document.title}
      />
    </Box>
  );
};

export default DocumentDetail;
