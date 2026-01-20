import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
  FiFolder,
  FiHome,
  FiChevronRight,
  FiPlus,
  FiAlertCircle,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";
import apiService from "../../../services/api";

const DOCUMENTS_ENDPOINT = "/documents";

const MoveDocumentModal = ({ isOpen, onClose, document }) => {
  const { updateDocument, createDocument } = useDocuments();
  
  // State management
  const [currentLocation, setCurrentLocation] = useState(null); // Current folder being viewed
  const [breadcrumbPath, setBreadcrumbPath] = useState([]); // Path from root to current
  const [folders, setFolders] = useState([]); // Folders in current location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  // Inline folder creation
  const { isOpen: isCreatingFolder, onToggle: toggleCreatingFolder, onClose: closeCreatingFolder } = useDisclosure();
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Colors
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const emptyStateColor = useColorModeValue("gray.500", "gray.400");

  // Initialize: Load parent folder if document has one
  useEffect(() => {
    if (isOpen && document) {
      initializeLocation();
    }
  }, [isOpen, document]);

  const initializeLocation = async () => {
    setError(null);
    
    if (!document.parentId) {
      // Document is in root
      await loadFolders(null);
      setBreadcrumbPath([{ id: null, title: "Root" }]);
      setCurrentLocation(null);
    } else {
      // Document is in a folder, load parent folder info first
      try {
        setLoading(true);
        const parentFolder = await fetchFolderById(document.parentId);
        
        if (parentFolder) {
          // Build breadcrumb path from parent folder
          const path = await buildBreadcrumbPath(parentFolder);
          setBreadcrumbPath(path);
          setCurrentLocation(parentFolder);
          
          // Load folders in parent location
          await loadFolders(parentFolder.id);
        } else {
          // Fallback to root if parent not found
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
  };

  // Fetch single folder by ID
  const fetchFolderById = async (folderId) => {
    try {
      const response = await apiService.request(`${DOCUMENTS_ENDPOINT}/${folderId}`, {
        method: "GET",
      });
      
      return response.data || response.document || response;
    } catch (err) {
      console.error(`Error fetching folder ${folderId}:`, err);
      return null;
    }
  };

  // Build breadcrumb path by traversing parent chain
  const buildBreadcrumbPath = async (folder) => {
    const path = [];
    let current = folder;
    
    // Traverse up to root
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
    
    // Add root at the beginning
    path.unshift({ id: null, title: "Root" });
    
    return path;
  };

  // Load folders in a given location
  const loadFolders = async (parentId) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (parentId === null) {
        // Load root folders
        response = await apiService.request(DOCUMENTS_ENDPOINT, {
          method: "GET",
          params: { type: "folder" },
        });
      } else {
        // Load subfolders of a folder
        response = await apiService.request(`${DOCUMENTS_ENDPOINT}/${parentId}`, {
          method: "GET",
          params: { type: "folder" },
        });
      }
      
      const folderList = response.data?.documents || response.documents || [];
      
      // Filter out the document being moved and its children
      const filteredFolders = folderList.filter((folder) => {
        if (folder.id === document.id) return false;
        
        // If moving a folder, prevent moving into its own children
        if (document.type === "folder") {
          // Check if this folder is a descendant of the document being moved
          // This is a simplified check - in production, you'd want to do a full tree check
          return folder.parentId !== document.id;
        }
        
        return true;
      });
      
      setFolders(filteredFolders);
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
  };

  // Navigate to a folder
  const navigateToFolder = async (folder) => {
    setCurrentLocation(folder);
    
    // Update breadcrumb path
    if (folder === null) {
      // Navigating to root
      setBreadcrumbPath([{ id: null, title: "Root" }]);
    } else {
      // Add folder to path if not already there
      const existingIndex = breadcrumbPath.findIndex(item => item.id === folder.id);
      if (existingIndex >= 0) {
        // Clicked on breadcrumb - trim path
        setBreadcrumbPath(breadcrumbPath.slice(0, existingIndex + 1));
      } else {
        // Drilling into subfolder
        setBreadcrumbPath([...breadcrumbPath, { id: folder.id, title: folder.title }]);
      }
    }
    
    // Load folders in new location
    await loadFolders(folder?.id || null);
    
    // Close inline folder creation if open
    closeCreatingFolder();
    setNewFolderName("");
  };

  // Create new folder inline
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
      const newFolder = await createDocument({
        title: newFolderName.trim(),
        description: "",
        type: "folder",
        parentId: currentLocation?.id || null,
        path: currentLocation?.path || "/",
        status: 1, // Auto-approved
        metadata: {
          allowInheritance: 0,
        },
      });
      
      toast.success("Folder Created", {
        description: `Folder "${newFolderName}" has been created`,
        duration: 3000,
      });
      
      // Refresh folder list
      await loadFolders(currentLocation?.id || null);
      
      // Close inline creation
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

  // Move document to selected destination
  const handleMove = async () => {
    if (selectedDestination?.id === document.parentId && selectedDestination?.id !== undefined) {
      toast.info("Same Location", {
        description: "Document is already in this location",
        duration: 3000,
      });
      return;
    }
    
    if (selectedDestination?.id === undefined && !document.parentId) {
      toast.info("Same Location", {
        description: "Document is already in root",
        duration: 3000,
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await updateDocument(document.id, {
        parentId: selectedDestination?.id || null,
        path: selectedDestination?.path || "/",
      });
      
      const targetName = selectedDestination?.title || "Root";
      
      toast.success("Document Moved", {
        description: `"${document.title}" has been moved to ${targetName}`,
        duration: 3000,
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
    closeCreatingFolder();
    setNewFolderName("");
    onClose();
  };

  if (!document) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move "{document.title}"</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Breadcrumb navigation */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Current Location:
              </Text>
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
                      {crumb.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            </Box>

            <Divider />

            {/* Folder list */}
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
                <VStack spacing={1} align="stretch" maxH="300px" overflowY="auto">
                  {/* Current location option */}
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
                    onClick={() => setSelectedDestination(currentLocation || { id: null, title: "Root", path: "/" })}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        {currentLocation ? <FiFolder /> : <FiHome />}
                        <Text fontWeight="medium">
                          {currentLocation?.title || "Root"} (Current Location)
                        </Text>
                      </HStack>
                      {selectedDestination?.id === currentLocation?.id && (
                        <FiCheck color="blue" />
                      )}
                    </HStack>
                  </Box>

                  {/* Subfolder list */}
                  {folders.length > 0 ? (
                    folders.map((folder) => (
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
                            <Text>{folder.title}</Text>
                            {selectedDestination?.id === folder.id && (
                              <FiCheck color="blue" />
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
                    ))
                  ) : null}

                  {/* Inline folder creation */}
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

                  {/* Create folder button for non-empty locations */}
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

                  {/* Inline folder creation form */}
                  <Collapse in={isCreatingFolder} animateOpacity>
                    <Box
                      p={3}
                      borderWidth={1}
                      borderColor="blue.300"
                      borderRadius="md"
                      bg={useColorModeValue("blue.50", "blue.900")}
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
            colorScheme="blue"
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
