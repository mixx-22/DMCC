import { useState, useEffect, useCallback } from "react";
import {
  Stack,
  Text,
  Flex,
  Button,
  useDisclosure,
  Center,
  Card,
  CardBody,
  VStack,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import DocumentDrawer from "./Document/DocumentDrawer";
import QualityDocumentUploadModal from "./Document/modals/QualityDocumentUploadModal";
import { ListView } from "./Document/ListView";
import DocumentsListSkeleton from "./Document/DocumentsListSkeleton";
import Pagination from "./Pagination";
import apiService from "../services/api";

const ITEMS_PER_PAGE = 10;

const TeamQualityDocuments = ({ teamId }) => {
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

  // Fetch quality documents filtered by teamId
  const fetchQualityDocuments = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: ITEMS_PER_PAGE,
          teamId: teamId, // Add teamId filter
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
    },
    [teamId],
  );

  useEffect(() => {
    if (teamId) {
      fetchQualityDocuments(currentPage);
    }
  }, [currentPage, teamId, fetchQualityDocuments]);

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Card w="full">
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Flex justify="flex-end">
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brandPrimary"
              onClick={onQualityDocumentModalOpen}
              size="sm"
            >
              New Quality Document
            </Button>
          </Flex>

          <Stack spacing={{ base: 4, lg: 6 }}>
            {loading ? (
              <DocumentsListSkeleton rows={ITEMS_PER_PAGE} />
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
                    path: `/teams/${teamId}`,
                    label: "Team Quality Documents",
                  }}
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
        </VStack>
      </CardBody>
    </Card>
  );
};

export default TeamQualityDocuments;
