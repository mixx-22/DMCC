import {
  Box,
  Checkbox,
  Collapse,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

const PERMISSION_LABELS = {
  c: "Create",
  r: "Read",
  u: "Update",
  d: "Delete",
};

// Helper to convert entity key to readable label
const prettifyLabel = (key) => {
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
  const hasCrudKeys = keys.some(k => ['c', 'r', 'u', 'd'].includes(k));
  const hasNestedKeys = keys.some(k => !['c', 'r', 'u', 'd'].includes(k) && typeof value[k] === 'object');
  return hasCrudKeys || hasNestedKeys;
};

// Extract CRUD permissions from an object
const extractCrudPerms = (obj) => {
  const crud = {};
  ['c', 'r', 'u', 'd'].forEach(key => {
    crud[key] = obj?.[key] === 1 || obj?.[key] === true;
  });
  return crud;
};

/**
 * Component to render a single permission entity with its CRUD checkboxes
 */
const PermissionEntity = ({ label, perms, onPermissionChange, readOnly }) => {
  const handleSelectAll = (checked) => {
    if (readOnly) return;
    const allPerms = {
      c: checked,
      r: checked,
      u: checked,
      d: checked,
    };
    onPermissionChange(allPerms);
  };

  const isAllSelected = () => {
    return perms.c && perms.r && perms.u && perms.d;
  };

  const isSomeSelected = () => {
    const selected = [perms.c, perms.r, perms.u, perms.d].filter(Boolean).length;
    return selected > 0 && selected < 4;
  };

  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <FormLabel mb={0} fontWeight="semibold" fontSize="md">
          {label}
        </FormLabel>
        {!readOnly && (
          <Checkbox
            isChecked={isAllSelected()}
            isIndeterminate={isSomeSelected()}
            onChange={(e) => handleSelectAll(e.target.checked)}
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
              isChecked={perms[action]}
              onChange={(e) => {
                if (!readOnly) {
                  onPermissionChange({ ...perms, [action]: e.target.checked });
                }
              }}
              colorScheme="brandPrimary"
              isDisabled={readOnly}
            >
              <Text fontSize="sm">{actionLabel}</Text>
            </Checkbox>
          </FormControl>
        ))}
      </Grid>
    </VStack>
  );
};

/**
 * Recursive component to render nested permissions with collapsible sections
 */
const NestedPermissionGroup = ({ entityKey, entityValue, path = [], onChange, readOnly, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const nestedBgColor = useColorModeValue("gray.50", "gray.700");
  
  const label = prettifyLabel(entityKey);
  const currentPath = [...path, entityKey];
  
  // Extract CRUD permissions for this entity
  const crudPerms = extractCrudPerms(entityValue);
  
  // Find nested entities (non-CRUD keys that are objects)
  const nestedEntities = Object.entries(entityValue).filter(
    ([key, value]) => !['c', 'r', 'u', 'd'].includes(key) && isNestedPermission(value)
  );
  
  const hasNested = nestedEntities.length > 0;
  
  const handleCrudChange = (newCrudPerms) => {
    if (readOnly || !onChange) return;
    
    // Create updated entity with new CRUD perms
    const updatedEntity = {
      ...entityValue,
      ...newCrudPerms,
    };
    
    // Call onChange with the path and updated value
    onChange(currentPath, updatedEntity);
  };
  
  const handleNestedChange = (nestedPath, updatedValue) => {
    if (readOnly || !onChange) return;
    onChange(nestedPath, updatedValue);
  };
  
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      bg={level > 0 ? nestedBgColor : bgColor}
      ml={level > 0 ? 4 : 0}
    >
      <VStack align="stretch" spacing={3}>
        {hasNested ? (
          <>
            <HStack spacing={2}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={isOpen ? <FiChevronDown /> : <FiChevronRight />}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Collapse" : "Expand"}
              />
              <FormLabel mb={0} fontWeight="bold" fontSize={level === 0 ? "md" : "sm"}>
                {label}
              </FormLabel>
            </HStack>
            
            <Collapse in={isOpen} animateOpacity>
              <VStack align="stretch" spacing={4}>
                {/* Render CRUD permissions for parent */}
                <PermissionEntity
                  label={`${label} Base Permissions`}
                  perms={crudPerms}
                  onPermissionChange={handleCrudChange}
                  readOnly={readOnly}
                />
                
                {/* Render nested entities */}
                {nestedEntities.map(([nestedKey, nestedValue]) => (
                  <NestedPermissionGroup
                    key={nestedKey}
                    entityKey={nestedKey}
                    entityValue={nestedValue}
                    path={currentPath}
                    onChange={handleNestedChange}
                    readOnly={readOnly}
                    level={level + 1}
                  />
                ))}
              </VStack>
            </Collapse>
          </>
        ) : (
          <PermissionEntity
            label={label}
            perms={crudPerms}
            onPermissionChange={handleCrudChange}
            readOnly={readOnly}
          />
        )}
      </VStack>
    </Box>
  );
};

/**
 * Main component for displaying and editing nested permissions
 * @param {Object} permissions - Nested permissions object
 * @param {Function} onChange - Callback when permissions change
 * @param {Boolean} readOnly - Whether the component is read-only
 */
const PermissionsCheckboxGroup = ({ permissions = {}, onChange, readOnly = false }) => {
  const handlePermissionChange = (path, updatedValue) => {
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
    
    // Update the final key
    current[path[path.length - 1]] = updatedValue;
    
    onChange(newPermissions);
  };

  return (
    <VStack align="stretch" spacing={4}>
      {Object.entries(permissions).map(([entityKey, entityValue]) => (
        <NestedPermissionGroup
          key={entityKey}
          entityKey={entityKey}
          entityValue={entityValue}
          path={[]}
          onChange={handlePermissionChange}
          readOnly={readOnly}
          level={0}
        />
      ))}
    </VStack>
  );
};

export default PermissionsCheckboxGroup;
