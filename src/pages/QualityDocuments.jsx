import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Spinner,
  Center,
  Stack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Button,
  Hide,
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
  const [obsoleteDocuments, setObsoleteDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [obsoleteCurrentPage, setObsoleteCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [obsoleteTotalCount, setObsoleteTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

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
        status: "published", // Only fetch published/active documents
      };

      const response = await apiService.request("/documents/quality", {
        method: "GET",
        params,
      });

      if (response.success) {
        // Transform quality documents to show document number, title, and dates
        const transformedData = (response.data || []).map((doc) => ({
          ...doc,
          // Store original title as displayTitle for secondary display
          displayTitle: doc.title,
          // Replace title with document number
          title: doc.metadata?.documentNumber || doc.title || "N/A",
          // Store filename as subtitle
          subtitle: doc.metadata?.filename || "",
          // Add issued and effectivity dates
          issuedDate: doc.metadata?.issuedDate || null,
          effectivityDate: doc.metadata?.effectivityDate || null,
          // Add version
          version: doc.metadata?.version || null,
        }));
        setDocuments(transformedData);
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

  // Fetch obsolete documents
  const fetchObsoleteDocuments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: "obsolete", // Only fetch obsolete documents
      };

      const response = await apiService.request("/documents/quality", {
        method: "GET",
        params,
      });

      if (response.success) {
        // Transform obsolete documents to show document number, title, and dates
        const transformedData = (response.data || []).map((doc) => ({
          ...doc,
          // Store original title as displayTitle for secondary display
          displayTitle: doc.title,
          // Replace title with document number
          title: doc.metadata?.documentNumber || doc.title || "N/A",
          // Store filename as subtitle
          subtitle: doc.metadata?.filename || "",
          // Add issued and effectivity dates
          issuedDate: doc.metadata?.issuedDate || null,
          effectivityDate: doc.metadata?.effectivityDate || null,
          // Add version
          version: doc.metadata?.version || null,
        }));
        setObsoleteDocuments(transformedData);
        setObsoleteTotalCount(response.meta?.total || 0);
      } else {
        throw new Error(
          response.message || "Failed to fetch obsolete documents",
        );
      }
    } catch (error) {
      console.error("Failed to fetch obsolete documents:", error);
      toast.error("Error", {
        description: "Failed to load obsolete documents",
        duration: 3000,
      });
      setObsoleteDocuments([]);
      setObsoleteTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      fetchQualityDocuments(currentPage);
    } else {
      fetchObsoleteDocuments(obsoleteCurrentPage);
    }
  }, [
    currentPage,
    obsoleteCurrentPage,
    activeTab,
    fetchQualityDocuments,
    fetchObsoleteDocuments,
  ]);

  const handleDocumentClick = (doc) => {
    // The ListView component already handles navigation on row click
    // and calls this function for the "More Options" button click
    // So we just set the selected document to open the drawer
    setSelectedDocument(doc);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleObsoletePageChange = (page) => {
    setObsoleteCurrentPage(page);
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    // Reset to page 1 when switching tabs
    if (index === 0) {
      setCurrentPage(1);
    } else {
      setObsoleteCurrentPage(1);
    }
  };

  return (
    <Box>
      <Hide below="md">
        <PageHeader>
          <Box w="full" maxW="xl" ml={-2}>
            <SearchInput placeholder="Search documents..." header />
          </Box>
        </PageHeader>
      </Hide>

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

      <Tabs
        index={activeTab}
        onChange={handleTabChange}
        colorScheme="brandPrimary"
      >
        <TabList>
          <Tab>All Quality Documents</Tab>
          <Tab>Obsolete Documents</Tab>
        </TabList>

        <TabPanels>
          {/* All Quality Documents Tab */}
          <TabPanel px={0}>
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
                    sourcePage={{
                      path: "/quality-documents",
                      label: "Quality Documents",
                    }}
                    isQualityDocumentsView={true}
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
          </TabPanel>

          {/* Obsolete Documents Tab */}
          <TabPanel px={0}>
            <Stack spacing={{ base: 4, lg: 6 }}>
              {loading ? (
                <Center py={12}>
                  <Spinner size="xl" color="brandPrimary.500" />
                </Center>
              ) : obsoleteDocuments.length === 0 ? (
                <Center py={12}>
                  <Text color="gray.500" fontSize="lg">
                    No Obsolete Documents
                  </Text>
                </Center>
              ) : (
                <>
                  <ListView
                    documents={obsoleteDocuments}
                    selectedDocument={selectedDocument}
                    onDocumentClick={handleDocumentClick}
                    sourcePage={{
                      path: "/quality-documents",
                      label: "Quality Documents",
                    }}
                    isQualityDocumentsView={true}
                  />
                  {obsoleteTotalCount > ITEMS_PER_PAGE && (
                    <Pagination
                      currentPage={obsoleteCurrentPage}
                      totalItems={obsoleteTotalCount}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={handleObsoletePageChange}
                    />
                  )}
                </>
              )}
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>

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
