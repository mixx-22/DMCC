import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Spinner,
  Center,
  Stack,
  Heading,
  Text,
  Flex,
  Button,
  Hide,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import SearchInput from "../components/SearchInput";
import DocumentDrawer from "../components/Document/DocumentDrawer";
import QualityDocumentUploadModal from "../components/Document/modals/QualityDocumentUploadModal";
import { ListView } from "../components/Document/ListView";
import Pagination from "../components/Pagination";
import apiService from "../services/api";

const ITEMS_PER_PAGE = 10;

const QualityDocuments = () => {
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

  const handleQualityDocumentModalClose = () => {
    onQualityDocumentModalClose();
    // Refresh the documents list after modal closes
    fetchQualityDocuments(currentPage);
  };

  // Fetch quality documents
  const fetchQualityDocuments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      const response = await apiService.request("/documents/quality", {
        method: "GET",
        params,
      });

      if (response.success) {
        setDocuments(response.data || []);
        setTotalCount(response.meta?.total || 0);
      } else {
        throw new Error(
          response.message || "Failed to fetch quality documents",
        );
      }
    } catch (error) {
      console.error("Failed to fetch quality documents:", error);
      toast.error("Error", {
        description: "Failed to load quality documents",
        duration: 3000,
      });
      setDocuments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQualityDocuments(currentPage);
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
        <Flex justify="center" align="center" w="full" gap={4}>
          <Heading variant="pageTitle">Quality Documents</Heading>
          <Spacer />
          <Hide below="md">
            <Box w="full" maxW="xl" mr={-2}>
              <SearchInput placeholder="Search quality documents..." header />
            </Box>
          </Hide>
        </Flex>
      </PageHeader>

      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={onQualityDocumentModalOpen}
          >
            New Quality Document
          </Button>
        </Flex>
      </PageFooter>

      <Stack spacing={{ base: 4, lg: 6 }}>
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brandPrimary.500" />
          </Center>
        ) : documents.length === 0 ? (
          <Center py={12}>
            <Text color="gray.500" fontSize="lg">
              No Quality Documents
            </Text>
          </Center>
        ) : (
          <>
            <ListView
              documents={documents}
              selectedDocument={selectedDocument}
              onDocumentClick={handleDocumentClick}
              sourcePage={{ path: "/quality-documents", label: "Quality Documents" }}
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

      <QualityDocumentUploadModal
        isOpen={isQualityDocumentModalOpen}
        onClose={handleQualityDocumentModalClose}
        parentId={null}
        path={`/`}
      />
      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </Box>
  );
};

export default QualityDocuments;
