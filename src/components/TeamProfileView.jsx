import {
  Box,
  Avatar,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  Icon,
  Flex,
  useColorModeValue,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { FiUsers, FiFileText } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const TeamProfileView = ({ team, isValidDate }) => {
  const bg = useColorModeValue("white", "gray.800");
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
                border="4px solid"
                borderColor={bg}
                shadow="lg"
                bg="brandPrimary.500"
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
        <Box w={{ base: "full", lg: "lg" }}>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">
                <HStack>
                  <Icon as={FiUsers} />
                  <Text>Leaders</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              {team.leaders && team.leaders.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Employee ID</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {team.leaders.map((leader) => {
                      const fullName = `${leader.firstName || ""} ${
                        leader.lastName || ""
                      }`.trim();
                      return (
                        <Tr key={leader._id || leader.id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={fullName}
                                src={leader.profilePicture}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {fullName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {leader.email}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {leader.employeeId || "-"}
                            </Text>
                          </Td>
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
        </Box>

        <Box w="full">
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">
                <HStack>
                  <Icon as={FiUsers} />
                  <Text>Members</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              {team.members && team.members.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Employee ID</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {team.members.map((member) => {
                      const fullName = `${member.firstName || ""} ${
                        member.lastName || ""
                      }`.trim();
                      return (
                        <Tr key={member._id || member.id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={fullName}
                                src={member.profilePicture}
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {fullName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {member.email}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {member.employeeId || "-"}
                            </Text>
                          </Td>
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

              {isValidDate(team.createdAt) && (
                <>
                  <Divider my={4} />
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Team Created
                    </Text>
                    <Text fontWeight="medium" fontSize="sm">
                      {new Date(team.createdAt).toLocaleDateString()}{" "}
                      <Text as="span" fontSize="xs" color="gray.500">
                        (
                        {formatDistanceToNow(new Date(team.createdAt), {
                          addSuffix: true,
                        })}
                        )
                      </Text>
                    </Text>
                  </Box>
                </>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

export default TeamProfileView;
