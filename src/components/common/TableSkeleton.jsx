import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  HStack,
  VStack,
  SkeletonCircle,
} from "@chakra-ui/react";

/**
 * Reusable table skeleton loader component
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column configurations
 * @param {number} props.rows - Number of skeleton rows to display
 * @param {string} props.variant - Table variant from Chakra UI
 * 
 * Column configuration:
 * {
 *   header: string,           // Column header text
 *   width?: string,           // Width of skeleton (e.g., "150px", "200px")
 *   height?: string,          // Height of skeleton (default: "20px")
 *   type?: 'text' | 'avatar' | 'badge' | 'badges' | 'stacked', // Skeleton style
 *   borderRadius?: string,    // Border radius for badge-style skeletons
 * }
 */
const TableSkeleton = ({ columns = [], rows = 5, variant = "simple" }) => {
  const renderSkeletonCell = (column) => {
    const {
      width = "150px",
      height = "20px",
      type = "text",
      borderRadius,
    } = column;

    switch (type) {
      case "avatar":
        // Avatar + text (like user name)
        return (
          <HStack>
            <SkeletonCircle size="8" />
            <Skeleton height={height} width={width} />
          </HStack>
        );

      case "badge":
        // Single badge-style skeleton
        return (
          <Skeleton
            height={height}
            width={width}
            borderRadius={borderRadius || "md"}
          />
        );

      case "badges":
        // Multiple badges side by side
        return (
          <HStack spacing={1}>
            <Skeleton
              height={height}
              width={width}
              borderRadius={borderRadius || "md"}
            />
            <Skeleton
              height={height}
              width={width}
              borderRadius={borderRadius || "md"}
            />
          </HStack>
        );

      case "stacked":
        // Vertically stacked items (like title + description)
        return (
          <VStack align="start" spacing={2}>
            <Skeleton height={height} width={width} />
            <Skeleton height="16px" width="250px" />
          </VStack>
        );

      case "text":
      default:
        // Simple text skeleton
        return <Skeleton height={height} width={width} />;
    }
  };

  return (
    <Table variant={variant}>
      <Thead>
        <Tr>
          {columns.map((column, index) => (
            <Th key={index}>{column.header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <Td key={colIndex}>{renderSkeletonCell(column)}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TableSkeleton;
