import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  VStack,
  Hide,
  Show,
} from "@chakra-ui/react";
import { Fragment } from "react";

const PERMISSION_LABELS = {
  c: "Create",
  r: "Read",
  u: "Update",
  d: "Delete",
};

// Hardcoded module structure
const MODULES = [
  {
    key: "users",
    label: "Users",
    description: "Manage user accounts and profiles",
    level: 0,
    path: "users",
  },
  {
    key: "teams",
    label: "Teams",
    description: "Manage teams and team memberships",
    level: 0,
    path: "teams",
  },
  {
    key: "roles",
    label: "Roles",
    description: "Manage roles and permissions",
    level: 0,
    path: "roles",
  },
  {
    key: "document",
    label: "Document",
    description: "Manage documents",
    level: 0,
    path: "document",
  },
  {
    key: "document.permissions.archive",
    label: "Archive",
    description: "Archive and unarchive documents",
    level: 1,
    path: "document.archive",
  },
  {
    key: "document.permissions.download",
    label: "Download",
    description: "Download documents",
    level: 1,
    path: "document.download",
  },
  {
    key: "audit",
    label: "Audit",
    description: "View audit logs and history",
    level: 0,
    path: "audit",
  },
];

/**
 * Main component for displaying and editing permissions in a hardcoded unified table
 * @param {Object} permissions - Nested permissions object
 * @param {Function} onChange - Callback when permissions change
 * @param {Boolean} readOnly - Whether the component is read-only
 */
const PermissionsCheckboxGroup = ({
  permissions = {},
  onChange,
  readOnly = false,
}) => {
  // Get permission value from nested object
  const getPermissionValue = (path, action = "r") => {
    if (!permissions || !path) return false;

    const keys = (Array.isArray(path) ? path : path.split(".")).filter(
      (k) => k !== "permission" && k !== "permissions"
    );

    let current = permissions;

    for (let i = 0; i < keys.length; i++) {
      if (!current || typeof current !== "object") return false;
      current = i === 0 ? current[keys[i]] : current.permission?.[keys[i]];
    }

    return current?.[action] === 1;
  };

  const handlePermissionChange = (path, action, checked) => {
    if (readOnly || !onChange) return;

    const keys = (Array.isArray(path) ? path : path.split(".")).filter(
      (k) => k !== "permission" && k !== "permissions"
    );

    const newPermissions = JSON.parse(JSON.stringify(permissions));
    let current = newPermissions;

    if (keys.length === 1) {
      current[keys[0]] ??= {};
      current[keys[0]][action] = checked ? 1 : 0;
      onChange(newPermissions);
      return;
    }

    current[keys[0]] ??= {};
    current[keys[0]].permission ??= {};
    current = current[keys[0]].permission;

    for (let i = 1; i < keys.length; i++) {
      current[keys[i]] ??= {};
      if (i === keys.length - 1) {
        current[keys[i]][action] = checked ? 1 : 0;
      } else {
        current = current[keys[i]];
      }
    }

    onChange(newPermissions);
  };

  return (
    <Box overflowX="auto" w="full">
      <Table
        variant="simple"
        size="sm"
        w="full"
        minW={{ base: "600px", md: "full" }}
      >
        <Hide below="md">
          <Thead>
            <Tr>
              <Th rowSpan={2}>Module</Th>
              <Th textAlign="center" colSpan={4} border="none">
                Permissions
              </Th>
            </Tr>
            <Tr>
              <Th textAlign="center">Create</Th>
              <Th textAlign="center">Read</Th>
              <Th textAlign="center">Update</Th>
              <Th textAlign="center">Delete</Th>
            </Tr>
          </Thead>
        </Hide>
        <Tbody>
          {MODULES.map((module) => (
            <Fragment key={module.key}>
              <Show below="md">
                <Td colSpan={5}>
                  <VStack align="stretch" spacing={0}>
                    <Text
                      fontWeight={module.level === 0 ? "semibold" : "normal"}
                      fontSize={{ base: "sm", md: "md" }}
                      pl={module.level * 6}
                    >
                      {module.label}
                    </Text>
                    <Text
                      fontSize={{ base: "xs", md: "sm" }}
                      color="gray.600"
                      pl={module.level * 6}
                      opacity={0.6}
                      _hover={{ opacity: 1 }}
                    >
                      {module.description}
                    </Text>
                  </VStack>
                </Td>
              </Show>
              <Tr>
                <Hide below="md">
                  <Td>
                    <VStack align="stretch" spacing={0}>
                      <Text
                        fontWeight={module.level === 0 ? "semibold" : "normal"}
                        fontSize={{ base: "sm", md: "md" }}
                        pl={module.level * 6}
                      >
                        {module.label}
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="gray.600"
                        pl={module.level * 6}
                        opacity={0.6}
                        _hover={{ opacity: 1 }}
                      >
                        {module.description}
                      </Text>
                    </VStack>
                  </Td>
                </Hide>
                {["c", "r", "u", "d"].map((action) => {
                  const isActive = getPermissionValue(module.path, action);
                  return (
                    <Td
                      key={action}
                      textAlign="center"
                      w={{ base: "50px", sm: "auto" }}
                    >
                      <Tooltip
                        label={`${PERMISSION_LABELS[action]} ${module.label}`}
                        placement="top"
                        hasArrow
                      >
                        <Button
                          size="sm"
                          borderRadius="full"
                          variant={isActive ? "solid" : "outline"}
                          colorScheme={isActive ? "brandPrimary" : "gray"}
                          onClick={() => {
                            if (!readOnly) {
                              handlePermissionChange(
                                module.path,
                                action,
                                !isActive
                              );
                            }
                          }}
                          pointerEvents={readOnly ? "none" : "initial"}
                          minW="40px"
                          h="40px"
                          fontWeight="semibold"
                          fontSize="sm"
                          _hover={
                            !readOnly
                              ? {
                                  transform: "scale(1.05)",
                                  transition: "all 0.2s",
                                }
                              : {}
                          }
                        >
                          {action.toUpperCase()}
                        </Button>
                      </Tooltip>
                    </Td>
                  );
                })}
              </Tr>
            </Fragment>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default PermissionsCheckboxGroup;
