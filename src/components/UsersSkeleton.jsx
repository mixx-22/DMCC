import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  HStack,
  SkeletonCircle,
} from "@chakra-ui/react";

const UsersSkeleton = ({ rows = 5 }) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Roles</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <Tr key={index}>
            <Td>
              <HStack>
                <SkeletonCircle size="8" />
                <Skeleton height="20px" width="150px" />
              </HStack>
            </Td>
            <Td>
              <Skeleton height="20px" width="200px" />
            </Td>
            <Td>
              <HStack spacing={1}>
                <Skeleton height="24px" width="80px" borderRadius="md" />
                <Skeleton height="24px" width="80px" borderRadius="md" />
              </HStack>
            </Td>
            <Td>
              <Skeleton height="24px" width="70px" borderRadius="md" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default UsersSkeleton;
