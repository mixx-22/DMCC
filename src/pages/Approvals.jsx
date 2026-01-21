import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Button,
  Text,
  VStack,
  Card,
  CardBody,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { FiCheck, FiX } from "react-icons/fi";
import { useApp } from "../context/_useContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Timestamp from "../components/Timestamp";

const Approvals = () => {
  const { documents, approveDocument, rejectDocument } = useApp();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingDocuments = documents.filter((doc) => doc.status === "pending");

  const handleApprove = (docId) => {
    approveDocument(docId);
    toast.success("Document Approved", {
      description: "Document has been approved and posted",
      duration: 3000,
    });
  };

  const handleRejectClick = (doc) => {
    setSelectedDoc(doc);
    setRejectionReason("");
    onOpen();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Validation Error", {
        description: "Please provide a reason for rejection",
        duration: 3000,
      });
      return;
    }

    rejectDocument(selectedDoc.id, rejectionReason);
    toast.info("Document Rejected", {
      description: "Document has been rejected",
      duration: 3000,
    });
    onClose();
    setSelectedDoc(null);
    setRejectionReason("");
  };

  return (
    <Box>
      <Heading mb={6}>Pending Approvals</Heading>

      {pendingDocuments.length === 0 ? (
        <Card>
          <CardBody>
            <VStack py={8}>
              <Text color="gray.500" fontSize="lg">
                No pending approvals
              </Text>
              <Text color="gray.400" fontSize="sm">
                All documents have been reviewed
              </Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Box bg="white" borderRadius="md" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Version</Th>
                <Th>Uploaded</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingDocuments.map((doc) => (
                <Tr
                  key={`approval-${doc.id}`}
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <Td fontWeight="semibold">{doc.title}</Td>
                  <Td>{doc.category || "Uncategorized"}</Td>
                  <Td>
                    <Badge colorScheme="brandPrimary">
                      v{doc.versions?.length || 1}
                    </Badge>
                  </Td>
                  <Td>
                    <Timestamp date={doc.createdAt} />
                  </Td>
                  <Td>
                    <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
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
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
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
                id="rejectionReason"
                name="rejectionReason"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
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

export default Approvals;
