import { Box, Center, SimpleGrid, Skeleton } from "@chakra-ui/react";

const DocumentsFolderSkeleton = ({ count = 8 }) => {
  return (
    <SimpleGrid gap={0} columns={[3, 3, 4, 6, 8]} sx={{ ">*": { h: "full" } }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          py={4}
          h="full"
          cursor="pointer"
          borderRadius="md"
        >
          <Center>
            <Skeleton
              boxSize={{ base: 14, md: 16 }}
              borderRadius="md"
            />
          </Center>
          <Box mt={1} px={2}>
            <Skeleton height="14px" width="80%" mx="auto" mb={1} />
            <Skeleton height="12px" width="60%" mx="auto" />
          </Box>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default DocumentsFolderSkeleton;
