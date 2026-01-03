import {
  Box,
  Button,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Text,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRoles } from "../../context/_useContext";
import { generateRoleDescriptions } from "../../helpers/describePermissions";
import { Link as RouterLink } from "react-router-dom";
import Pagination from "../../components/Pagination";
import RolesSkeleton from "../../components/RolesSkeleton";

const MotionBox = motion(Box);

const RolesList = () => {
  const { roles = [], loading, page, limit, total, search, setPage, setSearch } = useRoles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL on mount
  useEffect(() => {
    const urlPage = searchParams.get('page');
    const urlKeyword = searchParams.get('keyword');
    
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
      <HStack mb={4} justify="space-between">
        <Input
          placeholder="Search Roles (min. 2 characters)..."
          value={search}
          onChange={handleSearchChange}
          maxW="300px"
        />
        <HStack>
          <Text fontSize="sm" color="gray.600">
            {total > 0 && `${total} role${total !== 1 ? 's' : ''} found`}
          </Text>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={() => navigate("/roles/new")}
          >
            Create New Role
          </Button>
        </HStack>
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
                  <Th>Role Title</Th>
                  <Th>Summary</Th>
                  <Th>Last Updated</Th>
                </Tr>
              </Thead>
              <Tbody>
                {roles.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} textAlign="center" py={8}>
                      <Text color="gray.500">
                        {search && search.length >= 2 
                          ? "No roles found matching your search" 
                          : "No roles found"}
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  roles.map((role) => (
                    <LinkBox as={Tr} key={role._id || role.id}>
                      <Td fontWeight="semibold">
                        <LinkOverlay as={RouterLink} to={`/roles/${role._id || role.id}`}>
                          {role.title}
                        </LinkOverlay>

                        <Text
                          fontWeight="normal"
                          fontSize="sm"
                          noOfLines={2}
                          opacity={0.7}
                        >
                          {role.description}
                        </Text>
                      </Td>

                      <Td>
                        <Text fontWeight="normal" fontSize="sm" noOfLines={2}>
                          {generateRoleDescriptions(role.permissions).short}
                        </Text>
                      </Td>

                      <Td>
                        <Tooltip label={new Date(role.updatedAt).toLocaleString()}>
                          <Text fontSize="sm">
                            {formatDistanceToNow(new Date(role.updatedAt), {
                              addSuffix: true,
                            })}
                          </Text>
                        </Tooltip>
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
          onPageChange={setPage}
        />
      )}
    </Box>
  );
};

export default RolesList;
