import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useBreakpointValue,
  Hide,
  Show,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, Children } from "react";

/**
 * ResponsiveTabs - A mobile-friendly tabs component that collapses to a dropdown on narrow screens
 * 
 * This component wraps Chakra UI's Tabs and automatically handles responsiveness by:
 * - Showing all tabs on desktop/wide screens
 * - Collapsing tabs to a dropdown menu on mobile/narrow screens
 * - Maintaining the visual style of tabs
 * 
 * @param {Object} props - All standard Chakra UI Tabs props are supported
 * @param {React.ReactNode} props.children - TabList and TabPanels components
 * @param {number} props.index - Controlled tab index
 * @param {function} props.onChange - Tab change handler
 * @param {string} props.colorScheme - Color scheme for tabs
 */
const ResponsiveTabs = ({ children, index, onChange, ...tabsProps }) => {
  const [tabIndex, setTabIndex] = useState(index || 0);
  const containerRef = useRef(null);
  const [tabLabels, setTabLabels] = useState([]);
  const [shouldCollapse, setShouldCollapse] = useState(false);
  
  // Determine if we should use mobile layout based on breakpoint
  const isMobileBreakpoint = useBreakpointValue({ base: true, md: false });

  // Extract tab labels and panels from children
  useEffect(() => {
    const childArray = Children.toArray(children);
    const tabList = childArray.find(
      (child) => child.type?.name === "TabList" || child.type?.displayName === "TabList"
    );
    
    if (tabList) {
      const tabs = Children.toArray(tabList.props.children).filter(
        (child) => child.type?.name === "Tab" || child.type?.displayName === "Tab"
      );
      const labels = tabs.map((tab, idx) => ({
        label: tab.props.children,
        originalProps: tab.props,
        index: idx,
      }));
      setTabLabels(labels);
    }
  }, [children]);

  // Detect if tabs overflow the container
  useEffect(() => {
    if (!containerRef.current || isMobileBreakpoint === undefined) return;

    const checkOverflow = () => {
      const container = containerRef.current;
      if (!container) return;

      const tabList = container.querySelector('[role="tablist"]');
      if (!tabList) return;

      const containerWidth = container.offsetWidth;
      const tabsWidth = Array.from(tabList.children).reduce(
        (sum, tab) => sum + tab.offsetWidth,
        0
      );

      // Add some margin for safety
      setShouldCollapse(isMobileBreakpoint || tabsWidth > containerWidth - 20);
    };

    // Check on mount and when window resizes
    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [isMobileBreakpoint, tabLabels]);

  // Handle tab change
  const handleTabChange = (newIndex) => {
    setTabIndex(newIndex);
    if (onChange) {
      onChange(newIndex);
    }
  };

  // Sync external index changes
  useEffect(() => {
    if (index !== undefined && index !== tabIndex) {
      setTabIndex(index);
    }
  }, [index]);

  // Get the current tab label
  const currentTabLabel =
    tabLabels[tabIndex]?.label || `Tab ${tabIndex + 1}`;

  // Clone children to inject our custom behavior
  const clonedChildren = Children.map(children, (child) => {
    if (!child) return child;
    
    // For TabPanels, just pass through
    if (child.type?.name === "TabPanels" || child.type?.displayName === "TabPanels") {
      return child;
    }
    
    // For TabList, handle responsive behavior
    if (child.type?.name === "TabList" || child.type?.displayName === "TabList") {
      if (shouldCollapse) {
        // Mobile: Show as dropdown
        return (
          <Box mb={4}>
            <Menu matchWidth>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                w="full"
                textAlign="left"
                fontWeight="semibold"
                textTransform="lowercase"
                colorScheme={tabsProps.colorScheme || "gray"}
                variant="outline"
              >
                {currentTabLabel}
              </MenuButton>
              <MenuList>
                {tabLabels.map((tab, idx) => (
                  <MenuItem
                    key={idx}
                    onClick={() => handleTabChange(idx)}
                    fontWeight={idx === tabIndex ? "bold" : "normal"}
                    bg={idx === tabIndex ? "gray.100" : "transparent"}
                    _dark={{
                      bg: idx === tabIndex ? "gray.700" : "transparent",
                    }}
                  >
                    {tab.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>
        );
      } else {
        // Desktop: Show as normal tabs
        return child;
      }
    }
    
    return child;
  });

  return (
    <Box ref={containerRef} w="full">
      <Tabs
        {...tabsProps}
        index={tabIndex}
        onChange={handleTabChange}
      >
        {clonedChildren}
      </Tabs>
    </Box>
  );
};

export default ResponsiveTabs;
