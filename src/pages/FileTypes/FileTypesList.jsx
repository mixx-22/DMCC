import {
  Box,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spacer,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import { FiSearch, FiEdit2 } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFileTypes } from "../../context/_useContext";
import Pagination from "../../components/Pagination";
import RolesSkeleton from "../../components/RolesSkeleton";
import Timestamp from "../../components/Timestamp";
import FileTypeModal from "./FileTypeModal";

const MotionBox = motion(Box);

const FileTypesList = () => {
  const {
    fileTypes = [],
    loading,
    page,
    limit,
    total,
    search,
    setPage,
    setSearch,
    fetchFileTypes,
  } = useFileTypes();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFileType, setSelectedFileType] = useState(null);

  // Initialize from URL on mount
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlKeyword = searchParams.get("keyword");

    if (urlPage) {
      const pageNum = parseInt(urlPage, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== page) {
        setPage(pageNum);
      }
    }
    if (urlKeyword !== null && urlKeyword !== search) {
      setSearch(urlKeyword);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when page or search changes
  useEffect(() => {
    const params = {};
    if (page > 1) {
      params.page = page.toString();
    }
    if (search && search.length >= 2) {
      params.keyword = search;
    }
    setSearchParams(params, { replace: true });
  }, [page, search, setSearchParams]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleEdit = (fileType) => {
    setSelectedFileType(fileType);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedFileType(null);
    onClose();
    fetchFileTypes();
  };

  return (
    <Box>
      <HStack
        mb={4}
        justify="space-between"
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <InputGroup
          flex={{ base: "1", md: "none" }}
          maxW={{ base: "full", md: "300px" }}
          minW={{ base: "full", md: "200px" }}
        >
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Start searching for File Types..."
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>
        <Spacer display={{ base: "none", md: "block" }} />
        <Text fontSize="sm" color="gray.600" flex={{ base: "1", md: "none" }}>
          {total > 0
            ? `Showing ${fileTypes?.length} of ${total} File Type${
                total !== 1 ? "s" : ""
              }`
            : `No File Types Available`}
        </Text>
        <Pagination
          mini
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      </HStack>
      <Box overflowX="auto">
        {loading ? (
          <RolesSkeleton rows={limit} />
        ) : (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Properties</Th>
                  <Th>Last Updated</Th>
                  <Th width="80px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {fileTypes.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={8}>
                      <Text color="gray.500">
                        {search && search.length >= 2
                          ? "No file types found matching your search"
                          : "No file types found"}
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  fileTypes.map((fileType) => (
                    <Tr key={fileType._id || fileType.id}>
                      <Td fontWeight="semibold">{fileType.name}</Td>

                      <Td>
                        <HStack spacing={2} flexWrap="wrap">
                          {fileType.isQualityDocument && (
                            <Badge colorScheme="purple">Quality</Badge>
                          )}
                          {fileType.requiresApproval && (
                            <Badge colorScheme="blue">Approval</Badge>
                          )}
                          {fileType.trackVersioning && (
                            <Badge colorScheme="green">Versioning</Badge>
                          )}
                          {fileType.isDefault && (
                            <Badge colorScheme="orange">Default</Badge>
                          )}
                        </HStack>
                      </Td>

                      <Td>
                        <Timestamp date={fileType.updatedAt} showTime={true} fontSize="sm" />
                      </Td>

                      <Td>
                        <IconButton
                          aria-label="Edit file type"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(fileType)}
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </MotionBox>
        )}
      </Box>

      {!loading && (
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}

      <FileTypeModal
        isOpen={isOpen}
        onClose={handleModalClose}
        fileType={selectedFileType}
      />
    </Box>
  );
};

export default FileTypesList;
