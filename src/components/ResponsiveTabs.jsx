import {
  Box,
  Tabs,
  TabList,
  Tab,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Portal,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef, Children, cloneElement, isValidElement } from "react";

// Constants for responsive behavior
const TAB_GAP = 8; // Gap between tabs in pixels
const OVERFLOW_MARGIN = 40; // Safety margin to detect overflow before it happens
const DOM_READY_DELAY = 100; // Delay to ensure DOM is fully rendered before measuring

/**
 * ResponsiveTabs - A mobile-friendly tabs component that collapses to a dropdown on narrow screens
 * 
 * This component wraps Chakra UI's Tabs and automatically handles responsiveness by:
 * - Showing all tabs on desktop/wide screens
 * - Collapsing tabs to a dropdown menu on mobile/narrow screens
 * - Maintaining the visual style of tabs
 * - Using Portal for dropdown menu to avoid z-index issues with other UI elements
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
  const tabListRef = useRef(null);
  const [tabLabels, setTabLabels] = useState([]);
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const [tabListElement, setTabListElement] = useState(null);
  
  // Determine if we should use mobile layout based on breakpoint
  // ssr: false prevents hydration mismatches between server and client
  const isMobile = useBreakpointValue({ base: true, md: false }, { ssr: false });

  // Extract tab labels from TabList children
  useEffect(() => {
    const childArray = Children.toArray(children);
    const tabList = childArray.find((child) => {
      return isValidElement(child) && child.type === TabList;
    });
    
    if (tabList) {
      const tabs = Children.toArray(tabList.props.children).filter((child) => {
        return isValidElement(child) && child.type === Tab;
      });
      
      const labels = tabs.map((tab, idx) => ({
        label: tab.props.children,
        originalProps: tab.props,
        index: idx,
      }));
      setTabLabels(labels);
    }
  }, [children]);

  // Check if tabs should collapse based on breakpoint or overflow
  useEffect(() => {
    if (isMobile === undefined) return;

    const checkOverflow = () => {
      if (isMobile) {
        setShouldCollapse(true);
        return;
      }

      // On desktop, default to not collapsed
      if (!tabListElement) {
        setShouldCollapse(false);
        return;
      }

      const containerWidth = tabListElement.offsetWidth;
      const tabsArray = Array.from(tabListElement.children);
      
      if (tabsArray.length === 0) {
        setShouldCollapse(false);
        return;
      }

      const tabsWidth = tabsArray.reduce(
        (sum, tab) => sum + tab.offsetWidth + TAB_GAP,
        0
      );

      // Collapse if tabs overflow with safety margin
      setShouldCollapse(tabsWidth > containerWidth - OVERFLOW_MARGIN);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkOverflow, DOM_READY_DELAY);
    
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (tabListElement) {
      resizeObserver.observe(tabListElement);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [isMobile, tabLabels, tabListElement]);

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
  }, [index, tabIndex]);

  // Get the current tab label
  const currentTabLabel = tabLabels[tabIndex]?.label || `Tab ${tabIndex + 1}`;

  // Transform children based on collapse state
  const renderChildren = () => {
    return Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      
      // For TabList, handle responsive behavior
      if (child.type === TabList) {
        if (shouldCollapse && tabLabels.length > 0) {
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
                <Portal>
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
                        textTransform="lowercase"
                      >
                        {tab.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Portal>
              </Menu>
            </Box>
          );
        } else {
          // Desktop: Show as normal tabs with callback ref
          return cloneElement(child, {
            ref: (element) => {
              tabListRef.current = element;
              setTabListElement(element);
            }
          });
        }
      }
      
      // For other children (TabPanels), pass through
      return child;
    });
  };

  return (
    <Box ref={containerRef} w="full">
      <Tabs
        {...tabsProps}
        index={tabIndex}
        onChange={handleTabChange}
      >
        {renderChildren()}
      </Tabs>
    </Box>
  );
};

export default ResponsiveTabs;
