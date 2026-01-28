import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  AvatarGroup,
  Divider,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";

const OrganizationCard = ({
  organization,
  team,
  auditors = [],
  onEdit,
  onDelete,
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("error.600", "error.400");

  return (
    <Card bg={cardBg}>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          {/* Header with Team Name and Actions */}
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="lg">
                {team?.name || "Unknown Team"}
              </Text>
              <Badge colorScheme="blue" size="sm">
                {auditors.length} Auditor{auditors.length !== 1 ? "s" : ""}
              </Badge>
            </VStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                aria-label="More options"
              />
              <MenuList>
                <MenuItem icon={<FiEdit />} onClick={() => onEdit(organization)}>
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  onClick={() => onDelete(organization)}
                  color={errorColor}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Team Description */}
          {team?.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {team.description}
            </Text>
          )}

          <Divider />

          {/* Auditors */}
          <Box>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Auditors
            </Text>
            <AvatarGroup size="sm" max={5}>
              {auditors.map((auditor) => (
                <Avatar
                  key={auditor._id || auditor.id}
                  name={`${auditor.firstName || ""} ${auditor.lastName || ""}`}
                  title={`${auditor.firstName || ""} ${auditor.lastName || ""}`}
                />
              ))}
            </AvatarGroup>
          </Box>

          {/* Visits */}
          {organization.visits && organization.visits.length > 0 && (
            <>
              <Divider />
              <Box>
                <HStack mb={2}>
                  <FiCalendar />
                  <Text fontSize="sm" color="gray.600">
                    Visits
                  </Text>
                </HStack>
                <VStack align="stretch" spacing={1}>
                  {organization.visits.map((visit, index) => (
                    <HStack key={index} fontSize="sm">
                      <Badge colorScheme="green">
                        {visit.date?.start || "N/A"}
                      </Badge>
                      <Text>to</Text>
                      <Badge colorScheme="green">
                        {visit.date?.end || "N/A"}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrganizationCard;
