import {
  Box,
  Avatar,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Divider,
  Icon,
  Flex,
  useColorModeValue,
  CardHeader,
  Tooltip,
} from "@chakra-ui/react";
import { FiMail, FiPhone, FiBriefcase, FiUsers, FiKey } from "react-icons/fi";
import { IoIdCardOutline } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { BsPersonGear } from "react-icons/bs";
import { FaCrown } from "react-icons/fa6";
import Timestamp from "./Timestamp";

const ProfileViewMode = ({ user, roleObjects, teamObjects, isValidDate }) => {
  const borderColor = useColorModeValue("white", "gray.700");
  const bg = useColorModeValue("brandPrimary.600", "brandPrimary.800");
  const headerBg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const leaderColor = useColorModeValue(
    "brandSecondary.600",
    "brandSecondary.800",
  );

  const fullName = user
    ? `${user.firstName || ""} ${user.middleName || ""} ${
        user.lastName || ""
      }`.trim()
    : "";

  const hasSystemRole =
    roleObjects &&
    Array.isArray(roleObjects) &&
    roleObjects.some((role) => role.id === "1");

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
                name={fullName}
                icon={<Icon as={FiUsers} fontSize="4xl" />}
                borderColor={borderColor}
                borderWidth="8px"
                bg={bg}
                color="white"
              />
              {hasSystemRole && (
                <Box
                  position="absolute"
                  bottom="0"
                  right="0"
                  bg="yellow.400"
                  borderRadius="full"
                  p={2}
                  border="3px solid"
                  borderColor={bg}
                  shadow="md"
                >
                  <Icon as={FiKey} color="gray.800" boxSize={5} />
                </Box>
              )}
            </Box>

            <VStack
              align={{ base: "center", md: "flex-start" }}
              flex={1}
              spacing={2}
            >
              <Heading size="xl">{fullName}</Heading>
              <Text color="gray.600" fontSize="md" fontWeight="medium">
                {user.employeeId}
                {user?.position ? <> &middot; {user.position}</> : ""}
              </Text>
              <HStack
                spacing={2}
                flexWrap="wrap"
                justify={{ base: "center", md: "flex-start" }}
              >
                {!user.isActive && (
                  <Badge colorScheme="red" fontSize="sm">
                    Inactive
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Flex>
        </CardBody>
      </Card>

      <Flex gap={6} flexWrap={{ base: "wrap", lg: "nowrap" }}>
        <Box w={{ base: "full", lg: "lg" }}>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">Basic Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack spacing={3}>
                  <Icon as={FiMail} color="gray.500" boxSize={5} />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500">
                      Email
                    </Text>
                    <Text fontWeight="medium">{user.email}</Text>
                  </Box>
                </HStack>

                <Divider />

                <HStack spacing={3}>
                  <Icon as={FiPhone} color="gray.500" boxSize={5} />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500">
                      Contact Number
                    </Text>
                    <Text fontWeight="medium">
                      {user.contactNumber || "Not provided"}
                    </Text>
                  </Box>
                </HStack>

                <Divider />

                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Username
                  </Text>
                  <Text fontWeight="medium">@{user.username}</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Box>

        <Box w="full">
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" mb={2}>
                  Professional Details
                </Heading>

                <HStack spacing={3}>
                  <Icon
                    sx={{ ">rect": { strokeWidth: "36px" } }}
                    as={IoIdCardOutline}
                    color="gray.500"
                    boxSize={5}
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500">
                      Employee ID / Number
                    </Text>
                    <Text fontWeight="medium">
                      {user.employeeId || "Not specified"}
                    </Text>
                  </Box>
                </HStack>

                <Divider />
                <HStack spacing={3}>
                  <Icon as={FiBriefcase} color="gray.500" boxSize={5} />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500">
                      Position
                    </Text>
                    <Text fontWeight="medium">
                      {user.position || "Not specified"}
                    </Text>
                  </Box>
                </HStack>

                <Divider />

                <HStack spacing={3} align="flex-start">
                  <Icon
                    strokeWidth="2px"
                    as={HiOutlineUserGroup}
                    color="gray.500"
                    boxSize={5}
                    mt={1}
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Teams
                    </Text>
                    <HStack wrap="wrap" spacing={2}>
                      {teamObjects && teamObjects.length > 0 ? (
                        teamObjects.map((t) => (
                          <Tooltip
                            hasArrow
                            key={t.id || t._id}
                            label={`${user.firstName} is a ${t.teamLeader ? "team leader for" : "member of"} ${t.name}`}
                          >
                            <Badge colorScheme="blue">
                              {t.teamLeader && (
                                <Icon
                                  as={FaCrown}
                                  color={leaderColor}
                                  boxSize={2.5}
                                  mr={1}
                                />
                              )}
                              {t.name}
                            </Badge>
                          </Tooltip>
                        ))
                      ) : (
                        <Badge colorScheme="gray">No Team Assigned</Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>

                <Divider />
                <HStack spacing={3} align="flex-start">
                  <Icon
                    strokeWidth=".3px"
                    as={BsPersonGear}
                    color="gray.500"
                    boxSize={5}
                    mt={1}
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Roles
                    </Text>
                    <HStack wrap="wrap" spacing={2}>
                      {roleObjects && roleObjects.length > 0 ? (
                        roleObjects.map((r) => (
                          <Badge key={r.id || r._id} colorScheme="purple">
                            {r.title}
                          </Badge>
                        ))
                      ) : (
                        <Badge colorScheme="gray">No Role Assigned</Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>

                {isValidDate(user.createdAt) && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="gray.500" mb={1}>
                        Member Since
                      </Text>
                      <Text fontWeight="medium" fontSize="sm">
                        <Timestamp date={user.createdAt} />
                      </Text>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

export default ProfileViewMode;
