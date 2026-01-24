import {
  Box,
  Text,
  useBreakpointValue,
  Center,
  useColorModeValue,
  Stack,
  ButtonGroup,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { useApp, useUser } from "../../context/_useContext";
import { motion } from "framer-motion";
import SearchInput from "../../components/SearchInput";
import apiService from "../../services/api";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { GridView } from "../../components/Document/GridView";
import { ListView } from "../../components/Document/ListView";

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

  const greetingColor = useColorModeValue("gray.500", "gray.500");
  const dateColor = useColorModeValue("gray.400", "gray.500");

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
    if (!currentUser?.team || !Array.isArray(currentUser.team)) {
      // Fallback to empty array if no teams
      return [];
    }
    console.log(currentUser.team);
    return currentUser.team;
  }, [currentUser]);

  const updateStatsByTeam = async (teamId) => {
    setSelectedTeam(teamId);

    try {
      const res = await apiService.request(`/team-stats/${teamId}`, {
        method: "POST",
      });
      const data = await res.json();
      setTotalDocuments(data.totalDocuments);
      setPendingApprovals(data.pendingApprovals);
    } catch (err) {
      console.error(err);
      setTotalDocuments(0);
      setPendingApprovals(0);
    }
  };

  const selectedTeamName = useMemo(
    () =>
      selectedTeam === "all"
        ? "All Teams"
        : userTeams.find((t) => t.teamId === selectedTeam)?.name,
    [selectedTeam, userTeams],
  );

  return (
    <MotionBox
      px={{ base: 4, md: 8 }}
      py={6}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Stack
        spacing={4}
        flexDir={"column"}
        alignItems="center"
        justifyContent="center"
      >
        {/* Greeting Section */}
        <Center flexDir="column">
          <Text
            textAlign="center"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="300"
            color={greetingColor}
          >
            {greeting}, {currentUser?.firstName || currentUser?.name || "User"}
          </Text>
          <Text
            textAlign="center"
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="300"
            color={dateColor}
          >
            {currentDate}
          </Text>
        </Center>

        {/* Team Filter and Metrics in Button Group Style */}
        <Box>
          <ButtonGroup isAttached variant="teamStats" size="sm">
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                borderRightRadius={0}
              >
                {selectedTeamName}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => updateStatsByTeam("all")}>
                  All Teams
                </MenuItem>
                {userTeams.map((team) => (
                  <MenuItem
                    key={team.teamId}
                    onClick={() => updateStatsByTeam(team.teamId)}
                  >
                    {team.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Button as={RouterLink} to="/documents" borderRadius={0}>
              {totalDocuments} Total
            </Button>
            <Button as={RouterLink} to="/approvals" borderLeftRadius={0}>
              {pendingApprovals} Pending
            </Button>
          </ButtonGroup>
        </Box>

        {/* Search Bar */}
        <Box w="full" maxW="md">
          <SearchInput placeholder="Search documents..." />
        </Box>
      </Stack>

      {/* Recent Folders */}
      <Box mb={10}>
        <Text fontSize="xl" fontWeight="500" mb={4} color="gray.700">
          Recent Folders
        </Text>
        <GridView folderOnly documents={recentFolders} />
        <ListView folderOnly documents={recentFolders} />
      </Box>

      {/* Recent Documents */}
      <Box>
        <Text fontSize="xl" fontWeight="500" mb={4} color="gray.700">
          Recent Documents
        </Text>
        <GridView filesOnly documents={recentFiles} />
        <ListView filesOnly documents={recentFiles} />
      </Box>
    </MotionBox>
  );
};

export default Layout;
