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
} from "@chakra-ui/react";
import { FiMoreVertical, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useState } from "react";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import { DocumentHoverPopover } from "./DocumentHoverPopover";
import AuptilyzeFolder from "../AuptilyzeFolder";

export const GridView = ({ documents, selectedDocument, onDocumentClick }) => {
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);

  // Separate folders from other document types
  const folders = documents.filter((doc) => doc?.type === "folder" || doc?.type === "auditSchedule");
  const otherDocuments = documents.filter((doc) => doc?.type !== "folder" && doc?.type !== "auditSchedule");

  const renderFolderCard = (doc, docIndex) => {
    const docId = doc?.id || doc?._id;
    const linkProps = {
      as: RouterLink,
      to: `/documents/folders/${docId}`,
      style: { textDecoration: "none" },
    };
    const isValid = isDocumentValid(doc);

    return (
      <Link
        key={`folder-${docIndex}-${doc.type}-${docId}`}
        {...linkProps}
      >
        <Box
          p={2}
          sx={{ ".moreOptions": { opacity: 0 } }}
          _hover={{ ".moreOptions": { opacity: 1 } }}
          opacity={isValid ? 1 : 0.6}
          cursor="pointer"
          position="relative"
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
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDocumentClick(doc);
            }}
          />
          <DocumentHoverPopover document={doc}>
            <Center>
              <AuptilyzeFolder />
            </Center>
          </DocumentHoverPopover>
          <Text
            textAlign="center"
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
        </Box>
      </Link>
    );
  };

  const renderDocumentCard = (doc, docIndex) => {
    const docId = doc?.id || doc?._id;
    const isFolderType = doc?.type === "folder";
    const linkProps = {
      as: RouterLink,
      to: isFolderType
        ? `/documents/folders/${docId}`
        : `/document/${docId}`,
      style: { textDecoration: "none" },
    };
    const isValid = isDocumentValid(doc);
    const isSelected = selectedDocument?.id === docId;

    return (
      <Link
        key={`document-${docIndex}-${doc.type}-${docId}`}
        {...linkProps}
      >
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
      {/* Folders Section - Collapsible */}
      {folders.length > 0 && (
        <Box>
          <Flex align="center" mb={3}>
            <Button
              leftIcon={isFoldersOpen ? <FiChevronDown /> : <FiChevronRight />}
              onClick={() => setIsFoldersOpen(!isFoldersOpen)}
              variant="ghost"
              size="sm"
              fontWeight="semibold"
              color="gray.600"
            >
              Folders ({folders.length})
            </Button>
          </Flex>
          <Collapse in={isFoldersOpen} animateOpacity>
            <SimpleGrid gap={4} columns={[2, 2, 3, 4, 6]} sx={{ ">*": { h: "full" } }}>
              {folders.map((doc, docIndex) => renderFolderCard(doc, docIndex))}
            </SimpleGrid>
          </Collapse>
        </Box>
      )}

      {/* Other Documents Section */}
      {otherDocuments.length > 0 && (
        <Box>
          {folders.length > 0 && (
            <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
              Documents ({otherDocuments.length})
            </Text>
          )}
          <SimpleGrid gap={4} columns={[2, 2, 3, 4, 6]} sx={{ ">*": { h: "full" } }}>
            {otherDocuments.map((doc, docIndex) => renderDocumentCard(doc, docIndex))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
};
