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
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import { DocumentHoverPopover } from "./DocumentHoverPopover";

export const GridView = ({ documents, selectedDocument, onDocumentClick }) => {

  return (
    <SimpleGrid gap={4} columns={[2, 2, 3, 4, 6]} sx={{ ">*": { h: "full" } }}>
      {documents.map((doc, docIndex) => {
        const docId = doc?.id || doc?._id;
        const isFolderType =
          doc?.type === "folder" || doc?.type === "auditSchedule";
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
              <CardBody>
                <VStack align="start" spacing={2} h="full">
                  <HStack justify="space-between" w="full">
                    <DocumentHoverPopover document={doc}>
                      {getDocumentIcon(doc)}
                    </DocumentHoverPopover>
                    <IconButton
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
