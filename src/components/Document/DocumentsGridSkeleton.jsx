import {
  Card,
  CardBody,
  VStack,
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";

const DocumentsGridSkeleton = ({ count = 8 }) => {
  return (
    <SimpleGrid gap={4} columns={[2, 2, 3, 4]} sx={{ ">*": { h: "full" } }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} variant="document">
          <CardBody>
            <VStack align="start" spacing={2} h="full">
              <HStack justify="space-between" w="full">
                <SkeletonCircle size="10" />
              </HStack>
              <Skeleton height="16px" width="80%" />
              <Skeleton height="14px" width="60%" />
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default DocumentsGridSkeleton;
