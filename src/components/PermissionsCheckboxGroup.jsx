import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";

const PERMISSION_LABELS = {
  c: "Create",
  r: "Read",
  u: "Update",
  d: "Delete",
};

const ENTITY_LABELS = {
  documents: "Documents",
  certifications: "Certifications",
  users: "Users",
  roles: "Roles",
  accounts: "Accounts",
  archive: "Archive",
};

/**
 * Reusable component for displaying and editing nested permissions
 * @param {Object} permissions - Nested permissions object { entity: { c, r, u, d } }
 * @param {Function} onChange - Callback when permissions change
 * @param {Boolean} readOnly - Whether the component is read-only
 */
const PermissionsCheckboxGroup = ({ permissions = {}, onChange, readOnly = false }) => {
  const handlePermissionChange = (entity, action, checked) => {
    if (readOnly || !onChange) return;

    const updatedPermissions = {
      ...permissions,
      [entity]: {
        ...permissions[entity],
        [action]: checked,
      },
    };
    onChange(updatedPermissions);
  };

  const handleSelectAll = (entity, checked) => {
    if (readOnly || !onChange) return;

    const updatedPermissions = {
      ...permissions,
      [entity]: {
        c: checked,
        r: checked,
        u: checked,
        d: checked,
      },
    };
    onChange(updatedPermissions);
  };

  const isAllSelected = (entity) => {
    const entityPerms = permissions[entity] || {};
    return entityPerms.c && entityPerms.r && entityPerms.u && entityPerms.d;
  };

  const isSomeSelected = (entity) => {
    const entityPerms = permissions[entity] || {};
    const selected = [entityPerms.c, entityPerms.r, entityPerms.u, entityPerms.d].filter(Boolean).length;
    return selected > 0 && selected < 4;
  };

  return (
    <VStack align="stretch" spacing={4}>
      {Object.entries(ENTITY_LABELS).map(([entity, label]) => {
        const entityPerms = permissions[entity] || { c: false, r: false, u: false, d: false };
        
        return (
          <Box key={entity} p={4} borderWidth="1px" borderRadius="md">
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <FormLabel mb={0} fontWeight="semibold" fontSize="md">
                  {label}
                </FormLabel>
                {!readOnly && (
                  <Checkbox
                    isChecked={isAllSelected(entity)}
                    isIndeterminate={isSomeSelected(entity)}
                    onChange={(e) => handleSelectAll(entity, e.target.checked)}
                    colorScheme="brandPrimary"
                  >
                    <Text fontSize="sm">Select All</Text>
                  </Checkbox>
                )}
              </HStack>
              
              <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={3}>
                {Object.entries(PERMISSION_LABELS).map(([action, actionLabel]) => (
                  <FormControl key={action}>
                    <Checkbox
                      isChecked={entityPerms[action]}
                      onChange={(e) => handlePermissionChange(entity, action, e.target.checked)}
                      colorScheme="brandPrimary"
                      isDisabled={readOnly}
                    >
                      <Text fontSize="sm">{actionLabel}</Text>
                    </Checkbox>
                  </FormControl>
                ))}
              </Grid>
            </VStack>
          </Box>
        );
      })}
    </VStack>
  );
};

export default PermissionsCheckboxGroup;
