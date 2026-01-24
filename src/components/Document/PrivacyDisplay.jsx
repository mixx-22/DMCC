import {
  HStack,
  VStack,
  Text,
  Button,
  AvatarGroup,
  Avatar,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { FiGlobe, FiSettings } from "react-icons/fi";

/**
 * PrivacyDisplay Component
 * Displays privacy settings for a document including:
 * - Avatar group for users and teams
 * - World icon button for public documents
 * - Summary text of who is involved (including roles)
 * - Manage Access button
 */
const PrivacyDisplay = ({ document, onManageAccess, size = "md" }) => {
  if (!document) return null;

  const users = document.privacy?.users || [];
  const teams = document.privacy?.teams || [];
  const roles = document.privacy?.roles || [];

  // Check if document is public (no users, teams, or roles)
  const isPublic = users.length === 0 && teams.length === 0 && roles.length === 0;

  // Generate summary text
  const generateSummary = () => {
    const parts = [];
    
    if (users.length > 0) {
      parts.push(`${users.length} user${users.length !== 1 ? 's' : ''}`);
    }
    
    if (teams.length > 0) {
      parts.push(`${teams.length} team${teams.length !== 1 ? 's' : ''}`);
    }
    
    if (roles.length > 0) {
      parts.push(`${roles.length} role${roles.length !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return "Public - Everyone can view";
    }

    return `Shared with ${parts.join(', ')}`;
  };

  return (
    <VStack align="stretch" spacing={2}>
      {/* Avatar Group and Public Icon */}
      <HStack spacing={3} align="center">
        {isPublic ? (
          <Tooltip label="Public - Everyone can view">
            <Button
              leftIcon={<Icon as={FiGlobe} />}
              size={size}
              variant="outline"
              colorScheme="green"
              isDisabled
              cursor="default"
            >
              Public
            </Button>
          </Tooltip>
        ) : (
          <>
            {/* Avatar Group for Users and Teams */}
            <AvatarGroup size={size === "sm" ? "xs" : "sm"} max={5}>
              {/* Display Users */}
              {users.map((user) => {
                // Handle both object format and string ID format
                if (typeof user === 'string') {
                  // If it's just an ID, we can't display much info
                  return (
                    <Tooltip key={user} label="User">
                      <Avatar name="?" />
                    </Tooltip>
                  );
                }
                
                const fullName = user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email || user.username || "Unknown User";
                
                return (
                  <Tooltip key={user.id || user._id} label={fullName}>
                    <Avatar
                      name={fullName}
                      src={user.profilePicture}
                    />
                  </Tooltip>
                );
              })}
              
              {/* Display Teams - Teams don't have profile pictures, just show name */}
              {teams.map((team) => {
                // Handle both object format and string ID format
                if (typeof team === 'string') {
                  // If it's just an ID, we can't display much info
                  return (
                    <Tooltip key={team} label="Team">
                      <Avatar name="?" bg="blue.500" />
                    </Tooltip>
                  );
                }
                
                return (
                  <Tooltip key={team.id || team._id} label={team.name}>
                    <Avatar
                      name={team.name}
                      bg="blue.500"
                    />
                  </Tooltip>
                );
              })}
            </AvatarGroup>
          </>
        )}
        
        {/* Manage Access Button */}
        <Button
          leftIcon={<Icon as={FiSettings} />}
          size={size}
          colorScheme="blue"
          variant="outline"
          onClick={onManageAccess}
        >
          Manage Access
        </Button>
      </HStack>

      {/* Summary Text */}
      <Text fontSize="sm" color="gray.600">
        {generateSummary()}
      </Text>
    </VStack>
  );
};

export default PrivacyDisplay;
