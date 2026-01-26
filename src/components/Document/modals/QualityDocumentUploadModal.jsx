import { useState, useCallback, useEffect } from "react";
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
  Text,
  Box,
  Icon,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiFile, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useDocuments } from "../../../context/_useContext";
import apiService from "../../../services/api";

const FILE_TYPES_ENDPOINT = "/file-types";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_FILE_TYPES = [
  { _id: "1", id: "1", name: "Quality Manual", isQualityDocument: true },
  { _id: "2", id: "2", name: "Work Instruction", isQualityDocument: true },
  { _id: "3", id: "3", name: "Form", isQualityDocument: false },
  { _id: "4", id: "4", name: "Policy", isQualityDocument: true },
  { _id: "5", id: "5", name: "Procedure", isQualityDocument: true },
];

const QualityDocumentUploadModal = ({ isOpen, onClose, parentId, path }) => {
  const { createDocument } = useDocuments();
  const [files, setFiles] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [loadingFileTypes, setLoadingFileTypes] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch file types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFileTypes();
    }
  }, [isOpen]);

  const fetchFileTypes = async () => {
    setLoadingFileTypes(true);
    try {
      if (!USE_API) {
        setFileTypes(MOCK_FILE_TYPES);
        setLoadingFileTypes(false);
        return;
      }

      const data = await apiService.request(FILE_TYPES_ENDPOINT, {
        method: "GET",
        params: {
          limit: 100,
        },
      });

      const fetchedFileTypes = data.data || data.fileTypes || [];
      setFileTypes(fetchedFileTypes);
    } catch (error) {
      console.error("Failed to fetch file types:", error);
      toast.error("Failed to Load File Types", {
        description: "Could not load file types. Please try again.",
        duration: 3000,
      });
      setFileTypes([]);
    } finally {
      setLoadingFileTypes(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      fileType: null,
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const handleFileRemove = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleFileTypeChange = (fileId, selectedOption) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              fileType: selectedOption
                ? {
                    id: selectedOption.value,
                    name: selectedOption.label,
                    isQualityDocument: selectedOption.isQualityDocument,
                  }
                : null,
            }
          : f
      )
    );
  };

  const handleSubmit = async () => {
    // Validation: Check if there are files
    if (files.length === 0) {
      toast.error("Validation Error", {
        description: "Please select at least one file to upload",
        duration: 3000,
      });
      return;
    }

    // Validation: Check if all files have file types
    const filesWithoutFileType = files.filter((f) => !f.fileType);
    if (filesWithoutFileType.length > 0) {
      toast.error("Validation Error", {
        description: "All files must have a file type selected. Please select a file type for each file before uploading.",
        duration: 4000,
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (fileItem) => {
        try {
          const title =
            fileItem.file.name.split(".").slice(0, -1).join(".") ||
            fileItem.file.name;
          await createDocument({
            title,
            description: "",
            type: "file",
            parentId,
            path,
            status: 0,
            metadata: {
              file: fileItem.file,
              filename: fileItem.file.name,
              size: fileItem.file.size,
              fileType: fileItem.fileType.id,
            },
          });
          return { success: true, filename: fileItem.file.name };
        } catch (error) {
          return {
            success: false,
            filename: fileItem.file.name,
            error: error?.message || error,
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (successful.length > 0 && failed.length === 0) {
        toast.success("Quality Documents Uploaded Successfully", {
          description: `${successful.length} quality document${successful.length > 1 ? "s" : ""} uploaded`,
          duration: 3000,
        });
        handleClose();
      } else if (successful.length > 0 && failed.length > 0) {
        toast.warning("Partial Upload", {
          description: `${successful.length} successful, ${failed.length} failed`,
          duration: 5000,
        });
      } else {
        toast.error("Upload Failed", {
          description: `Failed to upload ${failed.length} file${failed.length > 1 ? "s" : ""}`,
          duration: 5000,
        });
      }
    } catch (error) {
      toast.error("Failed to Upload Files", {
        description: `${error?.message || error || "Unknown error"}. Try again later or contact your System Administrator.`,
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const fileTypeOptions = fileTypes.map((ft) => ({
    value: ft.id || ft._id,
    label: ft.name,
    isQualityDocument: ft.isQualityDocument,
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Quality Documents</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* File Drop Zone */}
            <Box
              {...getRootProps()}
              border="2px dashed"
              borderColor={isDragActive ? "info.400" : "gray.300"}
              borderRadius="lg"
              p={8}
              textAlign="center"
              cursor="pointer"
              bg={isDragActive ? "info.50" : "gray.50"}
              transition="all 0.2s"
              _hover={{
                borderColor: "info.400",
                bg: "info.50",
              }}
            >
              <input {...getInputProps()} />
              <Center>
                <Icon
                  as={FiUploadCloud}
                  w={12}
                  h={12}
                  color={isDragActive ? "info.500" : "gray.400"}
                  mb={3}
                />
              </Center>
              <Text fontSize="md" fontWeight="medium" mb={1}>
                {isDragActive
                  ? "Drop your files here"
                  : "Drag & drop files here"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                or click to browse
              </Text>
            </Box>

            {/* Files List */}
            {loadingFileTypes ? (
              <Center py={4}>
                <Spinner size="md" color="brandPrimary.500" />
                <Text ml={3} color="gray.600">
                  Loading file types...
                </Text>
              </Center>
            ) : files.length > 0 ? (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>File Name</Th>
                      <Th>Size</Th>
                      <Th width="200px">File Type</Th>
                      <Th width="60px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {files.map((fileItem) => {
                      const selectedValue = fileItem.fileType
                        ? {
                            value: fileItem.fileType.id,
                            label: fileItem.fileType.name,
                            isQualityDocument:
                              fileItem.fileType.isQualityDocument,
                          }
                        : null;

                      return (
                        <Tr key={fileItem.id}>
                          <Td>
                            <Box display="flex" alignItems="center">
                              <Icon
                                as={FiFile}
                                color="brandPrimary.500"
                                mr={2}
                              />
                              <Text fontSize="sm" noOfLines={1}>
                                {fileItem.file.name}
                              </Text>
                            </Box>
                          </Td>
                          <Td>
                            <Text fontSize="xs" color="gray.600">
                              {formatFileSize(fileItem.file.size)}
                            </Text>
                          </Td>
                          <Td>
                            <Select
                              value={selectedValue}
                              onChange={(option) =>
                                handleFileTypeChange(fileItem.id, option)
                              }
                              options={fileTypeOptions}
                              placeholder="Select file type..."
                              isClearable
                              size="sm"
                              colorScheme="purple"
                              useBasicStyles
                            />
                          </Td>
                          <Td>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              icon={<FiX />}
                              onClick={() => handleFileRemove(fileItem.id)}
                              aria-label="Remove file"
                            />
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No files selected. Add files using the drop zone above.
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={uploading}>
            Cancel
          </Button>
          <Button
            colorScheme="brandPrimary"
            onClick={handleSubmit}
            isLoading={uploading}
            isDisabled={files.length === 0 || loadingFileTypes}
          >
            Upload {files.length > 0 && `(${files.length})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QualityDocumentUploadModal;
