import { useState, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiFile, FiFolder, FiX, FiPlus, FiUpload } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useDocuments } from "../../context/_useContext";

const DocumentSelector = ({
  label = "Documents",
  value = {},
  onChange,
  organizationId,
  auditScheduleId,
  ...props
}) => {
  const { documents: allDocuments, fetchDocuments, createDocument, loading } = useDocuments();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Convert value object to array for display
  const selectedDocuments = Object.entries(value).map(([docId, doc]) => ({
    id: docId,
    ...doc,
  }));

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      try {
        const uploadedDocs = {};

        for (const file of acceptedFiles) {
          try {
            const title = file.name.split(".").slice(0, -1).join(".") || file.name;
            const newDoc = await createDocument({
              title,
              description: `Uploaded for audit ${auditScheduleId}`,
              type: "file",
              parentId: auditScheduleId,
              path: "/",
              status: 0,
              metadata: {
                file,
                filename: file.name,
                size: file.size,
              },
            });

            if (newDoc) {
              uploadedDocs[newDoc.id || newDoc._id] = {
                title: newDoc.title,
                type: newDoc.type,
                filename: newDoc.metadata?.filename || file.name,
                size: newDoc.metadata?.size || file.size,
              };
            }
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}`, {
              description: error?.message || "Unknown error",
              duration: 3000,
            });
          }
        }

        if (Object.keys(uploadedDocs).length > 0) {
          // Add uploaded documents to existing ones
          onChange({ ...value, ...uploadedDocs });
          toast.success("Files Uploaded", {
            description: `${Object.keys(uploadedDocs).length} file${Object.keys(uploadedDocs).length > 1 ? "s" : ""} uploaded successfully`,
            duration: 3000,
          });
        }
      } catch (error) {
        toast.error("Upload Failed", {
          description: error?.message || "Failed to upload files",
          duration: 3000,
        });
      } finally {
        setUploading(false);
      }
    },
    [auditScheduleId, createDocument, value, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
  });

  const handleSelectFromLibrary = async () => {
    try {
      await fetchDocuments(null);
      setSelectedDocs([]);
      onOpen();
    } catch (error) {
      toast.error("Failed to Load Documents", {
        description: "Unable to fetch document library",
        duration: 3000,
      });
    }
  };

  const handleToggleDocument = (doc) => {
    const docId = doc.id || doc._id;
    if (selectedDocs.find((d) => (d.id || d._id) === docId)) {
      setSelectedDocs(selectedDocs.filter((d) => (d.id || d._id) !== docId));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const handleAddSelected = () => {
    const newDocs = {};
    selectedDocs.forEach((doc) => {
      const docId = doc.id || doc._id;
      newDocs[docId] = {
        title: doc.title,
        type: doc.type,
        filename: doc.metadata?.filename,
        size: doc.metadata?.size,
      };
    });

    onChange({ ...value, ...newDocs });
    toast.success("Documents Added", {
      description: `${selectedDocs.length} document${selectedDocs.length > 1 ? "s" : ""} added`,
      duration: 3000,
    });
    setSelectedDocs([]);
    onClose();
  };

  const handleRemoveDocument = (docId) => {
    const { [docId]: removed, ...rest } = value;
    onChange(rest);
  };

  return (
    <>
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        <VStack spacing={3} align="stretch">
          {/* Upload Area */}
          <Box
            {...getRootProps()}
            p={6}
            borderWidth={2}
            borderStyle="dashed"
            borderColor={isDragActive ? "purple.400" : "gray.300"}
            borderRadius="md"
            bg={isDragActive ? "purple.50" : "gray.50"}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: "purple.400",
              bg: "purple.50",
            }}
          >
            <input {...getInputProps()} />
            <VStack spacing={2}>
              <Icon
                as={FiUpload}
                boxSize={8}
                color={isDragActive ? "purple.500" : "gray.400"}
              />
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {uploading
                  ? "Uploading..."
                  : isDragActive
                  ? "Drop files here..."
                  : "Drag & drop files here, or click to browse"}
              </Text>
            </VStack>
          </Box>

          {/* Select from Library Button */}
          <Button
            leftIcon={<FiPlus />}
            onClick={handleSelectFromLibrary}
            variant="outline"
            colorScheme="purple"
            size="sm"
          >
            Select from Library
          </Button>

          {/* Selected Documents Display */}
          {selectedDocuments.length > 0 && (
            <VStack spacing={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Selected Documents ({selectedDocuments.length})
              </Text>
              {selectedDocuments.map((doc) => (
                <Card key={doc.id} size="sm">
                  <CardBody>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon
                          as={doc.type === "folder" ? FiFolder : FiFile}
                          color={doc.type === "folder" ? "blue.500" : "gray.500"}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {doc.title}
                          </Text>
                          {doc.filename && (
                            <Text fontSize="xs" color="gray.500">
                              {doc.filename}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <IconButton
                        icon={<FiX />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Remove document"
                        onClick={() => handleRemoveDocument(doc.id)}
                      />
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </FormControl>

      {/* Document Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Documents from Library</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <Center py={8}>
                <Spinner size="lg" color="purple.500" />
              </Center>
            ) : allDocuments.length === 0 ? (
              <Center py={8}>
                <Text color="gray.500">No documents available</Text>
              </Center>
            ) : (
              <SimpleGrid columns={1} spacing={3} maxH="400px" overflowY="auto">
                {allDocuments
                  .filter((doc) => doc.type === "file" || doc.type === "folder")
                  .map((doc) => {
                    const docId = doc.id || doc._id;
                    const isSelected = selectedDocs.find(
                      (d) => (d.id || d._id) === docId
                    );
                    const alreadyAdded = value[docId];

                    return (
                      <Card
                        key={docId}
                        variant={isSelected ? "filled" : "outline"}
                        bg={isSelected ? "purple.50" : "white"}
                        borderColor={isSelected ? "purple.500" : "gray.200"}
                        cursor={alreadyAdded ? "not-allowed" : "pointer"}
                        opacity={alreadyAdded ? 0.6 : 1}
                        onClick={() => !alreadyAdded && handleToggleDocument(doc)}
                        _hover={
                          !alreadyAdded
                            ? {
                                borderColor: "purple.400",
                                transform: "translateY(-2px)",
                                shadow: "md",
                              }
                            : {}
                        }
                        transition="all 0.2s"
                      >
                        <CardBody>
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Icon
                                as={doc.type === "folder" ? FiFolder : FiFile}
                                color={
                                  doc.type === "folder" ? "blue.500" : "gray.500"
                                }
                                boxSize={5}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {doc.title}
                                </Text>
                                {doc.metadata?.filename && (
                                  <Text fontSize="xs" color="gray.500">
                                    {doc.metadata.filename}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                            {alreadyAdded && (
                              <Badge colorScheme="green">Added</Badge>
                            )}
                          </HStack>
                        </CardBody>
                      </Card>
                    );
                  })}
              </SimpleGrid>
            )}
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
              Add Selected ({selectedDocs.length})
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentSelector;
