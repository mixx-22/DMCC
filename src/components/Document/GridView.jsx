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
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import { DocumentHoverPopover } from "./DocumentHoverPopover";
import AuptilyzeFolder from "../AuptilyzeFolder";

export const GridView = ({ documents, selectedDocument, onDocumentClick }) => {
  return (
    <SimpleGrid gap={4} columns={[2, 2, 3, 4, 6]} sx={{ ">*": { h: "full" } }}>
      {documents.map((doc, docIndex) => {
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

        if (isFolderType) {
          return (
            <Link
              key={`document-${docIndex}-${doc.type}-${docId}`}
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
        }

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
      })}
    </SimpleGrid>
  );
};
