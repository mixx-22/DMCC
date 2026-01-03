import { HStack, Button, Text, IconButton } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page and nearby pages
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <HStack spacing={2} justify="center" mt={4}>
      <IconButton
        icon={<FiChevronLeft />}
        onClick={handlePrevious}
        isDisabled={currentPage === 1}
        size="sm"
        variant="outline"
        aria-label="Previous page"
      />
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <Text key={`ellipsis-${index}`} px={2}>...</Text>
        ) : (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            size="sm"
            colorScheme={currentPage === page ? "brandPrimary" : "gray"}
            variant={currentPage === page ? "solid" : "outline"}
          >
            {page}
          </Button>
        )
      ))}
      
      <IconButton
        icon={<FiChevronRight />}
        onClick={handleNext}
        isDisabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        aria-label="Next page"
      />
      
      <Text fontSize="sm" color="gray.600" ml={4}>
        Page {currentPage} of {totalPages}
      </Text>
    </HStack>
  );
};

export default Pagination;
