import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Input,
  HStack,
  Spacer,
  InputGroup,
  InputLeftElement,
  LinkBox,
  LinkOverlay,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { useSchedules } from "../../context/_useContext";
import Pagination from "../../components/Pagination";
import { FiSearch, FiCalendar } from "react-icons/fi";
import { getAuditTypeLabel } from "../../utils/auditHelpers";

const MotionBox = motion(Box);

const SchedulesList = () => {
  const {
    schedules = [],
    loading,
    error,
    page,
    limit,
    total,
    search,
    setPage,
    setSearch,
  } = useSchedules();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const getStatusBadge = (status) => {
    if (status === 1) {
      return (
        <Badge colorScheme="green" fontSize="xs">
          Closed
        </Badge>
      );
    }
    return (
      <Badge colorScheme="blue" fontSize="xs">
        Ongoing
      </Badge>
    );
  };

  // Loading skeleton
  if (loading && schedules.length === 0) {
    return (
      <Box>
        <HStack mb={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none" color="gray.400">
              <FiSearch />
            </InputLeftElement>
            <Input
              value={search}
              placeholder="Start searching for Schedules..."
              isDisabled
            />
          </InputGroup>
        </HStack>
        <Box p={8} textAlign="center">
          <Text>Loading schedules...</Text>
        </Box>
      </Box>
    );
  }

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
            placeholder="Start searching for Schedules..."
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>
        <Spacer display={{ base: "none", md: "block" }} />
        <Text fontSize="sm" color="gray.600" flex={{ base: "1", md: "none" }}>
          {total > 0
            ? `Showing ${schedules?.length} of ${total} Schedule${
                total !== 1 ? "s" : ""
              }`
            : `No Schedules Available`}
        </Text>
        <Pagination
          mini
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      </HStack>

      {error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Audit Code</Th>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Standard</Th>
                <Th textAlign="right">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {schedules.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.500">
                      {search && search.length >= 2
                        ? "No schedules found matching your search"
                        : "No schedules found"}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                schedules.map((schedule, scheduleIndex) => {
                  const scheduleId = schedule._id || schedule.id;
                  return (
                    <LinkBox
                      as={Tr}
                      key={`schedule-${scheduleIndex}-${scheduleId}`}
                    >
                      <Td>
                        <LinkOverlay
                          as={RouterLink}
                          to={`/schedules/${scheduleId}`}
                        >
                          <HStack w="fit-content">
                            <FiCalendar />
                            <Text as="span" fontWeight="medium">
                              {schedule.auditCode || "-"}
                            </Text>
                          </HStack>
                        </LinkOverlay>
                      </Td>
                      <Td>
                        <Text noOfLines={2} maxW="300px">
                          {schedule.title || "Untitled"}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {schedule.auditType
                            ? getAuditTypeLabel(schedule.auditType)
                            : "-"}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{schedule.standard || "-"}</Text>
                      </Td>
                      <Td textAlign="right">{getStatusBadge(schedule.status)}</Td>
                    </LinkBox>
                  );
                })
              )}
            </Tbody>
          </Table>
        </MotionBox>
      )}

      {!loading && !error && (
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      )}
    </Box>
  );
};

export default SchedulesList;
