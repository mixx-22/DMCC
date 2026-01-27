import { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  HStack,
  IconButton,
  Flex,
  useDisclosure,
  Spinner,
  Center,
  Stack,
  List,
  ListItem,
  Text,
  Icon,
  Spacer,
  Hide,
} from "@chakra-ui/react";
import { FiGrid, FiList, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import SearchInput from "../../components/SearchInput";
import CreateFolderModal from "../../components/Document/modals/CreateFolderModal";
import QualityDocumentUploadModal from "../../components/Document/modals/QualityDocumentUploadModal";
import DocumentDrawer from "../../components/Document/DocumentDrawer";
import { GridView } from "../../components/Document/GridView";
import { ListView } from "../../components/Document/ListView";
import { EmptyState } from "../../components/Document/EmptyState";
import { ActionButton } from "../../components/Document/ActionButton";
import Breadcrumbs from "../../components/Document/Breadcrumbs";
import { useDocuments, useLayout } from "../../context/_useContext";

const Documents = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentFolderId,
    folder,
    documents,
    navigateToFolder,
    loading,
    createDocument,
    fetchDocuments,
  } = useDocuments();
  const {
    viewMode,
    toggleViewMode,
    selectedDocument,
    setSelectedDocument,
    handleDocumentClick,
    closeDocumentDrawer,
  } = useLayout();

  const isFolderView = location.pathname.includes("/folders/");
  const fetchedRef = useRef(false);
  const currentIdRef = useRef(null);

  useEffect(() => {
    fetchDocuments(currentFolderId);
  }, [currentFolderId, fetchDocuments]);

  useEffect(() => {
    if (currentIdRef.current !== id) {
      fetchedRef.current = false;
      currentIdRef.current = id;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (isFolderView && id && id !== currentFolderId) {
      const folderDoc = documents.find((doc) => doc.id === id);
      const folderTitle = folderDoc?.title || "Untitled";
      navigateToFolder(id, folderTitle);
    } else if (!isFolderView && currentFolderId !== null) {
      navigateToFolder(null, null);
    }
  }, [id, isFolderView, currentFolderId, navigateToFolder, documents]);

  const {
    isOpen: isFolderModalOpen,
    onOpen: onFolderModalOpen,
    onClose: onFolderModalClose,
  } = useDisclosure();
  const {
    isOpen: isQualityDocumentModalOpen,
    onOpen: onQualityDocumentModalOpen,
    onClose: onQualityDocumentModalClose,
  } = useDisclosure();

  const handleFormTemplateCreate = () => {
    navigate("/create-form", {
      state: { parentId: currentFolderId, path: "/" },
    });
  };

  const handleFileUpload = async (files) => {
    const uploadPromises = files.map(async (file) => {
      try {
        const title = file.name.split(".").slice(0, -1).join(".") || file.name;
        await createDocument({
          title,
          description: "",
          type: "file",
          parentId: currentFolderId,
          path: "/",
          status: -1,
          metadata: {
            file,
            filename: file.name,
            size: file.size,
          },
        });
        return { success: true, filename: file.name };
      } catch (error) {
        return {
          success: false,
          filename: file.name,
          error: error?.message || error,
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (successful.length > 0 && failed.length === 0) {
      toast.success("Files Uploaded Successfully", {
        description: `${successful.length} file${successful.length > 1 ? "s" : ""} uploaded`,
        duration: 3000,
      });
    } else if (successful.length > 0 && failed.length > 0) {
      toast.warning("Partial Upload", {
        description: (
          <Box>
            <Text mb={2}>
              {successful.length} successful, {failed.length} failed
            </Text>
            <List spacing={1} fontSize="sm">
              {successful.map((r, i) => (
                <ListItem
                  key={`success-${i}`}
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiCheckCircle} color="green.500" mr={2} />
                  {r.filename}
                </ListItem>
              ))}
              {failed.map((r, i) => (
                <ListItem
                  key={`failed-${i}`}
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiXCircle} color="red.500" mr={2} />
                  {r.filename}
                </ListItem>
              ))}
            </List>
          </Box>
        ),
        duration: 5000,
      });
    } else {
      toast.error("Upload Failed", {
        description: (
          <Box>
            <Text mb={2}>
              Failed to upload {failed.length} file
              {failed.length > 1 ? "s" : ""}
            </Text>
            <List spacing={1} fontSize="sm">
              {failed.map((r, i) => (
                <ListItem key={i} display="flex" alignItems="center">
                  <Icon as={FiXCircle} color="red.500" mr={2} />
                  {r.filename}
                </ListItem>
              ))}
            </List>
          </Box>
        ),
        duration: 5000,
      });
    }
  };

  return (
    <Box>
      <PageHeader>
        <Flex justify="center" align="center" w="full" gap={4}>
          <Hide below="md">
            <Box w="full" maxW="xl" ml={-2}>
              <SearchInput placeholder="Search documents..." header />
            </Box>
          </Hide>
          <Spacer />
          <HStack>
            <IconButton
              icon={viewMode === "grid" ? <FiList /> : <FiGrid />}
              onClick={toggleViewMode}
              aria-label="Toggle view"
              variant="ghost"
            />
          </HStack>
        </Flex>
      </PageHeader>

      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <ActionButton
            onFileSelect={handleFileUpload}
            onFolderModalOpen={onFolderModalOpen}
            onFormTemplateModalOpen={handleFormTemplateCreate}
            onQualityDocumentModalOpen={onQualityDocumentModalOpen}
          />
        </Flex>
      </PageFooter>

      <Stack spacing={{ base: 4, lg: 6 }}>
        <Breadcrumbs
          data={folder}
          onLastCrumbClick={() => setSelectedDocument(folder)}
          activeLastCrumb={
            !!selectedDocument && selectedDocument._id === folder._id
          }
        />
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="brandPrimary.500" />
          </Center>
        ) : documents.length === 0 ? (
          <EmptyState
            currentFolderId={currentFolderId}
            onUploadClick={() =>
              document.querySelector('input[type="file"]')?.click()
            }
            onCreateFolderClick={onFolderModalOpen}
          />
        ) : viewMode === "grid" ? (
          <GridView
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentClick={(doc) => {
              const result = handleDocumentClick(doc);
              if (result.isDoubleClick) {
                if (doc.type === "folder") {
                  navigate(`/documents/folders/${doc.id}`);
                } else if (doc.type === "file" || doc.type === "formTemplate") {
                  const sourcePage = {
                    path: isFolderView
                      ? `/documents/folders/${currentFolderId}`
                      : "/documents",
                    label: isFolderView
                      ? folder?.title || "Folder"
                      : "All Documents",
                  };
                  navigate(`/document/${doc.id}`, {
                    state: { from: sourcePage },
                  });
                }
              }
            }}
            sourcePage={{
              path: isFolderView
                ? `/documents/folders/${currentFolderId}`
                : "/documents",
              label: isFolderView ? folder?.title || "Folder" : "All Documents",
            }}
          />
        ) : (
          <ListView
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentClick={(doc) => {
              const result = handleDocumentClick(doc);
              if (result.isDoubleClick) {
                if (doc.type === "folder") {
                  navigate(`/documents/folders/${doc.id}`);
                } else if (doc.type === "file" || doc.type === "formTemplate") {
                  const sourcePage = {
                    path: isFolderView
                      ? `/documents/folders/${currentFolderId}`
                      : "/documents",
                    label: isFolderView
                      ? folder?.title || "Folder"
                      : "All Documents",
                  };
                  navigate(`/document/${doc.id}`, {
                    state: { from: sourcePage },
                  });
                }
              }
            }}
            sourcePage={{
              path: isFolderView
                ? `/documents/folders/${currentFolderId}`
                : "/documents",
              label: isFolderView ? folder?.title || "Folder" : "All Documents",
            }}
          />
        )}
      </Stack>

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={onFolderModalClose}
        parentId={currentFolderId}
        path={`/`}
      />
      <QualityDocumentUploadModal
        isOpen={isQualityDocumentModalOpen}
        onClose={onQualityDocumentModalClose}
        parentId={currentFolderId}
        path={`/`}
      />
      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={closeDocumentDrawer}
      />
    </Box>
  );
};

export default Documents;
