import {
  Box,
  Card,
  CardBody,
  Skeleton,
  VStack,
  HStack,
} from "@chakra-ui/react";

/**
 * Skeleton loader for audit schedule details
 * Used in both view and edit pages during data loading
 */
const ScheduleSkeleton = () => {
  return (
    <Box>
      {/* Header skeleton */}
      <Box mb={6}>
        <HStack spacing={4} mb={4}>
          <Skeleton height="40px" width="40px" borderRadius="md" />
          <Skeleton height="32px" width="300px" />
        </HStack>
      </Box>

      {/* Main content card skeleton */}
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Title field */}
            <Box>
              <Skeleton height="16px" width="80px" mb={2} />
              <Skeleton height="40px" width="100%" />
            </Box>

            {/* Description field */}
            <Box>
              <Skeleton height="16px" width="100px" mb={2} />
              <Skeleton height="120px" width="100%" />
            </Box>

            {/* Audit Code field */}
            <Box>
              <Skeleton height="16px" width="90px" mb={2} />
              <Skeleton height="40px" width="100%" />
            </Box>

            {/* Audit Type field */}
            <Box>
              <Skeleton height="16px" width="90px" mb={2} />
              <Skeleton height="40px" width="100%" />
            </Box>

            {/* Standard field */}
            <Box>
              <Skeleton height="16px" width="80px" mb={2} />
              <Skeleton height="40px" width="100%" />
            </Box>

            {/* Status field */}
            <Box>
              <Skeleton height="16px" width="60px" mb={2} />
              <Skeleton height="32px" width="120px" borderRadius="full" />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Footer skeleton */}
      <Box mt={6}>
        <HStack justify="space-between">
          <Skeleton height="40px" width="100px" />
          <Skeleton height="40px" width="150px" />
        </HStack>
      </Box>
    </Box>
  );
};

export default ScheduleSkeleton;
