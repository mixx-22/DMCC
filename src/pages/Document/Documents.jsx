import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Flex,
  useDisclosure,
  Spinner,
  Center,
  Stack,
} from "@chakra-ui/react";
import { FiGrid, FiList } from "react-icons/fi";
import { useDocuments } from "../../context/DocumentsContext";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import CreateFolderModal from "../../components/Document/modals/CreateFolderModal";
import CreateAuditScheduleModal from "../../components/Document/modals/CreateAuditScheduleModal";
import UploadFileModal from "../../components/Document/modals/UploadFileModal";
import DocumentDrawer from "../../components/Document/DocumentDrawer";
import { GridView } from "../../components/Document/GridView";
import { ListView } from "../../components/Document/ListView";
import { EmptyState } from "../../components/Document/EmptyState";
import { ActionButton } from "../../components/Document/ActionButton";
import Breadcrumbs from "../../components/Document/Breadcrumbs";

const Documents = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    viewMode,
    currentFolderId,
    selectedDocument,
    folder,
    documents,
    navigateToFolder,
    toggleViewMode,
    setSelectedDocument,
    loading,
  } = useDocuments();

  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickId, setLastClickId] = useState(null);
  const isFolderView = location.pathname.includes("/folders/");
  const fetchedRef = useRef(false);
  const currentIdRef = useRef(null);

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
    isOpen: isAuditModalOpen,
    onOpen: onAuditModalOpen,
    onClose: onAuditModalClose,
  } = useDisclosure();
  const {
    isOpen: isFileModalOpen,
    onOpen: onFileModalOpen,
    onClose: onFileModalClose,
  } = useDisclosure();

  const handleDocumentClick = (doc) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    if (lastClickId === doc.id && timeDiff < 300) {
      if (doc.type === "folder" || doc.type === "auditSchedule") {
        const folderTitle = doc?.title || "Untitled";
        navigateToFolder(doc.id, folderTitle);
        navigate(`/documents/folders/${doc.id}`);
      } else if (doc.type === "file") {
        navigate(`/document/${doc.id}`);
      }
      setLastClickTime(0);
      setLastClickId(null);
    } else {
      setSelectedDocument(doc);
      setLastClickTime(now);
      setLastClickId(doc.id);
    }
  };

  return (
    <Box>
      <PageHeader>
        <Flex justify="space-between" align="center" w="full">
          <Heading variant="pageTitle" noOfLines={1}>
            {folder?.title ?? `Documents`}
          </Heading>
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
            onFileModalOpen={onFileModalOpen}
            onFolderModalOpen={onFolderModalOpen}
            onAuditModalOpen={onAuditModalOpen}
          />
        </Flex>
      </PageFooter>

      <Stack spacing={{ base: 4, lg: 6 }}>
        <Breadcrumbs data={folder} />
        {loading ? (
          <Center py={12}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : documents.length === 0 ? (
          <EmptyState
            currentFolderId={currentFolderId}
            onUploadClick={onFileModalOpen}
            onCreateFolderClick={onFolderModalOpen}
          />
        ) : viewMode === "grid" ? (
          <GridView
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentClick={handleDocumentClick}
          />
        ) : (
          <ListView
            documents={documents}
            selectedDocument={selectedDocument}
            onDocumentClick={handleDocumentClick}
            onMoreOptions={setSelectedDocument}
          />
        )}
      </Stack>

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={onFolderModalClose}
        parentId={currentFolderId}
        path={`/`}
      />
      <CreateAuditScheduleModal
        isOpen={isAuditModalOpen}
        onClose={onAuditModalClose}
        parentId={currentFolderId}
        path={`/`}
      />
      <UploadFileModal
        isOpen={isFileModalOpen}
        onClose={onFileModalClose}
        parentId={currentFolderId}
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

export default Documents;
