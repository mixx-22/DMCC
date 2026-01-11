import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Flex,
  Icon,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiAlertCircle } from "react-icons/fi";
import { useApp } from "../context/AppContext";

const NotificationItem = ({ cert, onClick }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const dateColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex
      p={4}
      bg={bgColor}
      borderRadius="md"
      border="1px"
      borderColor={borderColor}
      _hover={{ bg: hoverBg, cursor: "pointer", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      onClick={onClick}
      align="center"
      gap={3}
      w="full"
    >
      <Icon as={FiAlertCircle} boxSize={5} color="red.500" />
      <Box flex={1}>
        <Text fontSize="md" fontWeight="medium" color={textColor} mb={1}>
          {cert.name}
        </Text>
        <Text fontSize="sm" color={dateColor}>
          Expires: {new Date(cert.expirationDate).toLocaleDateString()}
        </Text>
      </Box>
      <Badge colorScheme="red" fontSize="xs">
        Expiring
      </Badge>
    </Flex>
  );
};

const Notifications = () => {
  const navigate = useNavigate();
  const { getExpiringCertifications } = useApp();
  const expiringCerts = getExpiringCertifications();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const containerBg = useColorModeValue("white", "gray.800");
  const emptyTextColor = useColorModeValue("gray.500", "gray.400");

  const handleNotificationClick = (certId) => {
    navigate(`/certifications/${certId}`);
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Flex align="center" gap={3}>
            <Heading size="lg" color={headingColor}>
              Notifications
            </Heading>
            {expiringCerts.length > 0 && (
              <Badge
                colorScheme="red"
                fontSize="md"
                borderRadius="full"
                px={3}
                py={1}
              >
                {expiringCerts.length}
              </Badge>
            )}
          </Flex>

          <Divider />

          <Box bg={containerBg} p={6} borderRadius="lg" shadow="sm">
            {expiringCerts.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={12}
                gap={3}
              >
                <Icon as={FiBell} boxSize={12} color={emptyTextColor} />
                <Text fontSize="lg" color={emptyTextColor} fontWeight="medium">
                  No notifications
                </Text>
                <Text fontSize="sm" color={emptyTextColor}>
                  You're all caught up!
                </Text>
              </Flex>
            ) : (
              <VStack spacing={3} align="stretch">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={emptyTextColor}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Expiring Certifications ({expiringCerts.length})
                </Text>
                {expiringCerts.map((cert) => (
                  <NotificationItem
                    key={`notification-${cert.id}`}
                    cert={cert}
                    onClick={() => handleNotificationClick(cert.id)}
                  />
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Notifications;
