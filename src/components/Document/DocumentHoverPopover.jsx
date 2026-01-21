import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Portal,
  HStack,
  Stack,
  Text,
  Icon,
  Avatar,
  Box,
  Link,
} from "@chakra-ui/react";
import { FiFile, FiFolder } from "react-icons/fi";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { getDocumentIcon } from "./DocumentIcon";
import Timestamp from "../Timestamp";
import { useUser } from "../../context/_useContext";
import { Link as RouterLink } from "react-router-dom";

export const DocumentHoverPopover = ({ document: doc, children }) => {
  const { user: currentUser } = useUser();
  const fullName =
    `${doc?.owner?.firstName || ""} ${doc?.owner?.lastName || ""}`.trim();

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Box>{children}</Box>
      </PopoverTrigger>
      <Portal>
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
                {doc?.owner?.id ? (
                  <Link
                    as={RouterLink}
                    to={`/users/${doc.owner.id}`}
                    onClick={(e) => e.stopPropagation()}
                    _hover={{ textDecoration: "underline" }}
                  >
                    <Text>
                      {currentUser._id === doc?.owner?.id ? "You" : fullName}
                    </Text>
                  </Link>
                ) : (
                  <Text>
                    {currentUser._id === doc?.owner?.id ? "You" : fullName}
                  </Text>
                )}
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
                  {doc?.parentData?.id
                    ? doc?.parentData?.title
                    : "All Documents"}
                </Text>
              </HStack>
            </Stack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
