import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Spinner,
  Center,
  Stack,
  Heading,
  Text,
  Button,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import DocumentDrawer from "../../components/Document/DocumentDrawer";
import QualityDocumentUploadModal from "../../components/Document/modals/QualityDocumentUploadModal";
import { ListView } from "../../components/Document/ListView";
import Pagination from "../../components/Pagination";
import apiService from "../../services/api";

const ITEMS_PER_PAGE = 10;

const Request = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const {
    isOpen: isQualityDocumentModalOpen,
    onOpen: onQualityDocumentModalOpen,
    onClose: onQualityDocumentModalClose,
  } = useDisclosure();

  // Fetch requests
  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      const response = await apiService.request("/request", {
        method: "GET",
        params,
      });

      if (response.success) {
        const requestData = response.data || [];
        console.log("Request data:", requestData);
        console.log("First document owner:", requestData[0]?.owner);

        // Transform request data to match ListView expected format
        const transformedData = requestData.map((request) => ({
          ...request,
          // Set type to 'file' for proper icon rendering (request.type is the request type like 'SUBMIT')
          type: "file",
          // Use documentId as id so ListView navigates to the correct document
          id: request.documentId,
          _id: request.documentId,
          // Map requestedBy to owner for ListView compatibility
          owner: request.requestedBy
            ? {
                _id: request.requestedBy._id,
                id: request.requestedBy._id,
                firstName: request.requestedBy.firstName,
                middleName: request.requestedBy.middleName,
                lastName: request.requestedBy.lastName,
                name: `${request.requestedBy.firstName} ${request.requestedBy.lastName}`.trim(),
              }
            : request.OwnerData
              ? {
                  _id: request.OwnerData.id,
                  id: request.OwnerData.id,
                  name: request.OwnerData.name,
                }
              : null,
        }));

        setDocuments(transformedData);
        setTotalCount(response.meta?.total || 0);
      } else {
        throw new Error(response.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Error", {
        description: "Failed to load requests",
        duration: 3000,
      });
      setDocuments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, fetchRequests]);

  const handleDocumentClick = (doc) => {
    // The ListView component already handles navigation on row click
    // and calls this function for the "More Options" button click
    // So we just set the selected document to open the drawer
    setSelectedDocument(doc);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Requests</Heading>
      </PageHeader>

      <Stack spacing={{ base: 4, lg: 6 }}>
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brandPrimary.500" />
          </Center>
        ) : documents.length === 0 ? (
          <Center py={12}>
            <Text color="gray.500" fontSize="lg">
              No Requests
            </Text>
          </Center>
        ) : (
          <>
            <ListView
              documents={documents}
              selectedDocument={selectedDocument}
              onDocumentClick={handleDocumentClick}
              sourcePage={{ path: "/request", label: "Requests" }}
            />
            {totalCount > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </Stack>

      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      <QualityDocumentUploadModal
        isOpen={isQualityDocumentModalOpen}
        onClose={onQualityDocumentModalClose}
        parentId={null}
        path={`/request`}
      />

      <PageFooter>
        <Flex justify="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={onQualityDocumentModalOpen}
          >
            New Request
          </Button>
        </Flex>
      </PageFooter>
    </Box>
  );
};

export default Request;
