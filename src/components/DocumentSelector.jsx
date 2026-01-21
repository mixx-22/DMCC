import { useState, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiFolder,
  FiPlus,
  FiX,
  FiUpload,
  FiSearch,
  FiCheck,
} from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useDocuments } from "../context/_useContext";
import { getDocumentIcon } from "./Document/DocumentIcon";

const DocumentSelector = ({
  value = [],
  onChange,
  label = "Documents",
  parentId = null,
  readonly = false,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { documents, fetchDocuments, createDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load documents when modal opens
  const handleOpen = useCallback(async () => {
    setLoading(true);
    try {
      await fetchDocuments(parentId);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents", {
        description: "Could not load available documents",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
    onOpen();
  }, [parentId, fetchDocuments, onOpen]);

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) => {
    if (doc.type === "auditSchedule") return false; // Exclude audit schedules
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      (doc.description || "").toLowerCase().includes(searchLower)
    );
  });

  // Handle document selection
  const handleToggleDocument = (doc) => {
    const isSelected = selectedDocs.some((d) => d.id === doc.id);
    if (isSelected) {
      setSelectedDocs(selectedDocs.filter((d) => d.id !== doc.id));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  // Handle adding selected documents
  const handleAddSelected = () => {
    const newDocs = selectedDocs.filter(
      (selected) => !value.some((existing) => existing.id === selected.id)
    );
    onChange([...value, ...newDocs]);
    setSelectedDocs([]);
    onClose();
  };

  // Handle file upload
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          const title = file.name.split(".").slice(0, -1).join(".") || file.name;
          const newDoc = await createDocument({
            title,
            description: `Uploaded for audit schedule`,
            type: "file",
            parentId: parentId,
            path: "/",
            status: 0,
            metadata: {
              file,
              filename: file.name,
              size: file.size,
            },
          });

          return newDoc;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error("Upload Failed", {
            description: `Failed to upload ${file.name}`,
            duration: 3000,
          });
          return null;
        }
      });

      try {
        const uploadedDocs = await Promise.all(uploadPromises);
        const validDocs = uploadedDocs.filter((doc) => doc !== null);
        
        if (validDocs.length > 0) {
          onChange([...value, ...validDocs]);
          toast.success("Upload Successful", {
            description: `${validDocs.length} file(s) uploaded successfully`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, parentId, createDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
  });

  // Handle removing a document
  const handleRemove = (docId) => {
    onChange(value.filter((doc) => doc.id !== docId));
  };

  if (readonly) {
    return (
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        {value.length > 0 ? (
          <VStack align="stretch" spacing={2}>
            {value.map((doc) => (
              <HStack
                key={doc.id}
                p={3}
                bg="gray.50"
                borderRadius="md"
                spacing={3}
              >
                {getDocumentIcon(doc)}
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {doc.title}
                  </Text>
                  {doc.description && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {doc.description}
                    </Text>
                  )}
                </VStack>
                {doc.type === "file" && doc.metadata?.size && (
                  <Badge colorScheme="gray" fontSize="xs">
                    {(doc.metadata.size / 1024).toFixed(1)} KB
                  </Badge>
                )}
              </HStack>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" fontSize="sm">
            No documents selected
          </Text>
        )}
      </FormControl>
    );
  }

  return (
    <FormControl {...props}>
      <FormLabel>{label}</FormLabel>
      <VStack align="stretch" spacing={3}>
        {value.length > 0 && (
          <VStack align="stretch" spacing={2}>
            {value.map((doc) => (
              <HStack
                key={doc.id}
                p={3}
                bg="gray.50"
                borderRadius="md"
                spacing={3}
              >
                {getDocumentIcon(doc)}
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {doc.title}
                  </Text>
                  {doc.description && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {doc.description}
                    </Text>
                  )}
                </VStack>
                {doc.type === "file" && doc.metadata?.size && (
                  <Badge colorScheme="gray" fontSize="xs">
                    {(doc.metadata.size / 1024).toFixed(1)} KB
                  </Badge>
                )}
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  icon={<FiX />}
                  aria-label="Remove document"
                  onClick={() => handleRemove(doc.id)}
                />
              </HStack>
            ))}
          </VStack>
        )}
        <Button
          leftIcon={<FiPlus />}
          variant="outline"
          onClick={handleOpen}
          colorScheme="purple"
        >
          Add Documents
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Documents</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs colorScheme="purple">
              <TabList>
                <Tab>Select Existing</Tab>
                <Tab>Upload New</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FiSearch />
                      </InputLeftElement>
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>

                    {loading ? (
                      <Center py={8}>
                        <Spinner size="lg" color="purple.500" />
                      </Center>
                    ) : filteredDocuments.length > 0 ? (
                      <VStack
                        align="stretch"
                        spacing={0}
                        maxH="400px"
                        overflowY="auto"
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                      >
                        {filteredDocuments.map((doc) => {
                          const isSelected = selectedDocs.some(
                            (d) => d.id === doc.id
                          );
                          const isAlreadyAdded = value.some(
                            (d) => d.id === doc.id
                          );
                          return (
                            <HStack
                              key={doc.id}
                              p={3}
                              spacing={3}
                              bg={
                                isAlreadyAdded
                                  ? "green.50"
                                  : isSelected
                                  ? "purple.50"
                                  : "white"
                              }
                              borderBottom="1px"
                              borderColor="gray.100"
                              cursor={isAlreadyAdded ? "not-allowed" : "pointer"}
                              opacity={isAlreadyAdded ? 0.6 : 1}
                              _hover={{
                                bg: isAlreadyAdded
                                  ? "green.50"
                                  : isSelected
                                  ? "purple.100"
                                  : "gray.50",
                              }}
                              onClick={() =>
                                !isAlreadyAdded && handleToggleDocument(doc)
                              }
                            >
                              <Checkbox
                                isChecked={isSelected || isAlreadyAdded}
                                isDisabled={isAlreadyAdded}
                                pointerEvents="none"
                              />
                              {getDocumentIcon(doc)}
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {doc.title}
                                </Text>
                                {doc.description && (
                                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                    {doc.description}
                                  </Text>
                                )}
                              </VStack>
                              {isAlreadyAdded && (
                                <Badge colorScheme="green" fontSize="xs">
                                  <HStack spacing={1}>
                                    <FiCheck />
                                    <Text>Added</Text>
                                  </HStack>
                                </Badge>
                              )}
                            </HStack>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Center py={8}>
                        <VStack spacing={2}>
                          <FiFolder size={32} color="gray" />
                          <Text color="gray.500" fontSize="sm">
                            {searchQuery
                              ? "No documents found"
                              : "No documents available"}
                          </Text>
                        </VStack>
                      </Center>
                    )}

                    {selectedDocs.length > 0 && (
                      <Text fontSize="sm" color="gray.600">
                        {selectedDocs.length} document(s) selected
                      </Text>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Box
                      {...getRootProps()}
                      p={8}
                      border="2px dashed"
                      borderColor={isDragActive ? "purple.400" : "gray.300"}
                      borderRadius="md"
                      bg={isDragActive ? "purple.50" : "gray.50"}
                      cursor={uploading ? "not-allowed" : "pointer"}
                      textAlign="center"
                      transition="all 0.2s"
                      _hover={{
                        borderColor: uploading ? "gray.300" : "purple.400",
                        bg: uploading ? "gray.50" : "purple.50",
                      }}
                    >
                      <input {...getInputProps()} />
                      <VStack spacing={3}>
                        <FiUpload size={32} color={isDragActive ? "purple" : "gray"} />
                        {uploading ? (
                          <>
                            <Spinner color="purple.500" />
                            <Text color="gray.600">Uploading files...</Text>
                          </>
                        ) : (
                          <>
                            <Text fontWeight="medium" color="gray.700">
                              {isDragActive
                                ? "Drop files here"
                                : "Drag & drop files here"}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              or click to browse
                            </Text>
                          </>
                        )}
                      </VStack>
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      Uploaded files will be added to the audit schedule documents
                    </Text>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleAddSelected}
              isDisabled={selectedDocs.length === 0}
            >
              Add {selectedDocs.length > 0 ? `(${selectedDocs.length})` : ""}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FormControl>
  );
};

export default DocumentSelector;
