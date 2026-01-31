import {
  Box,
  Avatar,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Icon,
  Flex,
  useColorModeValue,
  CardHeader,
  Table,
  Tbody,
  Tr,
  Td,
  Link,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Center,
  Stack,
  Spinner,
  IconButton,
  Spacer,
  Tooltip,
} from "@chakra-ui/react";
import { FiUsers, FiTarget, FiFolder, FiExternalLink } from "react-icons/fi";
import { useState, useEffect } from "react";
import Timestamp from "./Timestamp";
import { Link as RouterLink } from "react-router-dom";
import { useDocuments, useLayout } from "../context/_useContext";
import { GridView } from "./Document/GridView";
import DocumentDrawer from "./Document/DocumentDrawer";
import TeamQualityDocuments from "./TeamQualityDocuments";

const TeamProfileView = ({ team, isValidDate, onManageObjectives }) => {
  const borderColor = useColorModeValue("white", "gray.700");
  const bg = useColorModeValue("brandPrimary.600", "brandPrimary.800");
  const headerBg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const objectiveBg = useColorModeValue("gray.50", "gray.700");

  const { selectedDocument, closeDocumentDrawer, handleDocumentClick } =
    useLayout();

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  const {
    fetchDocuments,
    folder,
    documents,
    loading: loadingDocuments,
  } = useDocuments();
  const [loadingFolder, setLoadingFolder] = useState(false);

  useEffect(() => {
    const loadFolderContents = async () => {
      if (team?.folderId && tabIndex === 2) {
        setLoadingFolder(true);
        try {
          await fetchDocuments(team.folderId);
        } catch (error) {
          console.error("Failed to load folder contents:", error);
        } finally {
          setLoadingFolder(false);
        }
      }
    };

    loadFolderContents();
  }, [team.folderId, fetchDocuments, tabIndex]);

  const WEIGHT_COLORS = {
    low: "green",
    medium: "yellow",
    high: "red",
  };

  return (
    <>
      <Box>
        <Card mb={6} overflow="hidden">
          <Box h="120px" bg={headerBg} position="relative" />

          <CardBody mt="-60px" position="relative">
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "center", md: "flex-start" }}
              gap={6}
            >
              <Box position="relative">
                <Avatar
                  size="2xl"
                  name={team.name}
                  icon={<Icon as={FiUsers} fontSize="4xl" />}
                  borderColor={borderColor}
                  borderWidth="8px"
                  bg={bg}
                  color="white"
                />
              </Box>

              <VStack
                align={{ base: "center", md: "flex-start" }}
                flex={1}
                spacing={2}
              >
                <Heading size="xl">{team.name}</Heading>
                <Text color="gray.600" fontSize="md">
                  {team.description || "No description provided"}
                </Text>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        <Tabs
          colorScheme="brandPrimary"
          index={tabIndex}
          onChange={handleTabsChange}
        >
          <TabList>
            <Tab>Info</Tab>
            <Tab>Objectives</Tab>
            <Tab>Quality Documents</Tab>
            <Tab>Other Documents</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <Flex
                gap={6}
                flexWrap={{ base: "wrap", lg: "nowrap" }}
                alignItems={"flex-start"}
              >
                <Flex
                  gap={6}
                  flexWrap="wrap"
                  w={{ base: "full", lg: "xs" }}
                  flexDir={{ base: "column-reverse", lg: "column" }}
                >
                  <Card w="full" flex={1}>
                    <CardHeader pb={0}>
                      <Heading size="md">Leaders</Heading>
                    </CardHeader>
                    <CardBody px={0}>
                      {team.leaders && team.leaders.length > 0 ? (
                        <Table
                          variant="simple"
                          size="sm"
                          border="none"
                          sx={{ td: { px: 5 } }}
                        >
                          <Tbody>
                            {team.leaders.map((leader, leaderIndex) => {
                              const leaderId =
                                leader.id || leader._id || leader.userId;
                              const fullName = `${leader.firstName || ""} ${
                                leader.lastName || ""
                              }`.trim();
                              return (
                                <Tr key={`leader-${leaderIndex}-${leaderId}`}>
                                  <Td>
                                    {leaderId ? (
                                      <Link
                                        as={RouterLink}
                                        to={`/users/${leaderId}`}
                                        _hover={{ textDecoration: "none" }}
                                      >
                                        <HStack
                                          spacing={3}
                                          _hover={{ opacity: 0.8 }}
                                        >
                                          <Avatar
                                            size="sm"
                                            name={fullName}
                                            src={leader.profilePicture}
                                          />
                                          <VStack align="start" spacing={0}>
                                            <Text
                                              fontSize="sm"
                                              fontWeight="medium"
                                            >
                                              {fullName || "Leader"}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color="gray.500"
                                            >
                                              {leader.employeeId || "-"}
                                            </Text>
                                          </VStack>
                                        </HStack>
                                      </Link>
                                    ) : (
                                      <HStack spacing={3}>
                                        <Avatar
                                          size="sm"
                                          name={fullName}
                                          src={leader.profilePicture}
                                        />
                                        <VStack align="start" spacing={0}>
                                          <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                          >
                                            {fullName || "Leader"}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            {leader.employeeId || "-"}
                                          </Text>
                                        </VStack>
                                      </HStack>
                                    )}
                                  </Td>
                                  <Td></Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      ) : (
                        <Text color="gray.500" py={4} textAlign="center">
                          No leaders assigned
                        </Text>
                      )}
                    </CardBody>
                  </Card>
                  <Card w="full" flex={1}>
                    <CardBody>
                      <Flex gap={6} flexDir={{ base: "row", lg: "column" }}>
                        {isValidDate(team.createdAt) && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Team Created
                            </Text>
                            <Text fontWeight="medium" fontSize="sm">
                              <Timestamp date={team.createdAt} />
                            </Text>
                          </Box>
                        )}
                        {isValidDate(team.updatedAt) && (
                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={1}>
                              Last Updated
                            </Text>
                            <Text fontWeight="medium" fontSize="sm">
                              <Timestamp date={team.updatedAt} />
                            </Text>
                          </Box>
                        )}
                      </Flex>
                    </CardBody>
                  </Card>
                </Flex>

                <Card flex={1} w="full">
                  <CardHeader pb={0}>
                    <Heading size="md">Members</Heading>
                  </CardHeader>
                  <CardBody px={0}>
                    {team.members && team.members.length > 0 ? (
                      <Table
                        variant="simple"
                        size="sm"
                        border="none"
                        sx={{ td: { px: 5 } }}
                      >
                        <Tbody>
                          {team.members.map((member, memberIndex) => {
                            const memberId =
                              member.id || member._id || member.userId;
                            const fullName = `${member.firstName || ""} ${
                              member.lastName || ""
                            }`.trim();
                            return (
                              <Tr key={`member-${memberIndex}-${memberId}`}>
                                <Td>
                                  {memberId ? (
                                    <Link
                                      as={RouterLink}
                                      to={`/users/${memberId}`}
                                      _hover={{ textDecoration: "none" }}
                                    >
                                      <HStack
                                        spacing={3}
                                        _hover={{ opacity: 0.8 }}
                                      >
                                        <Avatar
                                          size="sm"
                                          name={fullName}
                                          src={member.profilePicture}
                                        />
                                        <VStack align="start" spacing={0}>
                                          <Text
                                            fontSize="sm"
                                            fontWeight="medium"
                                          >
                                            {fullName || "Member"}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            {member.employeeId || "-"}
                                          </Text>
                                        </VStack>
                                      </HStack>
                                    </Link>
                                  ) : (
                                    <HStack spacing={3}>
                                      <Avatar
                                        size="sm"
                                        name={fullName}
                                        src={member.profilePicture}
                                      />
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {fullName || "Member"}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {member.employeeId || "-"}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  )}
                                </Td>
                                <Td></Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text color="gray.500" py={4} textAlign="center">
                        No members assigned
                      </Text>
                    )}
                  </CardBody>
                </Card>
              </Flex>
            </TabPanel>

            <TabPanel px={0}>
              <Flex justify="flex-end" mb={4}>
                <Button
                  leftIcon={<FiTarget />}
                  variant="outline"
                  colorScheme="brandPrimary"
                  onClick={onManageObjectives}
                  size="sm"
                >
                  Manage Objectives
                </Button>
              </Flex>
              <Card w="full">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    {team.objectives && team.objectives.length > 0 ? (
                      <Stack spacing={4}>
                        {team.objectives.map((objective, index) => (
                          <Box key={objective.id || `objective-${index}`}>
                            <Box
                              p={4}
                              borderWidth={1}
                              borderRadius="md"
                              borderColor={borderColor}
                              bg={objectiveBg}
                            >
                              <Flex
                                justify="space-between"
                                align="start"
                                mb={2}
                              >
                                <Text fontWeight="bold" fontSize="md">
                                  {objective.title}
                                </Text>
                                <Badge
                                  colorScheme={WEIGHT_COLORS[objective.weight]}
                                  ml={2}
                                >
                                  {objective.weight}
                                </Badge>
                              </Flex>
                              <Text fontSize="sm" color="gray.600">
                                {objective.description}
                              </Text>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Center flexDir="column" gap={2} minH="xs">
                        <Text color="gray.500" textAlign="center">
                          No objectives defined
                        </Text>
                        <Button
                          leftIcon={<FiTarget />}
                          variant="outline"
                          colorScheme="brandPrimary"
                          onClick={onManageObjectives}
                          size="sm"
                        >
                          Manage Objectives
                        </Button>
                      </Center>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel px={0}>
              <TeamQualityDocuments teamId={team._id || team.id} />
            </TabPanel>

            <TabPanel px={0} pt={0}>
              {team.folderId && (
                <HStack px={0} py={4} alignItems="center">
                  <Text fontSize="sm" color="gray.500">
                    {loadingDocuments
                      ? `Loading Team Documents`
                      : (folder?.title ?? `${team?.title}'s Documents`)}
                  </Text>
                  <Spacer />
                  <Tooltip label="Open Folder in New Tab">
                    <IconButton
                      isRound
                      size="xs"
                      variant="ghost"
                      colorScheme="brandPrimary"
                      as={RouterLink}
                      icon={<FiExternalLink />}
                      to={`/documents/folders/${team.folderId}`}
                    />
                  </Tooltip>
                </HStack>
              )}
              {team.folderId ? (
                loadingFolder || loadingDocuments ? (
                  <Center minH="xs">
                    <VStack>
                      <Spinner size="lg" />
                      <Text color="gray.500">Loading documents...</Text>
                    </VStack>
                  </Center>
                ) : documents && documents.length > 0 ? (
                  <Card>
                    <CardBody>
                      <GridView
                        mini={true}
                        documents={documents}
                        selectedDocument={selectedDocument}
                        onDocumentClick={(doc) => {
                          handleDocumentClick(doc);
                        }}
                      />
                    </CardBody>
                  </Card>
                ) : (
                  <Center minH="xs">
                    <VStack spacing={2}>
                      <Icon as={FiFolder} boxSize={12} color="gray.400" />
                      <Text color="gray.500" textAlign="center">
                        This folder is empty
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Documents will appear here when added to the team folder
                      </Text>
                    </VStack>
                  </Center>
                )
              ) : (
                <Center minH="xs">
                  <VStack spacing={4}>
                    <Icon as={FiFolder} boxSize={12} color="gray.400" />
                    <Text color="gray.500" textAlign="center">
                      No documents folder configured
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      Edit the team to set up a documents folder
                    </Text>
                  </VStack>
                </Center>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <DocumentDrawer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={closeDocumentDrawer}
      />
    </>
  );
};

export default TeamProfileView;
