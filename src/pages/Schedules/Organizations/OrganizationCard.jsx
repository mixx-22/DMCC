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
import Swal from "sweetalert2";
import { useOrganizations } from "../../../context/_useContext";

const OrganizationCard = ({
  schedule,
  setFormData: setScheduleFormData = () => {},
  organization,
  team,
  auditors = [],
  onEdit,
}) => {
  const { deleteOrganization } = useOrganizations();
  const cardBg = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("error.600", "error.400");

  const handleDeleteOrganization = async (organization) => {
    const result = await Swal.fire({
      title: "Delete Organization?",
      text: `Are you sure you want to remove this team from the audit schedule? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteOrganization(organization._id);

        // Update local schedule data to remove the organization ID
        if (schedule) {
          const updatedSchedule = {
            ...schedule,
            organizations: (schedule.organizations || []).filter(
              (orgId) => orgId !== organization._id,
            ),
          };
          setScheduleFormData((prev) => ({ ...prev, ...updatedSchedule }));
        }
      } catch (error) {
        console.error("Failed to delete organization:", error);
      }
    }
  };

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
                <MenuItem
                  icon={<FiEdit />}
                  onClick={() => onEdit(organization)}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  onClick={() => handleDeleteOrganization(organization)}
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
            {auditors && auditors.length > 0 ? (
              <AvatarGroup size="sm" max={5}>
                {auditors.map((auditor, index) => {
                  // Handle both user objects and IDs
                  const userId = auditor._id || auditor.id || auditor;
                  const userName =
                    auditor.firstName && auditor.lastName
                      ? `${auditor.firstName} ${auditor.lastName}`
                      : auditor.name || `User ${index + 1}`;

                  return (
                    <Avatar
                      key={userId || index}
                      name={userName}
                      title={userName}
                    />
                  );
                })}
              </AvatarGroup>
            ) : (
              <Text fontSize="sm" color="gray.500">
                No auditors assigned
              </Text>
            )}
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
