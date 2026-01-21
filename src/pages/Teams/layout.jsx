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
  Avatar,
  AvatarGroup,
  useColorModeValue,
  Tooltip,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { useTeams } from "../../context/_useContext";
import Pagination from "../../components/Pagination";
import { FiSearch } from "react-icons/fi";

const MotionBox = motion(Box);

const TeamsList = () => {
  const {
    teams,
    loading,
    error,
    page,
    limit,
    total,
    search,
    setPage,
    setSearch,
  } = useTeams();
  const [searchParams, setSearchParams] = useSearchParams();
  const teamList = Array.isArray(teams?.data) ? teams.data : [];
  const avatarBorderColor = useColorModeValue("gray.50", "gray.800");

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

  // Loading skeleton
  if (loading && teamList.length === 0) {
    return (
      <Box>
        <HStack mb={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none" color="gray.400">
              <FiSearch />
            </InputLeftElement>
            <Input
              value={search}
              placeholder="Start searching for Teams..."
              isDisabled
            />
          </InputGroup>
        </HStack>
        <Box p={8} textAlign="center">
          <Text>Loading teams...</Text>
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
            placeholder="Start searching for Teams..."
            value={search}
            onChange={handleSearchChange}
          />
        </InputGroup>
        <Spacer display={{ base: "none", md: "block" }} />
        <Text fontSize="sm" color="gray.600" flex={{ base: "1", md: "none" }}>
          {total > 0
            ? `Showing ${teamList?.length} of ${total} Team${
                total !== 1 ? "s" : ""
              }`
            : `No Teams Available`}
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
                <Th>Team Name</Th>
                <Th>Description</Th>
                <Th textAlign="right">Members</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamList.length === 0 ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={8}>
                    <Text color="gray.500">
                      {search && search.length >= 2
                        ? "No teams found matching your search"
                        : "No teams found"}
                    </Text>
                  </Td>
                </Tr>
              ) : (
                teamList.map((team, teamIndex) => {
                  const teamId = team._id || team.id;
                  const allMembers = [
                    ...(team.leaders || []),
                    ...(team.members || []),
                  ];
                  return (
                    <LinkBox as={Tr} key={`team-${teamIndex}-${teamId}`}>
                      <Td>
                        <LinkOverlay as={RouterLink} to={`/teams/${teamId}`}>
                          <HStack w="fit-content">
                            <Avatar size="sm" name={team.name} />
                            <Text as="span">{team.name}</Text>
                          </HStack>
                        </LinkOverlay>
                      </Td>
                      <Td>
                        <Text noOfLines={2} maxW="400px">
                          {team.description || "-"}
                        </Text>
                      </Td>
                      <Td textAlign="right">
                        {allMembers.length > 0 ? (
                          <HStack justify="flex-end">
                            <AvatarGroup size="sm" max={3}>
                              {allMembers.map((member, memberIndex) => {
                                const memberId =
                                  member.id || member._id || member.userId;
                                const fullName = `${member.firstName || ""} ${
                                  member.lastName || ""
                                }`.trim();
                                
                                if (!memberId) {
                                  return (
                                    <Tooltip key={`member-${memberIndex}-no-id`} label={fullName}>
                                      <Avatar
                                        name={fullName}
                                        src={member?.profilePicture}
                                        borderColor={avatarBorderColor}
                                      />
                                    </Tooltip>
                                  );
                                }
                                
                                return (
                                  <Tooltip key={`member-${memberIndex}-${memberId}`} label={fullName}>
                                    <Link
                                      as={RouterLink}
                                      to={`/users/${memberId}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Avatar
                                        name={fullName}
                                        src={member?.profilePicture}
                                        borderColor={avatarBorderColor}
                                        cursor="pointer"
                                        _hover={{ opacity: 0.8 }}
                                      />
                                    </Link>
                                  </Tooltip>
                                );
                              })}
                            </AvatarGroup>
                            <Badge colorScheme="brandPrimary">
                              {allMembers.length}
                            </Badge>
                          </HStack>
                        ) : (
                          <Badge colorScheme="gray">No members</Badge>
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

export default TeamsList;
