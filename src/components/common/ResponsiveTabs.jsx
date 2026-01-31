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
  Portal,
  TabIndicator,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { Children, cloneElement, useMemo, useEffect, useState } from "react";

/**
 * ResponsiveTabs - A responsive tabs component
 *
 * On mobile (base): Displays a dropdown menu to select tabs
 * On desktop (md+): Displays normal tabs with horizontal scrolling
 *
 * Usage:
 * <ResponsiveTabs index={tabIndex} onChange={handleChange}>
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

export const ResponsiveTabs = ({
  children,
  index,
  onChange,
  colorScheme = "brandPrimary",
  ...props
}) => {
  const bg = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.200`);
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { ssr: false },
  );

  // Force re-render after mount to ensure TabIndicator calculates width correctly
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Slight delay to ensure DOM is fully rendered
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Extract tab labels and panels from children - memoized to prevent unnecessary recalculation
  const { tabs, tabListElement, tabPanelsElement } = useMemo(() => {
    const childArray = Children.toArray(children);
    const tabListEl = childArray.find(
      (child) => child.type === ResponsiveTabList,
    );
    const tabPanelsEl = childArray.find(
      (child) => child.type === ResponsiveTabPanels,
    );

    const tabsArray = tabListEl
      ? Children.toArray(tabListEl.props.children)
      : [];

    return {
      tabs: tabsArray,
      tabListElement: tabListEl,
      tabPanelsElement: tabPanelsEl,
    };
  }, [children]);

  const handleTabsChange = (newIndex) => {
    if (onChange) {
      onChange(newIndex);
    }
  };

  return (
    <Tabs
      isLazy
      index={index}
      onChange={handleTabsChange}
      colorScheme={colorScheme}
      {...props}
    >
      {/* Mobile Dropdown Menu */}
      {isMobile === true && (
        <Box>
          <Menu isLazy matchWidth>
            <MenuButton
              as={Button}
              variant="tabBtn"
              {...{ colorScheme }}
              rightIcon={<FiChevronDown />}
            >
              {tabs[index]?.props?.children || `Tab ${index + 1}`}
            </MenuButton>
            <Portal>
              <MenuList>
                {tabs.map((tab, idx) => (
                  <MenuItem
                    key={idx}
                    onClick={() => handleTabsChange(idx)}
                    bg={index === idx ? `${colorScheme}.50` : "transparent"}
                    fontWeight={index === idx ? "semibold" : "normal"}
                  >
                    {tab.props.children}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      )}

      {/* Desktop Tabs */}
      {isMobile === false && tabListElement && cloneElement(tabListElement)}
      {/* TabIndicator - only render after mount to ensure proper width calculation */}
      {mounted && isMobile === false && (
        <TabIndicator
          bg={bg}
          h="2px"
          borderRadius="1px"
          transition="all 0.2s"
        />
      )}
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
