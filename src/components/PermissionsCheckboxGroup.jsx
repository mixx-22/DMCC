import {
  Box,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  VStack,
} from "@chakra-ui/react";

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

    // Create a deep copy of permissions
    const newPermissions = JSON.parse(JSON.stringify(permissions));

    // Navigate to the target and set the value
    let current = newPermissions;
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        // Last key - set the action value
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current[path[i]][action] = checked ? 1 : 0;
      } else {
        // Navigate deeper
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
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
        <Thead>
          <Tr>
            <Th width={{ base: "40%", md: "40%" }} rowSpan={2}>
              Module
            </Th>
            <Th textAlign="center" colSpan={4} border="none">
              Permissions
            </Th>
          </Tr>
          <Tr>
            <Th textAlign="center" width={{ base: "15%", md: "15%" }}>
              Create
            </Th>
            <Th textAlign="center" width={{ base: "15%", md: "15%" }}>
              Read
            </Th>
            <Th textAlign="center" width={{ base: "15%", md: "15%" }}>
              Update
            </Th>
            <Th textAlign="center" width={{ base: "15%", md: "15%" }}>
              Delete
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {MODULES.map((module) => (
            <Tr key={module.key}>
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
              {["c", "r", "u", "d"].map((action) => (
                <Td key={action} textAlign="center">
                  <Tooltip
                    label={`${PERMISSION_LABELS[action]} ${module.label}`}
                    placement="top"
                    hasArrow
                  >
                    <Box
                      display="inline-flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1}
                    >
                      <Switch
                        size="sm"
                        isChecked={getPermissionValue(module.path, action)}
                        onChange={(e) => {
                          if (!readOnly) {
                            handlePermissionChange(
                              module.path,
                              action,
                              e.target.checked
                            );
                          }
                        }}
                        colorScheme="brandPrimary"
                        isDisabled={readOnly}
                      />
                    </Box>
                  </Tooltip>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default PermissionsCheckboxGroup;
