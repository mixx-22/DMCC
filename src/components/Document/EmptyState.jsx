import { VStack, Text, HStack, Button } from "@chakra-ui/react";

export const EmptyState = ({
  currentFolderId,
  onUploadClick,
  onCreateFolderClick,
}) => {
  return (
    <VStack spacing={4} py={12}>
      <Text color="gray.500" fontSize="lg">
        {currentFolderId ? "This folder is empty" : "No Documents"}
      </Text>
      <HStack>
        <Button size="sm" colorScheme="brandPrimary" onClick={onUploadClick}>
          Upload File
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorScheme="brandPrimary"
          onClick={onCreateFolderClick}
        >
          Create Folder
        </Button>
      </HStack>
    </VStack>
  );
};
