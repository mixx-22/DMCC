import { useCallback, useEffect, useRef } from "react";
import DropdownTreeSelect from "react-dropdown-tree-select";
import { Box, useColorMode } from "@chakra-ui/react";
import "./tree-dropdown-styles.css";

/**
 * ChakraTreeDropdown - A Chakra UI styled wrapper for react-dropdown-tree-select
 * 
 * This component integrates react-dropdown-tree-select with Chakra UI v2 design system,
 * providing consistent styling and theming support (light/dark mode).
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Tree data structure for the dropdown
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.placeholderText - Placeholder text for the dropdown
 * @param {boolean} props.showPartiallySelected - Show partially selected state for parent nodes
 * @param {boolean} props.showDropdown - Control dropdown visibility (default: closed)
 * @param {boolean} props.keepTreeOnSearch - Keep tree structure when searching
 * @param {boolean} props.keepChildrenOnSearch - Keep children when searching
 * @param {boolean} props.keepOpenOnSelect - Keep dropdown open after selection
 * @param {string} props.mode - Selection mode: "multiSelect", "simpleSelect", "radioSelect", "hierarchical"
 * @param {Object} props.texts - Custom text labels
 */
const ChakraTreeDropdown = ({
  data,
  onChange,
  placeholderText = "Select...",
  showPartiallySelected = true,
  showDropdown = "default",
  keepTreeOnSearch = true,
  keepChildrenOnSearch = true,
  keepOpenOnSelect = true,
  mode = "multiSelect",
  texts = {},
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const dropdownRef = useRef(null);

  // Handle changes and log selected nodes
  const handleChange = useCallback(
    (currentNode, selectedNodes) => {
      console.log("Current node:", currentNode);
      console.log("Selected nodes:", selectedNodes);
      if (onChange) {
        onChange(currentNode, selectedNodes);
      }
    },
    [onChange]
  );

  // Apply Chakra color mode class to the dropdown container
  useEffect(() => {
    if (dropdownRef.current) {
      const container = dropdownRef.current.querySelector(".dropdown");
      if (container) {
        container.classList.remove("chakra-light-mode", "chakra-dark-mode");
        container.classList.add(`chakra-${colorMode}-mode`);
      }
    }
  }, [colorMode]);

  const defaultTexts = {
    placeholder: placeholderText,
    noMatches: "No matches found",
    label: "Select",
    labelRemove: "Remove",
    ...texts,
  };

  return (
    <Box ref={dropdownRef} className="chakra-tree-dropdown-wrapper" w="100%">
      <DropdownTreeSelect
        data={data}
        onChange={handleChange}
        texts={defaultTexts}
        showPartiallySelected={showPartiallySelected}
        showDropdown={showDropdown}
        keepTreeOnSearch={keepTreeOnSearch}
        keepChildrenOnSearch={keepChildrenOnSearch}
        keepOpenOnSelect={keepOpenOnSelect}
        mode={mode}
        {...rest}
      />
    </Box>
  );
};

export default ChakraTreeDropdown;
