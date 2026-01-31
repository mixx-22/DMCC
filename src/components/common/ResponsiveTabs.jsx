import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { useState, Children, cloneElement } from "react";

/**
 * ResponsiveTabs - A responsive tabs component
 * 
 * On mobile (base): Displays a dropdown menu to select tabs
 * On desktop (md+): Displays normal tabs with horizontal scrolling
 * 
 * Usage:
 * <ResponsiveTabs defaultIndex={0}>
 *   <ResponsiveTabList>
 *     <ResponsiveTab>Tab 1</ResponsiveTab>
 *     <ResponsiveTab>Tab 2</ResponsiveTab>
 *     <ResponsiveTab>Tab 3</ResponsiveTab>
 *   </ResponsiveTabList>
 *   <ResponsiveTabPanels>
 *     <ResponsiveTabPanel>Content 1</ResponsiveTabPanel>
 *     <ResponsiveTabPanel>Content 2</ResponsiveTabPanel>
 *     <ResponsiveTabPanel>Content 3</ResponsiveTabPanel>
 *   </ResponsiveTabPanels>
 * </ResponsiveTabs>
 */

export const ResponsiveTabs = ({ children, defaultIndex = 0, colorScheme = "brandPrimary", ...props }) => {
  const [tabIndex, setTabIndex] = useState(defaultIndex);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Extract tab labels and panels from children
  const childArray = Children.toArray(children);
  const tabListElement = childArray.find(
    (child) => child.type === ResponsiveTabList
  );
  const tabPanelsElement = childArray.find(
    (child) => child.type === ResponsiveTabPanels
  );

  const tabs = tabListElement
    ? Children.toArray(tabListElement.props.children)
    : [];

  const handleTabsChange = (index) => {
    setTabIndex(index);
    if (props.onChange) {
      props.onChange(index);
    }
  };

  return (
    <Tabs
      index={tabIndex}
      onChange={handleTabsChange}
      colorScheme={colorScheme}
      {...props}
    >
      {/* Mobile Dropdown Menu */}
      {isMobile && (
        <Box mb={4}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiChevronDown />}
              width="100%"
              textAlign="left"
              colorScheme={colorScheme}
              variant="outline"
            >
              {tabs[tabIndex]?.props?.children || `Tab ${tabIndex + 1}`}
            </MenuButton>
            <MenuList width="full">
              {tabs.map((tab, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleTabsChange(index)}
                  bg={tabIndex === index ? `${colorScheme}.50` : "transparent"}
                  fontWeight={tabIndex === index ? "semibold" : "normal"}
                >
                  {tab.props.children}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Box>
      )}

      {/* Desktop Tabs */}
      {!isMobile && tabListElement && cloneElement(tabListElement)}

      {/* Tab Panels (both mobile and desktop) */}
      {tabPanelsElement && cloneElement(tabPanelsElement)}
    </Tabs>
  );
};

export const ResponsiveTabList = ({ children, ...props }) => {
  return <TabList {...props}>{children}</TabList>;
};

export const ResponsiveTab = ({ children, ...props }) => {
  return <Tab {...props}>{children}</Tab>;
};

export const ResponsiveTabPanels = ({ children, ...props }) => {
  return <TabPanels {...props}>{children}</TabPanels>;
};

export const ResponsiveTabPanel = ({ children, ...props }) => {
  return <TabPanel {...props}>{children}</TabPanel>;
};

// Default export for convenience
export default ResponsiveTabs;
