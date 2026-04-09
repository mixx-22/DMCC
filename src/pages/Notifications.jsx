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
  Button,
  HStack,
  Spinner,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import Timestamp from "../components/Timestamp";
import Pagination from "../components/Pagination";
import { useNotifications } from "../context/_useContext";
import NOTIFICATION_CONFIG from "../helpers/notificationConfig";
import { useState } from "react";

// ── Colour helpers ───────────────────────────────────────────────────
const getColorScheme = (type) => NOTIFICATION_CONFIG[type]?.color || "gray";

// ── Single notification row ──────────────────────────────────────────
const NotificationItem = ({ notification, onRead }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const unreadBg = useColorModeValue("blue.50", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const dateColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const colorScheme = getColorScheme(notification.type);

  return (
    <Flex
      p={4}
      bg={notification.read ? bgColor : unreadBg}
      borderRadius="md"
      border="1px"
      borderColor={borderColor}
      _hover={{ bg: hoverBg, cursor: "pointer", transform: "translateY(-1px)" }}
      transition="all 0.2s"
      align="center"
      gap={3}
      w="full"
      onClick={() => {
        if (!notification.read) onRead(notification._id);
      }}
    >
      <Box flex={1} ml={0}>
        <HStack mb={1} spacing={2}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            {notification.title}
          </Text>
        </HStack>
        <Text fontSize="sm" color={textColor} noOfLines={2}>
          {notification.message}
        </Text>
        <Text fontSize="xs" color={dateColor} mt={1}>
          <Badge colorScheme={colorScheme} fontSize="2xs" as="span">
            {NOTIFICATION_CONFIG[notification.type]?.label || notification.type}
          </Badge>{" "}
          &middot; <Timestamp date={notification.createdAt} />
        </Text>
      </Box>

      {/* Unread indicator */}
      {!notification.read && (
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg="blue.500"
          flexShrink={0}
          onClick={(e) => {
            e.stopPropagation();
            onRead(notification._id);
          }}
        />
      )}
    </Flex>
  );
};

// ── Filter tabs index ↔ filter string ────────────────────────────────
const FILTER_MAP = ["all", "unread", "read"];

// ── Page component ──────────────────────────────────────────────────
const Notifications = () => {
  const {
    notifications,
    unreadCount,
    meta,
    filter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setFilter,
    setPage,
  } = useNotifications();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const containerBg = useColorModeValue("white", "gray.800");
  const emptyTextColor = useColorModeValue("gray.500", "gray.400");

  const [isLoading] = useState(false);

  const tabIndex = FILTER_MAP.indexOf(filter);

  const handleTabChange = (index) => {
    setFilter(FILTER_MAP[index]);
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={3}>
              <Heading size="lg" color={headingColor}>
                Notifications
              </Heading>
              {unreadCount > 0 && (
                <Badge
                  colorScheme="red"
                  fontSize="md"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {unreadCount}
                </Badge>
              )}
            </Flex>

            {unreadCount > 0 && (
              <Button
                leftIcon={<FiCheckCircle />}
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Flex>

          {/* Filter Tabs */}
          <Tabs
            index={tabIndex}
            onChange={handleTabChange}
            variant="soft-rounded"
            colorScheme="brandPrimary"
            size="sm"
          >
            <TabList>
              <Tab>All</Tab>
              <Tab>Unread</Tab>
              <Tab>Read</Tab>
            </TabList>
          </Tabs>

          <Divider />

          {/* Notification list */}
          <Box bg={containerBg} p={6} borderRadius="lg" shadow="sm">
            {isLoading ? (
              <Flex justify="center" py={12}>
                <Spinner size="lg" />
              </Flex>
            ) : notifications.length === 0 ? (
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
                  You&apos;re all caught up!
                </Text>
              </Flex>
            ) : (
              <VStack spacing={3} align="stretch">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n._id}
                    notification={n}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </VStack>
            )}
          </Box>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={setPage}
            />
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Notifications;
