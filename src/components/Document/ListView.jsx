import { Link as RouterLink, useNavigate } from "react-router-dom";
import moment from "moment";
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
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
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
  isQualityDocumentsView = false,
  isRequestView = false,
  onDiscardRequest,
  showRequestStatus = false,
}) => {
  const navigate = useNavigate();
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);

  const rowHoverBg = useColorModeValue("gray.50", "gray.700");
  const selectedBg = useColorModeValue("info.50", "info.900");

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
                  {isQualityDocumentsView && doc?.metadata?.documentNumber
                    ? doc.metadata.documentNumber
                    : isRequestView && doc?.metadata?.documentNumber
                      ? doc.metadata.documentNumber
                      : doc?.title || "Untitled"}
                </Text>
                {!isValid && (
                  <Text fontSize="xs" color="red.500">
                    (Broken)
                  </Text>
                )}
              </HStack>
              {isQualityDocumentsView ? (
                <>
                  {/* Show title (original) below document number */}
                  {doc?.displayTitle && (
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      {doc.displayTitle}
                    </Text>
                  )}
                </>
              ) : isRequestView ? (
                <>
                  {/* Show title below document number for request view */}
                  {doc?.title && (
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      {doc.title}
                    </Text>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </VStack>
          </HStack>
        </Td>
        {!isQualityDocumentsView && !isRequestView && (
          <Td whiteSpace="nowrap">
            {doc?.owner?.id || doc?.owner?._id ? (
              <Link
                as={RouterLink}
                to={`/users/${doc.owner.id || doc.owner._id}`}
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
        )}
        {isRequestView && (
          <>
            <Td whiteSpace="nowrap">
              {doc?.requestedBy?.id || doc?.requestedBy?._id ? (
                <Link
                  as={RouterLink}
                  to={`/users/${doc.requestedBy.id || doc.requestedBy._id}`}
                  onClick={(e) => e.stopPropagation()}
                  _hover={{ textDecoration: "none" }}
                >
                  <HStack _hover={{ opacity: 0.8 }}>
                    <Avatar
                      src={doc?.requestedBy?.profilePicture}
                      name={
                        doc?.requestedBy
                          ? [
                              doc?.requestedBy.firstName,
                              doc?.requestedBy.middleName,
                              doc?.requestedBy.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ") ||
                            doc?.requestedBy.name ||
                            "User"
                          : "User"
                      }
                      size="xs"
                    />
                    <Text fontSize="sm">
                      {doc?.requestedBy?.firstName && doc?.requestedBy?.lastName
                        ? `${doc.requestedBy.firstName} ${doc.requestedBy.lastName}`
                        : "Unknown"}
                    </Text>
                  </HStack>
                </Link>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  -
                </Text>
              )}
            </Td>
            <Td whiteSpace="nowrap">
              {doc?.team?.name ? (
                <Text fontSize="sm">{doc.team.name}</Text>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  -
                </Text>
              )}
            </Td>
          </>
        )}
        {isQualityDocumentsView && (
          <>
            <Td whiteSpace="nowrap">
              {doc?.version ? (
                <Text fontSize="sm">{doc.version}</Text>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  -
                </Text>
              )}
            </Td>
            <Td whiteSpace="nowrap">
              {doc?.issuedDate ? (
                <Text fontSize="sm">
                  {moment(doc.issuedDate).format("MMMM DD, YYYY")}
                </Text>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  -
                </Text>
              )}
            </Td>
            <Td whiteSpace="nowrap">
              {doc?.effectivityDate ? (
                <Text fontSize="sm">
                  {moment(doc.effectivityDate).format("MMMM DD, YYYY")}
                </Text>
              ) : (
                <Text fontSize="sm" color="gray.400">
                  -
                </Text>
              )}
            </Td>
          </>
        )}
        {isRequestView && showRequestStatus && (
          <Td whiteSpace="nowrap">
            {doc?.requestStatus ? (
              <Badge colorScheme={doc.requestStatus.colorScheme}>
                {doc.requestStatus.label}
              </Badge>
            ) : (
              <Text fontSize="sm" color="gray.400">
                -
              </Text>
            )}
          </Td>
        )}
        <Td whiteSpace="nowrap">
          {isRequestView && doc?.dateRequested ? (
            <Timestamp fontSize="sm" date={doc.dateRequested} />
          ) : !isRequestView && doc?.updatedAt ? (
            <Timestamp fontSize="sm" date={doc.updatedAt} />
          ) : (
            <Text fontSize="sm" color="gray.400">
              -
            </Text>
          )}
        </Td>
        <Td w={22}>
          {isRequestView && onDiscardRequest ? (
            <IconButton
              icon={<FiX />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              aria-label="Discard request"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onDiscardRequest) {
                  onDiscardRequest(doc);
                }
              }}
            />
          ) : isRequestView ? (
            <Box w={10} />
          ) : (
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
          )}
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
                <Th w="full">
                  {isQualityDocumentsView || isRequestView
                    ? "Document"
                    : "Name"}
                </Th>
                {isQualityDocumentsView ? (
                  <>
                    <Th>Version</Th>
                    <Th>Issued Date</Th>
                    <Th>Effectivity Date</Th>
                  </>
                ) : isRequestView ? (
                  <>
                    <Th>Requested By</Th>
                    <Th>Requested For</Th>
                    {showRequestStatus && <Th>Status</Th>}
                  </>
                ) : (
                  <Th>Owner</Th>
                )}
                <Th>{isRequestView ? "Date Requested" : "Date Modified"}</Th>
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
                      <Th w="full">
                        {isQualityDocumentsView || isRequestView
                          ? "Document"
                          : "Name"}
                      </Th>
                      {isQualityDocumentsView ? (
                        <>
                          <Th>Version</Th>
                          <Th>Issued Date</Th>
                          <Th>Effectivity Date</Th>
                        </>
                      ) : isRequestView ? (
                        <>
                          <Th>Requested By</Th>
                          <Th>Requested For</Th>
                          {showRequestStatus && <Th>Status</Th>}
                        </>
                      ) : (
                        <Th>Owner</Th>
                      )}
                      <Th>
                        {isRequestView ? "Date Requested" : "Date Modified"}
                      </Th>
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
                    <Th w="full">
                      {isQualityDocumentsView || isRequestView
                        ? "Document"
                        : "Name"}
                    </Th>
                    {isQualityDocumentsView ? (
                      <>
                        <Th>Version</Th>
                        <Th>Issued Date</Th>
                        <Th>Effectivity Date</Th>
                      </>
                    ) : isRequestView ? (
                      <>
                        <Th>Requested By</Th>
                        <Th>Requested For</Th>
                        {showRequestStatus && <Th>Status</Th>}
                      </>
                    ) : (
                      <Th>Owner</Th>
                    )}
                    <Th>
                      {isRequestView ? "Date Requested" : "Date Modified"}
                    </Th>
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
