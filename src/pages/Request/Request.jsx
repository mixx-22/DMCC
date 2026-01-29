import { useState, useEffect, useCallback } from "react";
import { Box, Spinner, Center, Stack, Heading, Text } from "@chakra-ui/react";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import DocumentDrawer from "../../components/Document/DocumentDrawer";
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
        setDocuments(requestData);
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
    </Box>
  );
};

export default Request;
