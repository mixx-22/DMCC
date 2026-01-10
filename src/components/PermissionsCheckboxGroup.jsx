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
} from "@chakra-ui/react";

const PERMISSION_LABELS = {
  c: "Create",
  r: "Read",
  u: "Update",
  d: "Delete",
};

const formatLabel = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Check if a value is a nested permission object (has CRUD keys or nested objects)
const isNestedPermission = (value) => {
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value);
  // Check if it has CRUD keys or other nested structures
  const hasCrudKeys = keys.some((k) => ["c", "r", "u", "d"].includes(k));
  const hasNestedKeys = keys.some(
    (k) => !["c", "r", "u", "d"].includes(k) && typeof value[k] === "object"
  );
  return hasCrudKeys || hasNestedKeys;
};

// Extract CRUD permissions from an object
const extractCrudPerms = (obj) => {
  const crud = {};
  ["c", "r", "u", "d"].forEach((key) => {
    crud[key] = obj?.[key] === 1 || obj?.[key] === true;
  });
  return crud;
};

/**
 * Flatten permissions into a list of rows with indentation levels
 */
const flattenPermissions = (permissions, level = 0, path = []) => {
  const rows = [];

  Object.entries(permissions).forEach(([key, value]) => {
    if (!isNestedPermission(value)) return;

    const currentPath = [...path, key];
    const crudPerms = extractCrudPerms(value);
    const label = formatLabel(key);

    // Add this entity as a row
    rows.push({
      key: currentPath.join("."),
      label,
      perms: crudPerms,
      level,
      path: currentPath,
    });

    // Recursively process nested entities (non-CRUD keys)
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      if (!["c", "r", "u", "d"].includes(nestedKey) && isNestedPermission(nestedValue)) {
        rows.push(...flattenPermissions({ [nestedKey]: nestedValue }, level + 1, currentPath));
      }
    });
  });

  return rows;
};

/**
 * Main component for displaying and editing nested permissions in a single unified table
 * @param {Object} permissions - Nested permissions object
 * @param {Function} onChange - Callback when permissions change
 * @param {Boolean} readOnly - Whether the component is read-only
 */
const PermissionsCheckboxGroup = ({
  permissions = {},
  onChange,
  readOnly = false,
}) => {
  const rows = flattenPermissions(permissions);

  const handlePermissionChange = (path, action, checked) => {
    if (readOnly || !onChange) return;

    // Create a deep copy of permissions
    const newPermissions = JSON.parse(JSON.stringify(permissions));

    // Navigate to the target and update it
    let current = newPermissions;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // Update the specific permission
    if (!current[path[path.length - 1]]) {
      current[path[path.length - 1]] = {};
    }
    current[path[path.length - 1]][action] = checked;

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
            <Th width={{ base: "40%", md: "40%" }}>Module</Th>
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
          {rows.map((row) => (
            <Tr key={row.key}>
              <Td>
                <Text
                  fontWeight={row.level === 0 ? "semibold" : "normal"}
                  fontSize={{ base: "sm", md: "md" }}
                  pl={row.level * 6}
                >
                  {row.label}
                </Text>
              </Td>
              {["c", "r", "u", "d"].map((action) => (
                <Td key={action} textAlign="center">
                  <Tooltip
                    label={`${action.toUpperCase()} - ${PERMISSION_LABELS[action]}`}
                    placement="top"
                    hasArrow
                  >
                    <Box display="inline-flex" flexDirection="column" alignItems="center" gap={1}>
                      <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                        {action.toUpperCase()}
                      </Text>
                      <Switch
                        size="sm"
                        isChecked={row.perms[action]}
                        onChange={(e) => {
                          if (!readOnly) {
                            handlePermissionChange(
                              row.path,
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
