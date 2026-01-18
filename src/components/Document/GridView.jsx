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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Portal,
  Stack,
  Icon,
  Avatar,
} from "@chakra-ui/react";
import { FiFile, FiFolder, FiMoreVertical } from "react-icons/fi";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import Timestamp from "../Timestamp";
import { useUser } from "../../context/_useContext";

export const GridView = ({ documents, selectedDocument, onDocumentClick }) => {
  const { user: currentUser } = useUser();
  const HoverContent = ({ data: doc }) => {
    console.log(doc, currentUser);
    const fullName =
      `${doc.owner.firstName || ""} ${doc.owner.lastName || ""}`.trim();
    return (
      <PopoverContent
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <HStack>
            {getDocumentIcon(doc)}
            <Text fontWeight="semibold">{doc?.title}</Text>
          </HStack>
        </PopoverHeader>
        <PopoverBody>
          <Stack
            spacing={2}
            sx={{
              svg: { opacity: 0.8 },
              p: { fontSize: "xs", fontWeight: "normal", opacity: 0.8 },
            }}
          >
            <HStack>
              <Avatar
                size="2xs"
                name={fullName}
                src={doc?.owner?.profilePicture}
              />
              <Text>{currentUser._id === doc.owner.id ? "You" : fullName}</Text>
            </HStack>
            {doc?.type === "file" && doc?.metadata?.filename && (
              <HStack>
                <Icon h={3} as={FiFile} />
                <Text>{doc.metadata.filename}</Text>
              </HStack>
            )}
            <HStack>
              <Icon h={3} as={RxCounterClockwiseClock} strokeWidth={".4px"} />
              <Text>
                <Timestamp date={doc.updatedAt} />
              </Text>
            </HStack>
            <HStack>
              <Icon h={3} as={FiFolder} />
              <Text>
                {doc?.parentData?.id ? doc?.parentData?.title : "All Documents"}
              </Text>
            </HStack>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    );
  };

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
                    <Popover trigger="hover">
                      <PopoverTrigger>
                        <Box>{getDocumentIcon(doc)}</Box>
                      </PopoverTrigger>
                      <Portal>
                        <HoverContent data={doc} />
                      </Portal>
                    </Popover>
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
