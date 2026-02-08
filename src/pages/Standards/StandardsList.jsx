import {
  Box,
  Heading,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  LinkBox,
  LinkOverlay,
  Spacer,
  InputGroup,
  InputLeftElement,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import Pagination from "../../components/Pagination";
import RolesSkeleton from "../../components/RolesSkeleton";
import Timestamp from "../../components/Timestamp";
import apiService from "../../services/api";
import { toast } from "sonner";

const MotionBox = motion(Box);

const STANDARDS_ENDPOINT =
  import.meta.env.VITE_API_PACKAGE_STANDARDS || "/standards";
const USE_API = import.meta.env.VITE_USE_API !== "false";
const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LIMIT, 10) || 10;

const MOCK_STANDARDS = [
  {
    id: "std-1",
    standard: "ISO 9001:2015",
    description: "Quality management systems requirements.",
    updatedAt: "2024-03-01T11:20:00.000Z",
  },
  {
    id: "std-2",
    standard: "ISO 27001:2022",
    description: "Information security management systems requirements.",
    updatedAt: "2024-02-10T14:30:00.000Z",
  },
];

const filterMockStandards = (standards, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return standards.filter(
    (item) =>
      item.standard.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term),
  );
};

const normalizeStandardsResponse = (data) => {
  if (Array.isArray(data)) {
    return { standards: data, total: data.length };
  }

  const standards =
    data?.standards || data?.data || data?.items || data?.results || [];
  const total = data?.meta?.total || data?.total || standards.length || 0;

  return { standards, total };
};

const Standards = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStandard, setNewStandard] = useState({
    standard: "",
    description: "",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [lastPage, setLastPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTimeoutRef = useRef(null);

  const fetchStandards = useCallback(
    async (pageToLoad = page, searchTerm = search) => {
      setLoading(true);
      try {
        if (!USE_API) {
          let filteredData = MOCK_STANDARDS;
          if (searchTerm && searchTerm.length >= 2) {
            filteredData = filterMockStandards(MOCK_STANDARDS, searchTerm);
          }
          const start = (pageToLoad - 1) * limit;
          const end = start + limit;
          const paginated = filteredData.slice(start, end);
          setStandards(paginated);
          setTotal(filteredData.length);
          return;
        }

        const params = { page: pageToLoad, limit };
        if (searchTerm && searchTerm.length >= 2) {
          params.keyword = searchTerm;
        }

        const response = await apiService.request(STANDARDS_ENDPOINT, {
          method: "GET",
          params,
        });

        const normalized = normalizeStandardsResponse(response);
        setStandards(normalized.standards);
        setTotal(normalized.total);
      } catch (error) {
        setStandards([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [limit, page, search],
  );

  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlKeyword = searchParams.get("keyword");

    if (urlPage) {
      const pageNum = parseInt(urlPage, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== page) {
        setPage(pageNum);
        setLastPage(pageNum);
      }
    }

    if (urlKeyword !== null && urlKeyword !== search) {
      setSearch(urlKeyword);
    }

    fetchStandards(urlPage ? parseInt(urlPage, 10) || 1 : 1, urlKeyword || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.length === 0) {
      setPage(lastPage);
      fetchStandards(lastPage, "");
      return;
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        setPage(1);
        fetchStandards(1, value);
      }, 500);
    }
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    setLastPage(nextPage);
    fetchStandards(nextPage, search);
  };

  const openCreateModal = () => {
    setNewStandard({ standard: "", description: "" });
    onOpen();
  };

  const handleCreateStandard = async () => {
    if (!newStandard.standard.trim()) {
      toast.error("Standard title is required.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        standard: newStandard.standard.trim(),
        description: newStandard.description.trim(),
        clauses: [],
      };

      if (!USE_API) {
        const created = {
          ...payload,
          id: `standard-${Date.now()}`,
          _id: `standard-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setStandards((prev) => [created, ...prev]);
        setTotal((prev) => prev + 1);
        toast.success("Standard created.");
        onClose();
        navigate(`/standards/${created._id || created.id}`);
        return;
      }

      const response = await apiService.request(STANDARDS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created = response?.standard || response?.data || response;

      toast.success("Standard created.");
      onClose();
      if (created?._id || created?.id) {
        navigate(`/standards/${created._id || created.id}`);
        return;
      }
      fetchStandards(1, search);
    } catch (error) {
      toast.error("Failed to create standard.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Standards</Heading>
      </PageHeader>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={openCreateModal}
          >
            Create New Standard
          </Button>
        </Flex>
      </PageFooter>
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
              placeholder="Start searching for Standards..."
              value={search}
              onChange={handleSearchChange}
            />
          </InputGroup>
          <Spacer display={{ base: "none", md: "block" }} />
          <Text fontSize="sm" color="gray.600" flex={{ base: "1", md: "none" }}>
            {total > 0
              ? `Showing ${standards?.length} of ${total} Standard${
                  total !== 1 ? "s" : ""
                }`
              : "No Standards Available"}
          </Text>
          <Pagination
            mini
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
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
                    <Th>Standard</Th>
                    <Th>Description</Th>
                    <Th>Last Modified</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {standards.length === 0 ? (
                    <Tr>
                      <Td colSpan={3} textAlign="center" py={8}>
                        <Text color="gray.500">
                          {search && search.length >= 2
                            ? "No standards found matching your search"
                            : "No standards found"}
                        </Text>
                      </Td>
                    </Tr>
                  ) : (
                    standards.map((standard) => (
                      <LinkBox
                        as={Tr}
                        key={standard._id || standard.id || standard.standard}
                      >
                        <Td fontWeight="semibold">
                          <LinkOverlay
                            as={RouterLink}
                            to={`/standards/${standard._id || standard.id}`}
                          >
                            {standard.standard ||
                              standard.title ||
                              standard.name}
                          </LinkOverlay>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2}>
                            {standard.description || "—"}
                          </Text>
                        </Td>
                        <Td>
                          <Timestamp
                            date={
                              standard.updatedAt ||
                              standard.updated_at ||
                              standard.modifiedAt ||
                              standard.lastModified
                            }
                            showTime={true}
                            fontSize="sm"
                          />
                        </Td>
                      </LinkBox>
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
            onPageChange={handlePageChange}
          />
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Standard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Standard</FormLabel>
              <Input
                value={newStandard.standard}
                onChange={(e) =>
                  setNewStandard((prev) => ({
                    ...prev,
                    standard: e.target.value,
                  }))
                }
                placeholder="e.g., ISO 9001:2015"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={newStandard.description}
                onChange={(e) =>
                  setNewStandard((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Standard description"
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brandPrimary"
              onClick={handleCreateStandard}
              isLoading={creating}
            >
              Create Standard
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Standards;
