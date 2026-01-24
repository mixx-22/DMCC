import {
  HStack,
  VStack,
  Text,
  Button,
  AvatarGroup,
  Tooltip,
  Icon,
  IconButton,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiGlobe } from "react-icons/fi";
import TooltipAvatar from "../TooltipAvatar";

/**
 * PrivacyDisplay Component
 * Displays privacy settings for a document including:
 * - Avatar group for users and teams
 * - World icon button for public documents
 * - Summary text of who is involved (including roles)
 * - Manage Access button
 */
const PrivacyDisplay = ({
  document,
  onManageAccess,
  size = "md",
  avatarSize = "md",
  buttonSize = "md",
}) => {
  const summaryColor = useColorModeValue("gray.500", "gray.400");
  if (!document) return null;

  const users = document.privacy?.users || [];
  const teams = document.privacy?.teams || [];
  const roles = document.privacy?.roles || [];

  // Check if document is public (no users, teams, or roles)
  const isPublic =
    users.length === 0 && teams.length === 0 && roles.length === 0;

  // Generate summary text
  const generateSummary = () => {
    const parts = [];

    if (users.length > 0) {
      parts.push(`${users.length} user${users.length !== 1 ? "s" : ""}`);
    }

    if (teams.length > 0) {
      parts.push(`${teams.length} team${teams.length !== 1 ? "s" : ""}`);
    }

    if (roles.length > 0) {
      parts.push(`${roles.length} role${roles.length !== 1 ? "s" : ""}`);
    }

    if (parts.length === 0) {
      return "Public - Everyone can view";
    }

    return `Shared with ${parts.join(", ")}`;
  };

  return (
    <VStack align="stretch" spacing={0}>
      {/* Avatar Group and Public Icon */}
      <HStack spacing={3} align="center">
        {isPublic ? (
          <Tooltip label="Public - Everyone can view">
            <IconButton
              isRound
              icon={<Icon as={FiGlobe} />}
              size={avatarSize ?? size}
              variant="outline"
              colorScheme="green"
              cursor="default"
            />
          </Tooltip>
        ) : (
          <>
            {/* Avatar Group for Users and Teams */}
            <AvatarGroup size={avatarSize ?? size} max={5}>
              {/* Display Users */}
              {users.map((user) => {
                if (typeof user === "string") {
                  return <TooltipAvatar key={user} name="?" label="User" />;
                }

                const fullName =
                  user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email || user.username || "Unknown User";

                return (
                  <TooltipAvatar
                    key={user.id || user._id}
                    id={user.id || user._id}
                    name={fullName}
                    image={user.profilePicture}
                    urlPrefix="/users/"
                  />
                );
              })}

              {/* Display Teams - Teams don't have profile pictures, just show name */}
              {teams.map((team) => {
                if (typeof team === "string") {
                  return <TooltipAvatar key={team} name="?" label="Team" />;
                }

                return (
                  <TooltipAvatar
                    key={team.id || team._id}
                    id={team.id || team._id}
                    name={team.name}
                    urlPrefix="/teams/"
                  />
                );
              })}
            </AvatarGroup>
          </>
        )}
      </HStack>

      {/* Summary Text */}
      <Text fontSize="xs" color={summaryColor}>
        {generateSummary()}
      </Text>
      {/* Manage Access Button */}
      <Box mt={2}>
        <Button
          size={buttonSize ?? size}
          colorScheme="blue"
          variant="outline"
          onClick={onManageAccess}
        >
          Manage Access
        </Button>
      </Box>
    </VStack>
  );
};

export default PrivacyDisplay;
