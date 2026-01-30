import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  IconButton,
  Link,
  SimpleGrid,
  Box,
  Center,
  Collapse,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiMoreVertical, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useState } from "react";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import { DocumentHoverPopover } from "./DocumentHoverPopover";
import AuptilyzeFolder from "../AuptilyzeFolder";

export const GridView = ({
  documents,
  selectedDocument,
  onDocumentClick,
  foldersOnly,
  filesOnly,
  sourcePage = null,
  mini = false, // Mini mode for compact display (fewer columns, smaller icons)
}) => {
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);
  const folderBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  // Grid column configurations
  const folderColumns = mini ? [2, 2, 3, 4, 5] : [3, 3, 4, 6, 8];
  const documentColumns = mini ? [2, 2, 2, 3] : [2, 2, 3, 4];
  const folderIconSize = mini ? { base: 10, md: 12 } : { base: 14, md: 16 };

  // Separate folders from other document types
  const folders = documents.filter((doc) => doc?.type === "folder");
  const otherDocuments = documents.filter((doc) => doc?.type !== "folder");

  // Filter based on foldersOnly or filesOnly props
  const displayDocuments = foldersOnly
    ? folders
    : filesOnly
      ? otherDocuments
      : null; // null means show both with labels

  const renderFolderCard = (doc, docIndex) => {
    const docId = doc?.id || doc?._id;
    const linkProps = {
      as: RouterLink,
      to: `/documents/folders/${docId}`,
      style: { textDecoration: "none" },
    };
    const isValid = isDocumentValid(doc);

    return (
      <Link key={`folder-${docIndex}-${doc.type}-${docId}`} {...linkProps}>
        <Box
          py={4}
          h="full"
          cursor="pointer"
          position="relative"
          sx={{ ".moreOptions": { opacity: 0 } }}
          _hover={{ bg: folderBg, ".moreOptions": { opacity: 1 } }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          opacity={isValid ? 1 : 0.6}
          borderRadius="md"
        >
          <IconButton
            position="absolute"
            top={1}
            right={1}
            className="moreOptions"
            icon={<FiMoreVertical />}
            size="sm"
            variant="ghost"
            aria-label="More options"
            _hover={{ bg: folderBg }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDocumentClick(doc);
            }}
          />
          <DocumentHoverPopover document={doc}>
            <Center>
              <AuptilyzeFolder
                boxSize={folderIconSize}
                position="relative"
                filter="drop-shadow(0 2px 2px rgba(0, 0, 0, .15))"
                _hover={{
                  top: "-2px",
                  filter: "drop-shadow(0 4px 2px rgba(0, 0, 0, .15))",
                }}
              />
            </Center>
          </DocumentHoverPopover>
          <Text
            mt={1}
            textAlign="center"
            fontSize="sm"
            lineHeight={1.2}
            fontWeight="semibold"
            maxW="full"
            title={doc?.title || "Untitled"}
            color={isValid ? "inherit" : "red.500"}
            noOfLines={2}
          >
            {doc?.title || "Untitled"}
          </Text>
          {doc?.type === "file" && !doc?.metadata?.filename && (
            <Text fontSize="xs" color="red.500" isTruncated maxW="full">
              Broken file - missing metadata
            </Text>
          )}
        </Box>
      </Link>
    );
  };

  const renderDocumentCard = (doc, docIndex) => {
    const docId = doc?.id || doc?._id;
    const isFolderType = doc?.type === "folder";
    const linkProps = {
      as: RouterLink,
      to: isFolderType ? `/documents/folders/${docId}` : `/document/${docId}`,
      style: { textDecoration: "none" },
      ...(sourcePage && !isFolderType ? { state: { from: sourcePage } } : {}),
    };
    const isValid = isDocumentValid(doc);
    const isSelected = selectedDocument?.id === docId;

    return (
      <Link key={`document-${docIndex}-${doc.type}-${docId}`} {...linkProps}>
        <Card
          sx={{ ".moreOptions": { opacity: 0 } }}
          _hover={{ ".moreOptions": { opacity: 1 } }}
          variant={isSelected ? "documentSelected" : "document"}
          cursor="pointer"
          opacity={isValid ? 1 : 0.6}
        >
          <CardBody position="relative">
            <IconButton
              position="absolute"
              top={1}
              right={1}
              className="moreOptions"
              icon={<FiMoreVertical />}
              size="sm"
              variant="ghost"
              aria-label="More options"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDocumentClick(doc);
              }}
            />
            <VStack align="start" spacing={2} h="full">
              <HStack justify="space-between" w="full">
                <DocumentHoverPopover document={doc}>
                  {getDocumentIcon(doc)}
                </DocumentHoverPopover>
              </HStack>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                isTruncated
                maxW="full"
                title={doc?.title || "Untitled"}
                color={isValid ? "inherit" : "red.500"}
              >
                {doc?.title || "Untitled"}
              </Text>
              {doc?.type === "file" && !doc?.metadata?.filename && (
                <Text fontSize="xs" color="red.500" isTruncated maxW="full">
                  Broken file - missing metadata
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Link>
    );
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Single section mode - for foldersOnly or filesOnly */}
      {displayDocuments !== null ? (
        <Box>
          {foldersOnly ? (
            <SimpleGrid
              gap={0}
              columns={folderColumns}
              sx={{ ">*": { h: "full" } }}
            >
              {displayDocuments.map((doc, docIndex) =>
                renderFolderCard(doc, docIndex),
              )}
            </SimpleGrid>
          ) : (
            <SimpleGrid
              gap={4}
              columns={documentColumns}
              sx={{ ">*": { h: "full" } }}
            >
              {displayDocuments.map((doc, docIndex) =>
                renderDocumentCard(doc, docIndex),
              )}
            </SimpleGrid>
          )}
        </Box>
      ) : (
        <>
          {/* Folders Section - Collapsible */}
          {folders.length > 0 && (
            <Box>
              <Flex align="center" mb={3}>
                <Button
                  rightIcon={
                    isFoldersOpen ? <FiChevronDown /> : <FiChevronUp />
                  }
                  onClick={() => setIsFoldersOpen(!isFoldersOpen)}
                  variant="link"
                  size="sm"
                  fontWeight="semibold"
                  color="gray.600"
                >
                  Folders ({folders.length})
                </Button>
              </Flex>
              <Collapse in={isFoldersOpen} animateOpacity>
                <SimpleGrid
                  gap={0}
                  columns={folderColumns}
                  sx={{ ">*": { h: "full" } }}
                >
                  {folders.map((doc, docIndex) =>
                    renderFolderCard(doc, docIndex),
                  )}
                </SimpleGrid>
              </Collapse>
            </Box>
          )}

          {/* Other Documents Section */}
          {otherDocuments.length > 0 && (
            <Box>
              {folders.length > 0 && (
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.600"
                  mb={3}
                >
                  Documents ({otherDocuments.length})
                </Text>
              )}
              <SimpleGrid
                gap={4}
                columns={documentColumns}
                sx={{ ">*": { h: "full" } }}
              >
                {otherDocuments.map((doc, docIndex) =>
                  renderDocumentCard(doc, docIndex),
                )}
              </SimpleGrid>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
};
