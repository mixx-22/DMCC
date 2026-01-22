import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Spinner, Center, Stack, Heading } from "@chakra-ui/react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import DocumentDrawer from "../components/Document/DocumentDrawer";
import { ListView } from "../components/Document/ListView";
import { EmptyState } from "../components/Document/EmptyState";
import Pagination from "../components/Pagination";
import apiService from "../services/api";

const ITEMS_PER_PAGE = 10;

const QualityDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Track if a fetch is in progress to prevent duplicate requests
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Fetch quality documents with abort controller for cleanup
  const fetchQualityDocuments = useCallback(async (page = 1) => {
    // Prevent duplicate requests
    if (fetchingRef.current) {
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    fetchingRef.current = true;
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      const response = await apiService.request("/documents/quality", {
        method: "GET",
        params,
        signal: abortControllerRef.current.signal,
      });

      if (response.success) {
        setDocuments(response.data?.documents || []);
        setTotalCount(response.data?.total || 0);
      } else {
        throw new Error(
          response.message || "Failed to fetch quality documents",
        );
      }
    } catch (error) {
      // Don't show error if request was aborted
      if (error.name === "AbortError") {
        return;
      }
      console.error("Failed to fetch quality documents:", error);
      toast.error("Error", {
        description: "Failed to load quality documents",
        duration: 3000,
      });
      setDocuments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchQualityDocuments(currentPage);

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPage, fetchQualityDocuments]);

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
        <Heading variant="pageTitle">Quality Documents</Heading>
      </PageHeader>

      <Stack spacing={{ base: 4, lg: 6 }}>
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : documents.length === 0 ? (
          <EmptyState
            currentFolderId={null}
            onUploadClick={() => {}}
            onCreateFolderClick={() => {}}
          />
        ) : (
          <>
            <ListView
              documents={documents}
              selectedDocument={selectedDocument}
              onDocumentClick={handleDocumentClick}
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

export default QualityDocuments;
