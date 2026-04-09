import { FormControl, FormLabel, HStack, Tag, TagLabel, Text } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import {
  ROLE_TYPE_OPTIONS,
  getRoleTypeLabel,
  getRoleTypeColor,
} from "../utils/roleTypes";

/**
 * Displays an array of roleType strings as small coloured badges.
 * Shows nothing when the array is empty.
 */
export const RoleTypeBadges = ({ roleTypes = [], size = "sm", ...props }) => {
  if (!roleTypes || roleTypes.length === 0) return null;

  return (
    <HStack spacing={1} wrap="wrap" {...props}>
      {roleTypes.map((type) => (
        <Tag
          key={type}
          size={size}
          borderRadius="full"
          variant="subtle"
          colorScheme={getRoleTypeColor(type)}
        >
          <TagLabel>{getRoleTypeLabel(type)}</TagLabel>
        </Tag>
      ))}
    </HStack>
  );
};

/**
 * Multi-select component for choosing one or more roleTypes.
 *
 * Edit mode  – renders a chakra-react-select `Select` with multi enabled.
 * View mode  – renders coloured Tag badges (or a "—" placeholder if empty).
 */
const RoleTypeMultiSelect = ({
  value = [],
  onChange,
  isInvalid,
  label = "Role Types",
  readonly = false,
  ...props
}) => {
  const selectedOptions = ROLE_TYPE_OPTIONS.filter((o) => value.includes(o.value));

  const handleChange = (selected) => {
    onChange((selected || []).map((o) => o.value));
  };

  if (readonly) {
    return (
      <FormControl {...props}>
        <FormLabel>{label}</FormLabel>
        {value.length > 0 ? (
          <RoleTypeBadges roleTypes={value} size="md" />
        ) : (
          <Text color="gray.500" fontSize="sm">
            —
          </Text>
        )}
      </FormControl>
    );
  }

  return (
    <FormControl isInvalid={isInvalid} {...props}>
      <FormLabel>{label}</FormLabel>
      <Select
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        options={ROLE_TYPE_OPTIONS}
        placeholder="Select role type(s)..."
        isClearable
        useBasicStyles
        colorScheme="brandPrimary"
      />
    </FormControl>
  );
};

export default RoleTypeMultiSelect;
