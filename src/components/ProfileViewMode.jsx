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
} from "@chakra-ui/react";
import { FiMail, FiPhone, FiBriefcase, FiUsers, FiKey } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const ProfileViewMode = ({ user, roleObjects, isValidDate }) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("brandPrimary.50", "brandPrimary.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const fullName = user
    ? `${user.firstName || ""} ${user.middleName || ""} ${
        user.lastName || ""
      }`.trim()
    : "";

  // Check if user has a system role (Admin = id "1")
  const hasSystemRole =
    user.role && Array.isArray(user.role) && user.role.includes("1");

  return (
    <Box>
      {/* Profile Header Card */}
      <Card mb={6} overflow="hidden">
        {/* Header Background */}
        <Box h="120px" bg={headerBg} position="relative" />

        {/* Profile Content */}
        <CardBody mt="-60px" position="relative">
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            gap={6}
          >
            {/* Profile Picture with Badge */}
            <Box position="relative">
              <Avatar
                size="2xl"
                name={fullName}
                src={user.profilePicture}
                border="4px solid"
                borderColor={bg}
                shadow="lg"
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

            {/* Profile Info */}
            <VStack align={{ base: "center", md: "flex-start" }} flex={1} spacing={2}>
              <Heading size="xl">{fullName}</Heading>
              <HStack spacing={4} flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
                <HStack>
                  <Icon as={FiMail} color="gray.500" />
                  <Text color="gray.600">{user.email}</Text>
                </HStack>
                <Badge colorScheme={user.isActive ? "green" : "red"} fontSize="sm">
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </HStack>
              <HStack spacing={2} flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
                {roleObjects && roleObjects.length > 0 ? (
                  roleObjects.map((r, idx) => (
                    <Badge key={idx} colorScheme="purple" fontSize="sm">
                      {r.title}
                    </Badge>
                  ))
                ) : (
                  <Badge colorScheme="gray" fontSize="sm">
                    No Role Assigned
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Details Grid */}
      <Flex gap={6} flexWrap={{ base: "wrap", lg: "nowrap" }}>
        {/* Left Column */}
        <Box w={{ base: "full", lg: "50%" }}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" mb={2}>
                  Contact Information
                </Heading>

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
                      Phone
                    </Text>
                    <Text fontWeight="medium">{user.phone || "Not provided"}</Text>
                  </Box>
                </HStack>

                <Divider />

                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Employee ID
                  </Text>
                  <Text fontWeight="medium">{user.employeeId}</Text>
                </Box>

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

        {/* Right Column */}
        <Box w={{ base: "full", lg: "50%" }}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" mb={2}>
                  Professional Details
                </Heading>

                <HStack spacing={3}>
                  <Icon as={FiBriefcase} color="gray.500" boxSize={5} />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500">
                      Department
                    </Text>
                    <Text fontWeight="medium">{user.department || "Not specified"}</Text>
                  </Box>
                </HStack>

                <Divider />

                <HStack spacing={3}>
                  <Icon as={FiBriefcase} color="gray.500" boxSize={5} />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500">
                      Position
                    </Text>
                    <Text fontWeight="medium">{user.position || "Not specified"}</Text>
                  </Box>
                </HStack>

                <Divider />

                <HStack spacing={3} align="flex-start">
                  <Icon as={FiUsers} color="gray.500" boxSize={5} mt={1} />
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Roles
                    </Text>
                    <HStack wrap="wrap" spacing={2}>
                      {roleObjects && roleObjects.length > 0 ? (
                        roleObjects.map((r, idx) => (
                          <Badge key={idx} colorScheme="purple">
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
                        {new Date(user.createdAt).toLocaleDateString()}{" "}
                        <Text as="span" fontSize="xs" color="gray.500">
                          (
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                          })}
                          )
                        </Text>
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
