import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  VStack,
} from "@chakra-ui/react";

const RolesSkeleton = ({ rows = 5 }) => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Role Title</Th>
          <Th>Summary</Th>
          <Th>Last Updated</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <Tr key={index}>
            <Td>
              <VStack align="start" spacing={2}>
                <Skeleton height="20px" width="120px" />
                <Skeleton height="16px" width="250px" />
              </VStack>
            </Td>
            <Td>
              <Skeleton height="16px" width="300px" />
            </Td>
            <Td>
              <Skeleton height="16px" width="100px" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default RolesSkeleton;
