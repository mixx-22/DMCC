import { Link as RouterLink, useNavigate } from "react-router-dom";
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
  Link,
  Collapse,
  Button,
  Flex,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiMoreVertical, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useState } from "react";
import { getDocumentIcon, isDocumentValid } from "./DocumentIcon";
import { DocumentHoverPopover } from "./DocumentHoverPopover";
import Timestamp from "../Timestamp";

export const ListView = ({
  documents,
  selectedDocument,
  onDocumentClick,
  foldersOnly,
  filesOnly,
  sourcePage = null,
}) => {
  const navigate = useNavigate();
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);

  const rowHoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("blue.50", "blue.900");

  // Separate folders from other document types
  const folders = documents.filter((doc) => doc?.type === "folder");
  const otherDocuments = documents.filter((doc) => doc?.type !== "folder");

  // Filter based on foldersOnly or filesOnly props
  const displayDocuments = foldersOnly
    ? folders
    : filesOnly
      ? otherDocuments
      : null; // null means show both with labels

  const renderTableRow = (doc) => {
    const docId = doc?.id || doc?._id;
    const isFolderType =
      doc?.type === "folder" || doc?.type === "auditSchedule";
    const isValid = isDocumentValid(doc);
    const isSelected = selectedDocument?.id === docId;

    const navigateTo = isFolderType
      ? `/documents/folders/${docId}`
      : `/document/${docId}`;

    const handleNavigate = () => {
      if (sourcePage && !isFolderType) {
        navigate(navigateTo, { state: { from: sourcePage } });
      } else {
        navigate(navigateTo);
      }
    };

    return (
      <Tr
        key={doc?.id || Math.random()}
        cursor="pointer"
        _hover={{ bg: rowHoverBg }}
        bg={isSelected ? selectedBg : "transparent"}
        opacity={isValid ? 1 : 0.6}
        onClick={handleNavigate}
      >
        <Td w="full">
          <HStack>
            <DocumentHoverPopover document={doc}>
              {getDocumentIcon(doc)}
            </DocumentHoverPopover>
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
          {doc?.owner?.id ? (
            <Link
              as={RouterLink}
              to={`/users/${doc.owner.id}`}
              onClick={(e) => e.stopPropagation()}
              _hover={{ textDecoration: "none" }}
            >
              <HStack _hover={{ opacity: 0.8 }}>
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
            </Link>
          ) : (
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
          )}
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
              onDocumentClick(doc);
            }}
          />
        </Td>
      </Tr>
    );
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Single section mode - for foldersOnly or filesOnly */}
      {displayDocuments !== null ? (
        <Box>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th w="full">Name</Th>
                <Th>Owner</Th>
                <Th>Date Modified</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>{displayDocuments.map((doc) => renderTableRow(doc))}</Tbody>
          </Table>
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
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th w="full">Name</Th>
                      <Th>Owner</Th>
                      <Th>Date Modified</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>{folders.map((doc) => renderTableRow(doc))}</Tbody>
                </Table>
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
                  {otherDocuments.map((doc) => renderTableRow(doc))}
                </Tbody>
              </Table>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
};
