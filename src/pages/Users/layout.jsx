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
  Avatar,
  Badge,
  Spacer,
  InputGroup,
  InputLeftElement,
  LinkBox,
  LinkOverlay,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { useUsers } from "../../context/_useContext";
import Pagination from "../../components/Pagination";
import UsersSkeleton from "../../components/UsersSkeleton";
import { FiSearch } from "react-icons/fi";

const MotionBox = motion(Box);

const UsersList = () => {
  const {
    users,
    loading,
    error,
    page,
    limit,
    total,
    search,
    setPage,
    setSearch,
  } = useUsers();
  const [searchParams, setSearchParams] = useSearchParams();
  // Use users?.data or empty array if not present
  const userList = Array.isArray(users?.data) ? users.data : [];
  const inactive = useColorModeValue("red.600", "red.300");

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
            placeholder="Start searching for Users..."
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>
        <Spacer display={{ base: "none", md: "block" }} />
        <Text fontSize="sm" color="gray.600" flex={{ base: "1", md: "none" }}>
          {total > 0
            ? `Showing ${userList?.length} of ${total} User${
                total !== 1 ? "s" : ""
              }`
            : `No Users Available`}
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
      ) : loading ? (
        <UsersSkeleton rows={limit} />
      ) : (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th textAlign="right">Roles</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userList.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={8}>
                    <Text color="gray.500">
                      {search && search.length >= 2
                        ? "No users found matching your search"
                        : "No users found"}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                userList.map((user) => {
                  const fullName = `${user.firstName || ""} ${
                    user.middleName || ""
                  } ${user.lastName || ""}`.trim();
                  const userId = user._id || user.userId || user.employeeId;
                  return (
                    <LinkBox as={Tr} key={userId}>
                      <Td flex={2}>
                        <LinkOverlay as={RouterLink} to={`/users/${userId}`}>
                          <Tooltip
                            hasArrow
                            label={
                              !user.isActive
                                ? `${user.firstName || "User"} is Inactive`
                                : ""
                            }
                          >
                            <HStack w="fit-content">
                              <Avatar size="sm" name={fullName} />
                              <Text
                                as="span"
                                opacity={!user.isActive ? 0.6 : 1}
                                color={!user.isActive ? inactive : "inherit"}
                              >
                                {fullName}
                              </Text>
                            </HStack>
                          </Tooltip>
                        </LinkOverlay>
                      </Td>
                      <Td opacity={!user.isActive ? 0.6 : 1}>{user.email}</Td>
                      <Td textAlign="right" flexGrow={0}>
                        {!user.isActive ? (
                          <Badge colorScheme="red">Inactive</Badge>
                        ) : user.role && user.role.length > 0 ? (
                          user.role.map((r, idx) => (
                            <Badge key={idx} colorScheme="purple" mr={1}>
                              {r?.title}
                            </Badge>
                          ))
                        ) : (
                          <Badge colorScheme="gray">No Role</Badge>
                        )}
                      </Td>
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

export default UsersList;
