import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Text,
  IconButton,
  Avatar,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import Timestamp from "../../components/Timestamp";

export const ListView = ({
  documents,
  selectedDocument,
  onDocumentClick,
  onMoreOptions,
}) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th w="full">Name</Th>
          <Th>Owner</Th>
          <Th>Date Modified</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {documents.map((doc) => {
          const isFolderType =
            doc?.type === "folder" || doc?.type === "auditSchedule";
          const RowWrapper = isFolderType ? "a" : "tr";
          const rowProps = isFolderType
            ? {
                href: `/documents/folders/${doc?.id}`,
                onClick: (e) => {
                  e.preventDefault();
                  onDocumentClick(doc);
                },
                style: { display: "table-row" },
              }
            : {};

          const isValid = isDocumentValid(doc);

          return (
            <Tr
              as={RowWrapper}
              {...rowProps}
              key={doc?.id || Math.random()}
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              bg={
                selectedDocument?.id === doc?.id ? "blue.50" : "transparent"
              }
              opacity={isValid ? 1 : 0.6}
            >
              <Td w="full">
                <HStack>
                  {getDocumentIcon(doc)}
                  <VStack align="start" spacing={0}>
                    <HStack spacing={2}>
                      <Text
                        fontWeight="semibold"
                        color={isValid ? "inherit" : "red.500"}
                      >
                        {doc?.title || "Untitled"}
                      </Text>
                      {!isValid && (
                        <Text fontSize="xs" color="red.500">
                          (Broken)
                        </Text>
                      )}
                    </HStack>
                    {doc?.type === "file" && doc?.metadata?.filename && (
                      <Text fontSize="xs" color="gray.500">
                        {doc.metadata.filename}
                      </Text>
                    )}
                    {doc?.type === "file" && !doc?.metadata?.filename && (
                      <Text fontSize="xs" color="red.500">
                        Missing metadata
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Td>
              <Td whiteSpace="nowrap">
                <HStack>
                  <Avatar
                    src={doc?.owner?.profilePicture}
                    name={
                      doc?.owner
                        ? [
                            doc?.owner.firstName,
                            doc?.owner.middleName,
                            doc?.owner.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                          doc?.owner.name ||
                          "User"
                        : "User"
                    }
                    size="xs"
                  />
                  <Text fontSize="sm">
                    {doc?.owner?.firstName && doc?.owner?.lastName
                      ? `${doc.owner.firstName} ${doc.owner.lastName}`
                      : "Unknown"}
                  </Text>
                </HStack>
              </Td>
              <Td whiteSpace="nowrap">
                {doc?.updatedAt ? (
                  <Timestamp fontSize="sm" date={doc.updatedAt} />
                ) : (
                  <Text fontSize="sm" color="gray.400">
                    -
                  </Text>
                )}
              </Td>
              <Td w={22}>
                <IconButton
                  icon={<FiMoreVertical />}
                  size="sm"
                  variant="ghost"
                  aria-label="More options"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoreOptions(doc);
                  }}
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
