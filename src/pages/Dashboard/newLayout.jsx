import {
  Box,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Select,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useApp } from "../../context/_useContext";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionText = motion(Text);

const NewLayout = () => {
  const { currentUser, documents } = useApp();
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [greeting, setGreeting] = useState("");
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [recentFolders, setRecentFolders] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);

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
      (g) => hour >= g.range[0] && hour < g.range[1]
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
    return documents.filter((doc) => doc.team === selectedTeam || doc.department === selectedTeam);
  }, [documents, selectedTeam]);

  // Calculate metrics
  useEffect(() => {
    const pending = filteredDocuments.filter(
      (doc) => doc.status === "pending"
    ).length;
    setPendingApprovals(pending);
    setTotalDocuments(filteredDocuments.length);
  }, [filteredDocuments]);

  // Mock fetch recent folders
  useEffect(() => {
    // In a real app, this would be an API call:
    // GET /recent-documents?type=folder&page=1&limit=${folderLimit}
    const mockFolders = [
      { id: 1, name: "Engineering Documents", updatedAt: new Date() },
      { id: 2, name: "HR Policies", updatedAt: new Date() },
      { id: 3, name: "Marketing Materials", updatedAt: new Date() },
      { id: 4, name: "Finance Reports", updatedAt: new Date() },
      { id: 5, name: "Operations", updatedAt: new Date() },
      { id: 6, name: "Sales Proposals", updatedAt: new Date() },
      { id: 7, name: "Product Specs", updatedAt: new Date() },
      { id: 8, name: "Customer Support", updatedAt: new Date() },
    ].slice(0, folderLimit);
    setRecentFolders(mockFolders);
  }, [folderLimit]);

  // Mock fetch recent files
  useEffect(() => {
    // In a real app, this would be an API call:
    // GET /recent-documents?type=file&page=1&limit=${fileLimit}
    const mockFiles = filteredDocuments
      .slice(0, fileLimit)
      .map((doc) => ({
        id: doc.id,
        name: doc.title || doc.name || "Untitled",
        updatedAt: doc.lastModifiedAt || doc.createdAt || new Date().toISOString(),
        type: doc.category || doc.type || "Document",
      }));
    setRecentFiles(mockFiles);
  }, [filteredDocuments, fileLimit]);

  // Mock user teams for now
  const userTeams = useMemo(() => {
    // Mock teams data
    return [
      { _id: "team-1", name: "Engineering Team" },
      { _id: "team-2", name: "Design Team" },
      { _id: "team-3", name: "Marketing Team" },
    ];
  }, []);

  return (
    <Box px={{ base: 4, md: 8 }} py={6}>
      {/* Greeting Section */}
      <VStack align="start" spacing={1} mb={8}>
        <MotionText
          fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
          fontWeight="300"
          color="gray.800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {greeting}, {currentUser?.name || "User"}
        </MotionText>
        <Text fontSize={{ base: "md", md: "lg" }} color="gray.500" fontWeight="300">
          {currentDate}
        </Text>
      </VStack>

      {/* Team Filter */}
      <Box mb={6} maxW="300px">
        <Select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          size="lg"
          variant="filled"
          bg="gray.50"
          borderRadius="lg"
          fontWeight="400"
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

      {/* Metrics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card
            bgGradient="linear(to-br, blue.500, blue.600)"
            color="white"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="lg"
            _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
            transition="all 0.3s"
          >
            <CardBody p={8}>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="500" opacity={0.9}>
                  Pending Approvals
                </Text>
                <AnimatePresence mode="wait">
                  <MotionText
                    key={pendingApprovals}
                    fontSize={{ base: "4xl", md: "5xl" }}
                    fontWeight="200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {pendingApprovals}
                  </MotionText>
                </AnimatePresence>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card
            bgGradient="linear(to-br, purple.500, purple.600)"
            color="white"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="lg"
            _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
            transition="all 0.3s"
          >
            <CardBody p={8}>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="500" opacity={0.9}>
                  Total Documents
                </Text>
                <AnimatePresence mode="wait">
                  <MotionText
                    key={totalDocuments}
                    fontSize={{ base: "4xl", md: "5xl" }}
                    fontWeight="200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {totalDocuments}
                  </MotionText>
                </AnimatePresence>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </SimpleGrid>

      {/* Recent Folders */}
      <Box mb={10}>
        <Text fontSize="xl" fontWeight="500" mb={4} color="gray.700">
          Recent Folders
        </Text>
        <SimpleGrid columns={{ base: 2, sm: 3, lg: 4 }} spacing={4}>
          {recentFolders.map((folder, index) => (
            <MotionBox
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                borderRadius="xl"
                overflow="hidden"
                cursor="pointer"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                  bg: "blue.50",
                }}
                transition="all 0.2s"
                bg="white"
                border="1px"
                borderColor="gray.200"
              >
                <CardBody p={4}>
                  <VStack align="start" spacing={1}>
                    <Box
                      fontSize="3xl"
                      color="blue.500"
                      mb={1}
                    >
                      📁
                    </Box>
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      color="gray.800"
                      noOfLines={1}
                    >
                      {folder.name}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Box>

      {/* Recent Documents */}
      <Box>
        <Text fontSize="xl" fontWeight="500" mb={4} color="gray.700">
          Recent Documents
        </Text>
        <SimpleGrid columns={{ base: 2, sm: 3, lg: 4 }} spacing={4}>
          {recentFiles.map((file, index) => (
            <MotionBox
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                borderRadius="xl"
                overflow="hidden"
                cursor="pointer"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                  bg: "purple.50",
                }}
                transition="all 0.2s"
                bg="white"
                border="1px"
                borderColor="gray.200"
              >
                <CardBody p={4}>
                  <VStack align="start" spacing={1}>
                    <Box
                      fontSize="3xl"
                      color="purple.500"
                      mb={1}
                    >
                      📄
                    </Box>
                    <Text
                      fontSize="sm"
                      fontWeight="500"
                      color="gray.800"
                      noOfLines={1}
                    >
                      {file.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {file.type}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default NewLayout;
