import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const baseStyle = definePartsStyle(() => {
  return {
    root: {
      width: "100%",
    },
    tablist: {
      // Desktop: scrollable tabs
      display: { base: "none", md: "flex" },
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",
      flexWrap: "nowrap",
      // Hide scrollbar but keep functionality
      scrollbarWidth: "thin",
      "&::-webkit-scrollbar": {
        height: "4px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "gray.300",
        borderRadius: "full",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "gray.400",
      },
    },
    tab: {
      fontWeight: "semibold",
      fontFamily: "heading",
      textTransform: "lowercase",
      flexShrink: 0,
      // Add some padding for better touch targets
      px: 4,
      py: 2,
    },
    tabpanel: {
      p: 4,
    },
  };
});

// Define variants - ensuring the line variant has an indicator
const variants = {
  line: definePartsStyle((props) => {
    const { colorScheme: c } = props;
    return {
      tablist: {
        borderBottom: "2px solid",
        borderColor: "inherit",
      },
      tab: {
        borderBottom: "2px solid",
        borderColor: "transparent",
        mb: "-2px",
        _selected: {
          color: `${c}.600`,
          borderColor: "currentColor",
        },
        _active: {
          bg: "gray.100",
        },
        _disabled: {
          opacity: 0.4,
          cursor: "not-allowed",
        },
      },
    };
  }),
};

export const tabsTheme = defineMultiStyleConfig({ 
  baseStyle,
  variants,
  defaultProps: {
    variant: "line",
    colorScheme: "brandPrimary",
  },
});
