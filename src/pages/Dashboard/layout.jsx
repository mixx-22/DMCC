import {
  Box,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Select,
  useBreakpointValue,
  Center,
  Link,
  Flex,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { useApp, useUser } from "../../context/_useContext";
import { motion } from "framer-motion";
import AuptilyzeFolder from "../../components/AuptilyzeFolder";
import SearchInput from "../../components/SearchInput";
import { getDocumentIcon } from "../../components/Document/DocumentIcon";
import apiService from "../../services/api";

const MotionBox = motion(Box);

const Layout = () => {
  const { documents } = useApp();
  const { user: currentUser } = useUser();
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [greeting, setGreeting] = useState("");
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [recentFolders, setRecentFolders] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);

  // Refs to prevent multiple fetches
  const foldersLoadedRef = useRef(false);
  const filesLoadedRef = useRef(false);

  // Responsive limits for items
  const folderLimit = useBreakpointValue({ base: 4, sm: 6, lg: 8 });
  const fileLimit = useBreakpointValue({ base: 4, sm: 6, lg: 8 });

  // Generate time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    const greetings = [
      { range: [0, 5], text: "Good night" },
      { range: [5, 12], text: "Good morning" },
      { range: [12, 17], text: "Good afternoon" },
      { range: [17, 22], text: "Good evening" },
      { range: [22, 24], text: "Good night" },
    ];

    const currentGreeting = greetings.find(
      (g) => hour >= g.range[0] && hour < g.range[1],
    );
    setGreeting(currentGreeting?.text || "Hello");
  }, []);

  // Get current date formatted
  const currentDate = format(new Date(), "EEEE, MMMM d");

  // Filter documents by team
  const filteredDocuments = useMemo(() => {
    if (selectedTeam === "all") {
      return documents;
    }
    // Filter by team - documents may have team or department property
    return documents.filter(
      (doc) => doc.team === selectedTeam || doc.department === selectedTeam,
    );
  }, [documents, selectedTeam]);

  // Calculate metrics
  useEffect(() => {
    const pending = filteredDocuments.filter(
      (doc) => doc.status === "pending",
    ).length;
    setPendingApprovals(pending);
    setTotalDocuments(filteredDocuments.length);
  }, [filteredDocuments]);

  // Fetch recent folders from API - only once
  useEffect(() => {
    const fetchRecentFolders = async () => {
      if (!folderLimit || foldersLoadedRef.current) return;
      foldersLoadedRef.current = true;

      try {
        // GET /recent-documents?type=folder&page=1&limit=n
        const response = await apiService.request("/recent-documents", {
          method: "GET",
          params: {
            type: "folder",
            page: 1,
            limit: folderLimit,
          },
        });

        const folders = response.data || response.documents || [];
        setRecentFolders(Array.isArray(folders) ? folders : []);
      } catch (error) {
        console.error("Failed to fetch recent folders:", error);
        // Fallback to mock data on error
        const mockFolders = [
          {
            id: 1,
            _id: "1",
            title: "Engineering Documents",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            _id: "2",
            title: "HR Policies",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            _id: "3",
            title: "Marketing Materials",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            _id: "4",
            title: "Finance Reports",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 5,
            _id: "5",
            title: "Operations",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 6,
            _id: "6",
            title: "Sales Proposals",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 7,
            _id: "7",
            title: "Product Specs",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 8,
            _id: "8",
            title: "Customer Support",
            type: "folder",
            updatedAt: new Date().toISOString(),
          },
        ].slice(0, folderLimit);
        setRecentFolders(mockFolders);
      }
    };

    fetchRecentFolders();
  }, [folderLimit]);

  // Fetch recent files from API - only once
  useEffect(() => {
    const fetchRecentFiles = async () => {
      if (!fileLimit || filesLoadedRef.current) return;
      filesLoadedRef.current = true;

      try {
        // GET /recent-documents?type=file&page=1&limit=n
        const response = await apiService.request("/recent-documents", {
          method: "GET",
          params: {
            type: "file",
            page: 1,
            limit: fileLimit,
          },
        });

        const files = response.data || response.documents || [];
        setRecentFiles(Array.isArray(files) ? files : []);
      } catch (error) {
        console.error("Failed to fetch recent files:", error);
        // Fallback to filtered documents on error
        const mockFiles = filteredDocuments.slice(0, fileLimit).map((doc) => ({
          ...doc,
          id: doc.id || doc._id,
          title: doc.title || doc.name || "Untitled",
          type: doc.type || "file",
        }));
        setRecentFiles(mockFiles);
      }
    };

    fetchRecentFiles();
  }, [fileLimit, filteredDocuments]);

  // Get user teams from the current user object
  const userTeams = useMemo(() => {
    // Check if user has teams property and it's an array
    if (!currentUser?.teams || !Array.isArray(currentUser.teams)) {
      // Fallback to empty array if no teams
      return [];
    }
    return currentUser.teams;
  }, [currentUser]);

  return (
    <MotionBox
      px={{ base: 4, md: 8 }}
      py={6}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Greeting Section */}
      <VStack align="start" spacing={1} mb={6}>
        <Text
          fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
          fontWeight="300"
          color="gray.800"
        >
          {greeting}, {currentUser?.firstName || currentUser?.name || "User"}
        </Text>
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color="gray.500"
          fontWeight="300"
        >
          {currentDate}
        </Text>
      </VStack>

      {/* Team Filter and Metrics in Button Group Style */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={10}
        align={{ base: "stretch", md: "center" }}
        bg="white"
        p={4}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px"
        borderColor="gray.200"
      >
        {/* Team Dropdown */}
        <Box flex={{ base: "1", md: "0 0 250px" }}>
          <Select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            size="lg"
            variant="filled"
            bg="gray.50"
            borderRadius="lg"
            fontWeight="500"
            _hover={{ bg: "gray.100" }}
            _focus={{ bg: "white", borderColor: "blue.400" }}
          >
            <option value="all">All Teams</option>
            {userTeams.map((team) => (
              <option key={team._id} value={team.name}>
                {team.name}
              </option>
            ))}
          </Select>
        </Box>

        {/* Metrics Cards in Horizontal Layout */}
        <Flex flex="1" gap={4} direction={{ base: "column", sm: "row" }}>
          <Box flex="1">
            <Card
              bgGradient="linear(to-br, blue.500, blue.600)"
              color="white"
              borderRadius="xl"
              overflow="hidden"
              h="full"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.3s"
            >
              <CardBody p={6}>
                <VStack align="start" spacing={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="500"
                    opacity={0.9}
                    textTransform="uppercase"
                  >
                    Pending Approvals
                  </Text>
                  <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700">
                    {pendingApprovals}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          <Box flex="1">
            <Card
              bgGradient="linear(to-br, purple.500, purple.600)"
              color="white"
              borderRadius="xl"
              overflow="hidden"
              h="full"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.3s"
            >
              <CardBody p={6}>
                <VStack align="start" spacing={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="500"
                    opacity={0.9}
                    textTransform="uppercase"
                  >
                    Total Documents
                  </Text>
                  <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700">
                    {totalDocuments}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Flex>

      {/* Search Bar */}
      <Box mb={6}>
        <SearchInput placeholder="Search documents..." />
      </Box>

      {/* Recent Folders */}
      <Box mb={10}>
        <Text fontSize="xl" fontWeight="500" mb={4} color="gray.700">
          Recent Folders
        </Text>
        <SimpleGrid columns={{ base: 2, sm: 3, lg: 4 }} spacing={4}>
          {recentFolders.map((folder) => {
            // Guard clause for folder.id
            const folderId = folder?.id || folder?._id;
            if (!folderId) return null;

            return (
              <Link
                key={folderId}
                as={RouterLink}
                to={`/documents/folders/${folderId}`}
                style={{ textDecoration: "none" }}
              >
                <Box
                  py={4}
                  cursor="pointer"
                  position="relative"
                  borderRadius="xl"
                  transition="all 0.2s"
                  _hover={{
                    bg: "gray.50",
                  }}
                >
                  <VStack align="start" spacing={1}>
                    <Center w="full">
                      <AuptilyzeFolder
                        boxSize={{ base: 14, md: 16 }}
                        filter="drop-shadow(0 2px 2px rgba(0, 0, 0, .15))"
                        _hover={{
                          filter: "drop-shadow(0 4px 2px rgba(0, 0, 0, .15))",
                        }}
                      />
                    </Center>
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      color="gray.800"
                      noOfLines={1}
                      w="full"
                      textAlign="center"
                    >
                      {folder.title || folder.name || "Untitled"}
                    </Text>
                  </VStack>
                </Box>
              </Link>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Recent Documents */}
      <Box>
        <Text fontSize="xl" fontWeight="500" mb={4} color="gray.700">
          Recent Documents
        </Text>
        <SimpleGrid columns={{ base: 2, sm: 3, lg: 4 }} spacing={4}>
          {recentFiles.map((file) => {
            const fileId = file?.id || file?._id;
            if (!fileId) return null;

            return (
              <Link
                key={fileId}
                as={RouterLink}
                to={`/document/${fileId}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  borderRadius="xl"
                  cursor="pointer"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s"
                  bg="white"
                  border="1px"
                  borderColor="gray.200"
                >
                  <CardBody p={4}>
                    <VStack align="start" spacing={2}>
                      {getDocumentIcon(file)}
                      <Text
                        fontSize="sm"
                        fontWeight="500"
                        color="gray.800"
                        noOfLines={2}
                        w="full"
                      >
                        {file.title || file.name || "Untitled"}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </SimpleGrid>
      </Box>
    </MotionBox>
  );
};

export default Layout;
