import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { AsyncSelect } from "chakra-react-select";
import { FiFolder, FiPlus } from "react-icons/fi";
import { useCallback, useState, useRef, useEffect } from "react";
import apiService from "../services/api";
import CreateFolderModal from "./Document/modals/CreateFolderModal";

const DOCUMENTS_ENDPOINT = "/documents";
const USE_API = import.meta.env.VITE_USE_API !== "false";

const MOCK_FOLDERS = [
  { id: "folder-1", title: "Engineering Documents", type: "folder" },
  { id: "folder-2", title: "HR Files", type: "folder" },
  { id: "folder-3", title: "Marketing Assets", type: "folder" },
  { id: "folder-4", title: "Sales Resources", type: "folder" },
  { id: "folder-5", title: "Finance Records", type: "folder" },
];

const FolderAsyncSelect = ({
  value = null,
  onChange,
  isInvalid,
  label = "Documents Folder",
  placeholder = "Search for a folder or type id:<id>...",
  teamName = "",
  readonly = false,
  ...props
}) => {
  const {
    isOpen: isCreateFolderOpen,
    onOpen: onCreateFolderOpen,
    onClose: onCreateFolderClose,
  } = useDisclosure();
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const debounceTimerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadOptions = useCallback(
    (inputValue) => {
      if (!inputValue || inputValue.length < 2) {
        return Promise.resolve([]);
      }

      // Clear previous timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Increment request ID for this search
      const currentRequestId = ++requestIdRef.current;

      // Return a new promise that will be resolved after debounce
      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          // Check if this is still the latest request
          if (currentRequestId !== requestIdRef.current) {
            resolve([]); // Stale request, return empty
            return;
          }

          // Check if the input is in the format id:<id>
          const idMatch = inputValue.match(/^id:(.+)$/i);

          if (!USE_API) {
            let filtered;
            if (idMatch) {
              // Search by ID
              const searchId = idMatch[1].trim();
              filtered = MOCK_FOLDERS.filter((folder) =>
                folder.id.toLowerCase().includes(searchId.toLowerCase())
              );
            } else {
              // Search by title
              filtered = MOCK_FOLDERS.filter((folder) =>
                folder.title.toLowerCase().includes(inputValue.toLowerCase())
              );
            }
            
            // Check again if still the latest request before resolving
            if (currentRequestId === requestIdRef.current) {
              resolve(
                filtered.map((folder) => ({
                  value: folder.id,
                  label: folder.title,
                  folder: folder,
                }))
              );
            } else {
              resolve([]);
            }
            return;
          }

          try {
            let data;
            if (idMatch) {
              // Search by ID
              const searchId = idMatch[1].trim();
              data = await apiService.request(
                `${DOCUMENTS_ENDPOINT}/${searchId}`,
                {
                  method: "GET",
                }
              );

              // Check if still the latest request
              if (currentRequestId !== requestIdRef.current) {
                resolve([]);
                return;
              }

              // If found and it's a folder, return it
              const doc = data.data || data.document || data;
              if (doc && doc.type === "folder") {
                resolve([
                  {
                    value: doc.id,
                    label: doc.title,
                    folder: doc,
                  },
                ]);
              } else {
                resolve([]);
              }
            } else {
              // Search by keyword for folders only
              data = await apiService.request(DOCUMENTS_ENDPOINT, {
                method: "GET",
                params: {
                  keyword: inputValue,
                  type: "folder",
                  limit: 10,
                },
              });

              // Check if still the latest request
              if (currentRequestId !== requestIdRef.current) {
                resolve([]);
                return;
              }

              const documents = data.data?.documents || data.documents || [];
              resolve(
                documents
                  .filter((doc) => doc.type === "folder")
                  .map((folder) => ({
                    value: folder.id,
                    label: folder.title,
                    folder: folder,
                  }))
              );
            }
          } catch (error) {
            console.error("Failed to fetch folders:", error);
            resolve([]);
          }
        }, 500); // 500ms debounce delay
      });
    },
    []
  );

  const handleChange = (selectedOption) => {
    const folder = selectedOption
      ? {
          id: selectedOption.value,
          title: selectedOption.label,
        }
      : null;
    onChange(folder);
  };

  const handleCreateFolder = () => {
    setNewFolderTitle(teamName ? `${teamName}'s Documents` : "");
    onCreateFolderOpen();
  };

  const handleFolderCreated = (folder) => {
    onChange({
      id: folder.id,
      title: folder.title,
    });
    onCreateFolderClose(); // Close modal after creating folder
  };

  const selectedValue = value
    ? {
        value: value.id,
        label: value.title,
        folder: value,
      }
    : null;

  const formatOptionLabel = ({ folder }) => {
    return (
      <HStack>
        <FiFolder />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="medium">
            {folder.title}
          </Text>
          {folder.description && (
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {folder.description}
            </Text>
          )}
        </VStack>
      </HStack>
    );
  };

  if (readonly) {
    return (
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        {value ? (
          <HStack spacing={3}>
            <FiFolder />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="medium">
                {value.title}
              </Text>
            </VStack>
          </HStack>
        ) : (
          <Text color="gray.500" fontSize="sm">
            No folder assigned
          </Text>
        )}
      </FormControl>
    );
  }

  return (
    <>
      <FormControl isInvalid={isInvalid} {...props}>
        <FormLabel>{label}</FormLabel>
        <Box>
          <AsyncSelect
            value={selectedValue}
            onChange={handleChange}
            loadOptions={loadOptions}
            placeholder={placeholder}
            noOptionsMessage={({ inputValue }) => {
              if (!inputValue || inputValue.length < 2) {
                return "Type at least 2 characters to search";
              }
              return "No folders found";
            }}
            formatOptionLabel={formatOptionLabel}
            isClearable
            cacheOptions
            defaultOptions={false}
            loadingMessage={() => "Loading folders..."}
            colorScheme="green"
            useBasicStyles
          />
          <HStack mt={2} spacing={2}>
            <Text fontSize="xs" color="gray.500" flex={1}>
              Search by name or type id:&lt;folder-id&gt;
            </Text>
            <Button
              size="xs"
              leftIcon={<FiPlus />}
              colorScheme="brandPrimary"
              variant="outline"
              onClick={handleCreateFolder}
            >
              Create New Folder
            </Button>
          </HStack>
        </Box>
      </FormControl>

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={onCreateFolderClose}
        parentId={null}
        path={null}
        initialTitle={newFolderTitle}
        onFolderCreated={handleFolderCreated}
      />
    </>
  );
};

export default FolderAsyncSelect;
