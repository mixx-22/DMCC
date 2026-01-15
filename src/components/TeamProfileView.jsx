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
} from "@chakra-ui/react";
import { FiUsers } from "react-icons/fi";
import Timestamp from "./Timestamp";

const TeamProfileView = ({ team, isValidDate }) => {
  const borderColor = useColorModeValue("white", "gray.700");
  const bg = useColorModeValue("brandPrimary.600", "brandPrimary.800");
  const headerBg = useColorModeValue("brandPrimary.50", "brandPrimary.900");

  return (
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

      <Flex gap={6} flexWrap={{ base: "wrap", lg: "nowrap" }}>
        <Flex
          gap={6}
          flexWrap="wrap"
          w={{ base: "full", lg: "lg" }}
          flexDir={{ base: "column-reverse", lg: "column" }}
        >
          <Card w="full" flex={1}>
            <CardHeader pb={0}>
              <Heading size="md">
                <Text>Leaders</Text>
              </Heading>
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
                      const fullName = `${leader.firstName || ""} ${
                        leader.lastName || ""
                      }`.trim();
                      return (
                        <Tr
                          key={`leader-${leaderIndex}-${
                            leader._id || leader.id || leader.userId
                          }`}
                        >
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={fullName}
                                src={leader.profilePicture}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {fullName || "Leader"}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {leader.employeeId || "-"}
                                </Text>
                              </VStack>
                            </HStack>
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

        <Box w="full">
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Members</Heading>
            </CardHeader>
            <CardBody px={0}>
              {team.members && team.members.length > 0 ? (
                <Table variant="simple" size="sm" border="none">
                  <Tbody>
                    {team.members.map((member, memberIndex) => {
                      const fullName = `${member.firstName || ""} ${
                        member.lastName || ""
                      }`.trim();
                      return (
                        <Tr
                          key={`member-${memberIndex}-${
                            member._id || member.id || member.userId
                          }`}
                        >
                          <Td>
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
        </Box>
      </Flex>
    </Box>
  );
};

export default TeamProfileView;
