import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Input,
  FormControl,
  FormLabel,
  useColorModeValue,
  Divider,
  Flex,
  Collapse,
  useDisclosure,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  FiFolder,
  FiHome,
  FiChevronRight,
  FiPlus,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiMoreHorizontal,
} from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";
import apiService from "../../../services/api";

const DOCUMENTS_ENDPOINT = "/documents";

const MoveDocumentModal = ({ isOpen, onClose, document }) => {
  const {
    updateDocument,
    createDocument,
    navigateToFolder: navigateToFolderContext,
  } = useDocuments();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [subfolderCache, setSubfolderCache] = useState({});

  const lastFetchedFolderRef = useRef(null);

  const {
    isOpen: isCreatingFolder,
    onToggle: toggleCreatingFolder,
    onClose: closeCreatingFolder,
  } = useDisclosure();
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const emptyStateColor = useColorModeValue("gray.500", "gray.400");
  const bgColor = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const checkColor = useColorModeValue("brandPrimary.600", "brandPrimary.200");

  const buildBreadcrumbPath = useCallback(async (folder) => {
    const path = [];
    let current = folder;

    while (current) {
      path.unshift({ id: current.id, title: current.title });

      if (!current.parentId) break;

      try {
        current = await fetchFolderById(current.parentId);
      } catch (err) {
        console.error("Error building path:", err);
        break;
      }
    }

    path.unshift({ id: null, title: "Root" });

    return path;
  }, []);

  const fetchAllSubfolders = useCallback(
    async (folderId, depth = 0, maxDepth = 5) => {
      if (depth >= maxDepth) return {};

      const cacheKey = folderId || "root";

      if (subfolderCache[cacheKey]) {
        return subfolderCache[cacheKey];
      }

      try {
        let response;

        if (folderId === null) {
          response = await apiService.request(DOCUMENTS_ENDPOINT, {
            method: "GET",
            params: { type: "folder" },
          });
        } else {
          response = await apiService.request(DOCUMENTS_ENDPOINT, {
            method: "GET",
            params: { folder: folderId, type: "folder" },
          });
        }

        const folderList = response.data?.documents || response.documents || [];

        const normalizedFolders = folderList.map((folder) => ({
          ...folder,
          id: folder._id || folder.id,
        }));

        // Filter out the document being moved and its children
        const filteredFolders = normalizedFolders.filter((folder) => {
          const docId = document._id || document.id;
          if (folder.id === docId) return false;

          if (document.type === "folder") {
            return folder.parentId !== docId;
          }

          return true;
        });

        const subfolderData = {};
        await Promise.all(
          filteredFolders.map(async (folder) => {
            const nestedSubfolders = await fetchAllSubfolders(
              folder.id,
              depth + 1,
              maxDepth,
            );
            subfolderData[folder.id] = nestedSubfolders;
          }),
        );

        const result = {
          folders: filteredFolders,
          subfolders: subfolderData,
        };

        setSubfolderCache((prev) => ({
          ...prev,
          [cacheKey]: result,
        }));

        return result;
      } catch (err) {
        console.error(`Error fetching subfolders for ${folderId}:`, err);
        return { folders: [], subfolders: {} };
      }
    },
    [document, subfolderCache],
  );

  const loadFolders = useCallback(
    async (parentId) => {
      const folderKey = parentId === null ? "root" : parentId;
      if (lastFetchedFolderRef.current === folderKey) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let response;

        if (parentId === null) {
          response = await apiService.request(DOCUMENTS_ENDPOINT, {
            method: "GET",
            params: { type: "folder" },
          });
        } else {
          response = await apiService.request(DOCUMENTS_ENDPOINT, {
            method: "GET",
            params: { folder: parentId, type: "folder" },
          });
        }

        const folderList = response.data?.documents || response.documents || [];

        const normalizedFolders = folderList.map((folder) => ({
          ...folder,
          id: folder._id || folder.id,
        }));

        const filteredFolders = normalizedFolders.filter((folder) => {
          const docId = document._id || document.id;
          if (folder.id === docId) return false;

          if (document.type === "folder") {
            return folder.parentId !== docId;
          }

          return true;
        });

        setFolders(filteredFolders);

        lastFetchedFolderRef.current = folderKey;

        fetchAllSubfolders(parentId);
      } catch (err) {
        console.error("Error loading folders:", err);
        setError(err.message || "Failed to load folders");
        toast.error("Error", {
          description: "Failed to load folders. Please try again.",
          duration: 3000,
        });
        setFolders([]);
      } finally {
        setLoading(false);
      }
    },
    [document, fetchAllSubfolders],
  );

  const initializeLocation = useCallback(async () => {
    setError(null);

    const docParentId =
      document.parentId ||
      (document.parentData &&
        (document.parentData._id || document.parentData.id));

    if (!docParentId) {
      await loadFolders(null);
      setBreadcrumbPath([{ id: null, title: "Root" }]);
      setCurrentLocation(null);
    } else {
      try {
        setLoading(true);
        const parentFolder = await fetchFolderById(docParentId);

        if (parentFolder) {
          const path = await buildBreadcrumbPath(parentFolder);
          setBreadcrumbPath(path);
          setCurrentLocation(parentFolder);

          await loadFolders(parentFolder.id);
        } else {
          await loadFolders(null);
          setBreadcrumbPath([{ id: null, title: "Root" }]);
          setCurrentLocation(null);
        }
      } catch (err) {
        console.error("Error initializing location:", err);
        toast.error("Error", {
          description: "Failed to load current location. Starting from root.",
          duration: 3000,
        });
        await loadFolders(null);
        setBreadcrumbPath([{ id: null, title: "Root" }]);
        setCurrentLocation(null);
      } finally {
        setLoading(false);
      }
    }
  }, [buildBreadcrumbPath, document, loadFolders]);

  useEffect(() => {
    if (isOpen && document) {
      initializeLocation();
    }
  }, [isOpen, document, initializeLocation]);

  const fetchFolderById = async (folderId) => {
    try {
      const response = await apiService.request(
        `${DOCUMENTS_ENDPOINT}/${folderId}`,
        {
          method: "GET",
        },
      );

      const folder =
        response.data?.document ||
        response.data ||
        response.document ||
        response;

      if (folder && folder._id) {
        return {
          ...folder,
          id: folder._id,
        };
      }

      return folder;
    } catch (err) {
      console.error(`Error fetching folder ${folderId}:`, err);
      return null;
    }
  };

  const navigateToFolder = async (folder) => {
    setCurrentLocation(folder);

    if (folder === null) {
      setBreadcrumbPath([{ id: null, title: "All Documents (Root)" }]);
    } else {
      const existingIndex = breadcrumbPath.findIndex(
        (item) => item.id === folder.id,
      );
      if (existingIndex >= 0) {
        setBreadcrumbPath(breadcrumbPath.slice(0, existingIndex + 1));
      } else {
        setBreadcrumbPath([
          ...breadcrumbPath,
          { id: folder.id, title: folder.title },
        ]);
      }
    }

    await loadFolders(folder?.id || null);

    closeCreatingFolder();
    setNewFolderName("");
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a folder name",
        duration: 3000,
      });
      return;
    }

    setCreatingFolder(true);

    try {
      await createDocument({
        title: newFolderName.trim(),
        description: "",
        type: "folder",
        parentId: currentLocation?.id || null,
        status: 1,
        metadata: {
          allowInheritance: 0,
        },
      });

      toast.success("Folder Created", {
        description: `Folder "${newFolderName}" has been created`,
        duration: 3000,
      });

      await loadFolders(currentLocation?.id || null);

      closeCreatingFolder();
      setNewFolderName("");
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to Create Folder", {
        description: err.message || "Unknown error. Try again later.",
        duration: 3000,
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleMove = async () => {
    const docParentId =
      document.parentId ||
      (document.parentData &&
        (document.parentData._id || document.parentData.id));

    if (
      selectedDestination?.id === docParentId &&
      selectedDestination?.id !== undefined
    ) {
      toast.info("Same Location", {
        description: "Document is already in this location",
        duration: 3000,
      });
      return;
    }

    if (selectedDestination?.id === undefined && !docParentId) {
      toast.info("Same Location", {
        description: "Document is already in All Documents (Root)",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const newParentId = selectedDestination?.id || null;

      await updateDocument(document, {
        parentId: newParentId,
      });

      const targetName = selectedDestination?.title || "All Documents (Root)";

      toast.success("Document Moved", {
        description: `"${document.title}" has been moved to ${targetName}. Click to view.`,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            navigateToFolderContext(newParentId);
            handleClose();
          },
        },
      });

      handleClose();
    } catch (err) {
      console.error("Error moving document:", err);
      toast.error("Failed to Move", {
        description: err.message || "Failed to move document. Try again later.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentLocation(null);
    setBreadcrumbPath([]);
    setFolders([]);
    setSelectedDestination(null);
    setError(null);
    setSubfolderCache({});
    lastFetchedFolderRef.current = null;
    closeCreatingFolder();
    setNewFolderName("");
    onClose();
  };

  const renderBreadcrumbs = () => {
    if (breadcrumbPath.length <= 3) {
      return (
        <Breadcrumb separator={<FiChevronRight />} fontSize="sm">
          {breadcrumbPath.map((crumb, index) => (
            <BreadcrumbItem key={crumb.id || "root"}>
              <BreadcrumbLink
                onClick={() => {
                  if (index === 0) {
                    navigateToFolder(null);
                  } else {
                    navigateToFolder(crumb);
                  }
                }}
                cursor="pointer"
                display="flex"
                alignItems="center"
                gap={1}
              >
                {index === 0 ? <FiHome /> : <FiFolder />}
                <Text as="span" noOfLines={1}>
                  {crumb.title}
                </Text>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      );
    }

    const first = breadcrumbPath[0];
    const last = breadcrumbPath[breadcrumbPath.length - 1];
    const middle = breadcrumbPath.slice(1, -1);

    return (
      <Breadcrumb separator={<FiChevronRight />} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => navigateToFolder(null)}
            cursor="pointer"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <FiHome />
            {first.title}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <Menu>
            <MenuButton
              as={Button}
              size="xs"
              variant="ghost"
              leftIcon={<FiMoreHorizontal />}
              minW="auto"
              px={1}
            />
            <MenuList>
              {middle.map((crumb) => (
                <MenuItem
                  key={crumb.id}
                  icon={<FiFolder />}
                  onClick={() => navigateToFolder(crumb)}
                >
                  {crumb.title}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            onClick={() => navigateToFolder(last)}
            cursor="pointer"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <FiFolder />
            <Text as="span" noOfLines={1} maxW={40}>
              {last.title}
            </Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    );
  };

  if (!document) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move {document.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="60vh" overflowY="auto">
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Current Location:
              </Text>
              {renderBreadcrumbs()}
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Select Destination:
              </Text>

              {loading ? (
                <Flex justify="center" align="center" py={8}>
                  <Spinner size="md" />
                </Flex>
              ) : error ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={8}
                  gap={2}
                >
                  <FiAlertCircle size={24} color={emptyStateColor} />
                  <Text fontSize="sm" color={emptyStateColor}>
                    {error}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadFolders(currentLocation?.id || null)}
                  >
                    Retry
                  </Button>
                </Flex>
              ) : (
                <VStack spacing={1} align="stretch">
                  <Box
                    p={3}
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="md"
                    cursor="pointer"
                    bg={
                      selectedDestination?.id === currentLocation?.id
                        ? selectedBg
                        : "transparent"
                    }
                    _hover={{ bg: hoverBg }}
                    onClick={() =>
                      setSelectedDestination(
                        currentLocation || {
                          id: null,
                          title: "All Documents (Root)",
                        },
                      )
                    }
                  >
                    <HStack justify="space-between">
                      <HStack>
                        {currentLocation ? <FiFolder /> : <FiHome />}
                        <Text fontWeight="medium">
                          {currentLocation?.title || "All Documents (Root)"}
                        </Text>
                      </HStack>
                      {selectedDestination?.id === currentLocation?.id && (
                        <FiCheck color="brandPrimary" />
                      )}
                    </HStack>
                  </Box>

                  {folders.length > 0
                    ? folders.map((folder) => {
                        const hasSubfolders =
                          subfolderCache[folder.id]?.folders?.length > 0;
                        const subfolderCount =
                          subfolderCache[folder.id]?.folders?.length || 0;

                        return (
                          <Box
                            key={folder.id}
                            p={3}
                            borderWidth={1}
                            borderColor={borderColor}
                            borderRadius="md"
                            cursor="pointer"
                            bg={
                              selectedDestination?.id === folder.id
                                ? selectedBg
                                : "transparent"
                            }
                            _hover={{ bg: hoverBg }}
                          >
                            <HStack justify="space-between">
                              <HStack
                                flex={1}
                                onClick={() => setSelectedDestination(folder)}
                              >
                                <FiFolder />
                                <Text noOfLines={2}>{folder.title}</Text>
                                {hasSubfolders && (
                                  <Text
                                    fontSize="xs"
                                    whiteSpace="nowrap"
                                    color={emptyStateColor}
                                  >
                                    ({subfolderCount}{" "}
                                    {subfolderCount === 1
                                      ? "folder"
                                      : "folders"}
                                    )
                                  </Text>
                                )}
                                {selectedDestination?.id === folder.id && (
                                  <Icon
                                    as={FiCheck}
                                    boxSize={6}
                                    color={checkColor}
                                  />
                                )}
                              </HStack>
                              <IconButton
                                icon={<FiChevronRight />}
                                size="sm"
                                variant="ghost"
                                aria-label="Open folder"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToFolder(folder);
                                }}
                              />
                            </HStack>
                          </Box>
                        );
                      })
                    : null}

                  {folders.length === 0 && !isCreatingFolder && (
                    <Box
                      p={4}
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text fontSize="sm" color={emptyStateColor} mb={2}>
                        No subfolders in this location
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<FiPlus />}
                        variant="outline"
                        onClick={toggleCreatingFolder}
                      >
                        Create Folder Here
                      </Button>
                    </Box>
                  )}

                  {folders.length > 0 && (
                    <Button
                      size="sm"
                      leftIcon={<FiPlus />}
                      variant="outline"
                      onClick={toggleCreatingFolder}
                    >
                      Create New Folder
                    </Button>
                  )}

                  <Collapse in={isCreatingFolder} animateOpacity>
                    <Box
                      p={3}
                      borderWidth={1}
                      borderColor="brandPrimary.300"
                      borderRadius="md"
                      bg={bgColor}
                    >
                      <FormControl>
                        <FormLabel fontSize="sm">New Folder Name</FormLabel>
                        <HStack>
                          <Input
                            size="sm"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleCreateFolder();
                              }
                            }}
                          />
                          <IconButton
                            icon={<FiCheck />}
                            size="sm"
                            colorScheme="green"
                            aria-label="Create"
                            onClick={handleCreateFolder}
                            isLoading={creatingFolder}
                          />
                          <IconButton
                            icon={<FiX />}
                            size="sm"
                            variant="ghost"
                            aria-label="Cancel"
                            onClick={() => {
                              closeCreatingFolder();
                              setNewFolderName("");
                            }}
                          />
                        </HStack>
                      </FormControl>
                    </Box>
                  </Collapse>
                </VStack>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleMove}
            isLoading={loading}
            isDisabled={!selectedDestination}
          >
            Move Here
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MoveDocumentModal;
