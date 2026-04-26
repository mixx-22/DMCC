import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  Spinner,
  HStack,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";

import apiService from "../services/api";
import { Link as RouterLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const OngoingAuditsWidget = ({
  limit = 10,
  showHeader = true,
  showButton = true,
}) => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemBg = useColorModeValue("gray.50", "gray.900");
  const itemHoverBg = useColorModeValue("gray.100", "gray.700");
  const titleColor = useColorModeValue("purple.700", "purple.200");
  const dateColor = useColorModeValue("gray.500", "gray.400");
  const folderBg = useColorModeValue("purple.300", "purple.600");
  const folderText = useColorModeValue("gray.700", "gray.700");
  const folderBorder = useColorModeValue("purple.400", "purple.700");
  const minimalistBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService
      .request("/schedules", {
        method: "GET",
        params: { page: 1, limit, status: 0 },
      })
      .then((res) => {
        if (!mounted) return;
        const data = res.data || res.schedules || [];
        setAudits(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load audits");
        setAudits([]);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [limit]);

  return (
    <Box
      borderRadius="2xl"
      borderWidth={2}
      borderColor={folderBorder}
      bg={folderBg}
      p={0}
      w="full"
      boxShadow="md"
      overflow="hidden"
      position="relative"
    >
      {showHeader && (
        <HStack p={4} justify="space-between">
          <HStack spacing={2}>
            <Box
              bg={folderText}
              color={folderBg}
              px={2}
              py={0.5}
              borderRadius="md"
              fontWeight="bold"
              fontSize="xs"
              letterSpacing="wide"
              textTransform="uppercase"
            >
              Ongoing
            </Box>
            <Heading size="sm" color={folderText} fontWeight="bold">
              Audits
            </Heading>
          </HStack>
          {showButton && audits.length > 0 && (
            <Button
              as={RouterLink}
              to="/audit-schedules"
              size="sm"
              colorScheme="blackAlpha"
              variant="ghost"
            >
              All Audits
            </Button>
          )}
        </HStack>
      )}
      <Box bg={minimalistBg} px={0}>
        {loading ? (
          <HStack justify="center" py={8}>
            <Spinner size="lg" />
          </HStack>
        ) : error ? (
          <Text color="red.500" py={6} align="center">
            {error}
          </Text>
        ) : audits.length === 0 ? (
          <Text color="gray.500" py={6} align="center">
            No ongoing audits found.
          </Text>
        ) : (
          <VStack align="stretch" spacing={1} mb={showButton ? 2 : 0}>
            {audits.map((audit) => (
              <HStack
                key={audit._id || audit.id}
                as={RouterLink}
                to={`/audit-schedule/${audit._id || audit.id}`}
                px={4}
                py={3}
                bg={itemBg}
                _hover={{ bg: itemHoverBg, textDecoration: "none" }}
                align="center"
                justify="space-between"
                transition="background 0.2s"
                role="group"
              >
                <HStack spacing={3} align="center">
                  <Box>
                    <Text
                      fontWeight="bold"
                      color={titleColor}
                      fontSize="md"
                      noOfLines={1}
                    >
                      {audit.title ||
                        audit.name ||
                        `Audit #${audit._id || audit.id}`}
                    </Text>
                    <HStack spacing={2} mt={0.5}>
                      {audit.startDate && (
                        <Text fontSize="xs" color={dateColor}>
                          {new Date(audit.startDate).toLocaleDateString()}
                        </Text>
                      )}
                      {audit.endDate && (
                        <Text fontSize="xs" color={dateColor}>
                          - {new Date(audit.endDate).toLocaleDateString()}
                        </Text>
                      )}
                    </HStack>
                  </Box>
                </HStack>
                <IconButton
                  as={RouterLink}
                  to={`/audits/${audit._id || audit.id}`}
                  aria-label="Go to Audit"
                  icon={<FiArrowRight />}
                  size="sm"
                  colorScheme="purple"
                  variant="ghost"
                  opacity={0.7}
                  _groupHover={{ opacity: 1, color: "purple.600" }}
                  onClick={(e) => e.stopPropagation()}
                  isRound
                />
              </HStack>
            ))}
          </VStack>
        )}
        {showButton && audits.length === 0 && (
          <Button
            as={RouterLink}
            w="full"
            mt={2}
            colorScheme="purple"
            variant="outline"
            to="/audit-schedules"
          >
            View All Audits
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OngoingAuditsWidget;
